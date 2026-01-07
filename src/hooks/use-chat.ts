"use client";

import { useState, useCallback, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import type { Message, SearchResult, SearchImage } from "@/types";
import { generateId } from "@/lib/utils";

interface SearchResponse {
  webResults: SearchResult[];
  imageResults: SearchImage[];
}

interface UseChatOptions {
  onError?: (error: Error) => void;
}

export function useChat(options?: UseChatOptions) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [latestSearchResults, setLatestSearchResults] = useState<SearchResponse | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const searchMutation = useMutation({
    mutationFn: async (query: string): Promise<SearchResponse> => {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error("Search failed");
      }

      return response.json();
    },
  });

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isStreaming) return;

      // Create user message
      const userMessage: Message = {
        id: generateId(),
        role: "user",
        content: content.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);

      // Create assistant message placeholder
      const assistantMessageId = generateId();
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        isStreaming: true,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsStreaming(true);

      try {
        let searchResults: SearchResult[] | undefined;
        let searchImages: SearchImage[] | undefined;

        // If in search mode, fetch search results first
        if (isSearchMode) {
          const searchResponse = await searchMutation.mutateAsync(content);
          searchResults = searchResponse.webResults;
          searchImages = searchResponse.imageResults;

          // Store the latest search results for tab navigation
          setLatestSearchResults(searchResponse);

          // Update assistant message with search results
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? {
                    ...msg,
                    searchResults: searchResults?.map((r) => ({
                      ...r,
                      images: searchImages,
                    })),
                  }
                : msg
            )
          );
        }

        // Prepare messages for API
        const apiMessages = messages
          .filter((msg) => msg.role !== "system")
          .map((msg) => ({
            role: msg.role,
            content: msg.content,
          }));

        // Add user message and search context if available
        let userContent = content;
        if (isSearchMode && searchResults && searchResults.length > 0) {
          const searchContext = searchResults
            .map(
              (r, i) =>
                `[${i + 1}] ${r.title}\nURL: ${r.url}\n${r.snippet}`
            )
            .join("\n\n");

          userContent = `User query: "${content}"\n\nSearch Results:\n${searchContext}\n\nPlease provide a comprehensive response based on these search results.`;
        }

        apiMessages.push({ role: "user", content: userContent });

        // Create abort controller for cancellation
        abortControllerRef.current = new AbortController();

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: apiMessages,
            isSearchMode,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error("Chat request failed");
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error("No response body");
        }

        let fullContent = "";

        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);

              if (data === "[DONE]") {
                break;
              }

              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  fullContent += parsed.content;

                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMessageId
                        ? { ...msg, content: fullContent }
                        : msg
                    )
                  );
                }
              } catch {
                // Ignore JSON parse errors for incomplete chunks
              }
            }
          }
        }

        // Mark streaming as complete
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, isStreaming: false }
              : msg
          )
        );
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          // Request was cancelled
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? {
                    ...msg,
                    content: msg.content || "Response cancelled.",
                    isStreaming: false,
                  }
                : msg
            )
          );
        } else {
          // Handle other errors
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? {
                    ...msg,
                    content: "Sorry, an error occurred. Please try again.",
                    isStreaming: false,
                  }
                : msg
            )
          );
          options?.onError?.(
            error instanceof Error ? error : new Error("Unknown error")
          );
        }
      } finally {
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    [messages, isStreaming, isSearchMode, searchMutation, options]
  );

  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setLatestSearchResults(null);
  }, []);

  const toggleSearchMode = useCallback(() => {
    setIsSearchMode((prev) => !prev);
  }, []);

  return {
    messages,
    isStreaming,
    isSearchMode,
    isSearching: searchMutation.isPending,
    latestSearchResults,
    sendMessage,
    stopStreaming,
    clearMessages,
    toggleSearchMode,
    setIsSearchMode,
  };
}
