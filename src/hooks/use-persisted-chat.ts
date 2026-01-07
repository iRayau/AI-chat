"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import type { Message, SearchResult, SearchImage } from "@/types";
import { generateId } from "@/lib/utils";

interface SearchResponse {
  webResults: SearchResult[];
  imageResults: SearchImage[];
}

interface ChatFromDB {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface MessageFromDB {
  id: string;
  chat_id: string;
  user_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  search_results: SearchResult[] | null;
  search_images: SearchImage[] | null;
  created_at: string;
}

interface UsePersistedChatOptions {
  onError?: (error: Error) => void;
  onStreamingStart?: () => void;
  onStreamingEnd?: () => void;
}

export function usePersistedChat(options?: UsePersistedChatOptions) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [latestSearchResults, setLatestSearchResults] =
    useState<SearchResponse | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch user's chats
  const {
    data: chatsData,
    isLoading: isLoadingChats,
    refetch: refetchChats,
  } = useQuery({
    queryKey: ["chats"],
    queryFn: async () => {
      const response = await fetch("/api/chats");
      if (!response.ok) throw new Error("Failed to fetch chats");
      return response.json();
    },
    enabled: !!session?.user,
  });

  // Fetch messages for current chat
  const { data: messagesData, isLoading: isLoadingMessages } = useQuery({
    queryKey: ["messages", currentChatId],
    queryFn: async () => {
      if (!currentChatId) return { messages: [] };
      const response = await fetch(`/api/chats/${currentChatId}/messages`);
      if (!response.ok) throw new Error("Failed to fetch messages");
      return response.json();
    },
    enabled: !!currentChatId && !!session?.user,
  });

  // Load messages when chat changes
  useEffect(() => {
    if (messagesData?.messages) {
      const loadedMessages: Message[] = messagesData.messages.map(
        (msg: MessageFromDB) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.created_at),
          searchResults: msg.search_results || undefined,
          searchImages: msg.search_images || undefined,
        })
      );
      setMessages(loadedMessages);

      // Set latest search results from the last assistant message with search results
      const lastSearchMessage = [...loadedMessages]
        .reverse()
        .find(
          (m) =>
            m.role === "assistant" &&
            (m.searchResults?.length || m.searchImages?.length)
        );

      if (lastSearchMessage) {
        setLatestSearchResults({
          webResults: lastSearchMessage.searchResults || [],
          imageResults: lastSearchMessage.searchImages || [],
        });
      } else {
        setLatestSearchResults(null);
      }
    }
  }, [messagesData]);

  // Generate title mutation
  const generateTitleMutation = useMutation({
    mutationFn: async (message: string): Promise<string> => {
      const response = await fetch("/api/generate-title", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      if (!response.ok) return "New Chat";
      const data = await response.json();
      return data.title || "New Chat";
    },
  });

  // Update chat title mutation
  const updateTitleMutation = useMutation({
    mutationFn: async ({ chatId, title }: { chatId: string; title: string }) => {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!response.ok) throw new Error("Failed to update title");
      return response.json();
    },
    onSuccess: () => {
      refetchChats();
    },
  });

  // Create new chat mutation with optimistic update
  const createChatMutation = useMutation({
    mutationFn: async (firstMessage: string) => {
      const response = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New Chat", firstMessage }),
      });
      if (!response.ok) throw new Error("Failed to create chat");
      return response.json();
    },
    onSuccess: (data) => {
      const newChat = data.chat;
      setCurrentChatId(newChat.id);
      
      // Optimistically add the new chat to the cache immediately
      queryClient.setQueryData(["chats"], (oldData: { chats: ChatFromDB[] } | undefined) => {
        if (!oldData) return { chats: [newChat] };
        // Add new chat at the beginning of the list
        return {
          ...oldData,
          chats: [newChat, ...oldData.chats],
        };
      });
    },
  });

  // Add message mutation
  const addMessageMutation = useMutation({
    mutationFn: async (messageData: {
      chatId: string;
      role: "user" | "assistant";
      content: string;
      searchResults?: SearchResult[];
      searchImages?: SearchImage[];
    }) => {
      const response = await fetch(
        `/api/chats/${messageData.chatId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            role: messageData.role,
            content: messageData.content,
            searchResults: messageData.searchResults,
            searchImages: messageData.searchImages,
          }),
        }
      );
      if (!response.ok) throw new Error("Failed to add message");
      return response.json();
    },
    onSuccess: () => {
      // Refetch chats to update the sidebar (updated_at will change)
      refetchChats();
    },
  });

  // Delete chat mutation
  const deleteChatMutation = useMutation({
    mutationFn: async (chatId: string) => {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete chat");
      return response.json();
    },
    onMutate: async (chatId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["chats"] });

      // Snapshot current value
      const previousChats = queryClient.getQueryData(["chats"]);

      // Optimistically remove the chat
      queryClient.setQueryData(["chats"], (oldData: { chats: ChatFromDB[] } | undefined) => {
        if (!oldData) return { chats: [] };
        return {
          ...oldData,
          chats: oldData.chats.filter((chat) => chat.id !== chatId),
        };
      });

      return { previousChats };
    },
    onError: (err, chatId, context) => {
      // Rollback on error
      if (context?.previousChats) {
        queryClient.setQueryData(["chats"], context.previousChats);
      }
    },
    onSuccess: (_, deletedChatId) => {
      // If the deleted chat was the current one, clear the state
      if (deletedChatId === currentChatId) {
        setCurrentChatId(null);
        setMessages([]);
        setLatestSearchResults(null);
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      refetchChats();
    },
  });

  // Search mutation
  const searchMutation = useMutation({
    mutationFn: async (query: string): Promise<SearchResponse> => {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      if (!response.ok) throw new Error("Search failed");
      return response.json();
    },
  });

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isStreaming) return;

      let chatId = currentChatId;
      let isNewChat = false;

      // Create a new chat if there isn't one
      if (!chatId) {
        try {
          isNewChat = true;
          const result = await createChatMutation.mutateAsync(content);
          chatId = result.chat.id;
        } catch (error) {
          console.error("Failed to create chat:", error);
          options?.onError?.(
            error instanceof Error ? error : new Error("Failed to create chat")
          );
          return;
        }
      }

      // Create user message
      const userMessageId = generateId();
      const userMessage: Message = {
        id: userMessageId,
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

      // Notify that streaming has started (for scroll)
      options?.onStreamingStart?.();

      try {
        let searchResults: SearchResult[] | undefined;
        let searchImages: SearchImage[] | undefined;

        // If in search mode, fetch search results first
        if (isSearchMode) {
          const searchResponse = await searchMutation.mutateAsync(content);
          searchResults = searchResponse.webResults;
          searchImages = searchResponse.imageResults;

          setLatestSearchResults(searchResponse);

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? {
                    ...msg,
                    searchResults: searchResults,
                    searchImages: searchImages,
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

        let userContent = content;
        if (isSearchMode && searchResults && searchResults.length > 0) {
          const searchContext = searchResults
            .map(
              (r, i) => `[${i + 1}] ${r.title}\nURL: ${r.url}\n${r.snippet}`
            )
            .join("\n\n");
          userContent = `User query: "${content}"\n\nSearch Results:\n${searchContext}\n\nPlease provide a comprehensive response based on these search results.`;
        }

        apiMessages.push({ role: "user", content: userContent });

        abortControllerRef.current = new AbortController();

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: apiMessages, isSearchMode }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) throw new Error("Chat request failed");

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) throw new Error("No response body");

        let fullContent = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") break;

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
                // Ignore parse errors
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

        // Notify that streaming has ended
        options?.onStreamingEnd?.();

        // Save messages to database
        if (chatId) {
          // Save user message
          await addMessageMutation.mutateAsync({
            chatId,
            role: "user",
            content: content.trim(),
          });

          // Save assistant message
          await addMessageMutation.mutateAsync({
            chatId,
            role: "assistant",
            content: fullContent,
            searchResults,
            searchImages,
          });

          // Generate and update title for new chats
          if (isNewChat) {
            try {
              const generatedTitle = await generateTitleMutation.mutateAsync(content);
              
              // Optimistically update the title in the cache
              queryClient.setQueryData(["chats"], (oldData: { chats: ChatFromDB[] } | undefined) => {
                if (!oldData) return oldData;
                return {
                  ...oldData,
                  chats: oldData.chats.map((chat) =>
                    chat.id === chatId ? { ...chat, title: generatedTitle } : chat
                  ),
                };
              });
              
              await updateTitleMutation.mutateAsync({
                chatId,
                title: generatedTitle,
              });
            } catch (error) {
              console.error("Failed to generate title:", error);
              // Non-critical error, don't block the flow
            }
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
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
        options?.onStreamingEnd?.();
      } finally {
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    [
      messages,
      isStreaming,
      isSearchMode,
      currentChatId,
      searchMutation,
      createChatMutation,
      addMessageMutation,
      generateTitleMutation,
      updateTitleMutation,
      queryClient,
      options,
    ]
  );

  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const clearMessages = useCallback(() => {
    if (currentChatId) {
      deleteChatMutation.mutate(currentChatId);
    } else {
      setMessages([]);
      setLatestSearchResults(null);
    }
  }, [currentChatId, deleteChatMutation]);

  const deleteChat = useCallback(
    (chatId: string) => {
      deleteChatMutation.mutate(chatId);
    },
    [deleteChatMutation]
  );

  const newChat = useCallback(() => {
    setCurrentChatId(null);
    setMessages([]);
    setLatestSearchResults(null);
  }, []);

  const selectChat = useCallback((chatId: string) => {
    setCurrentChatId(chatId);
  }, []);

  const toggleSearchMode = useCallback(() => {
    setIsSearchMode((prev) => !prev);
  }, []);

  return {
    // State
    messages,
    isStreaming,
    isSearchMode,
    isSearching: searchMutation.isPending,
    latestSearchResults,
    currentChatId,
    chats: chatsData?.chats || [],
    isLoadingChats,
    isLoadingMessages,
    isDeletingChat: deleteChatMutation.isPending,

    // Actions
    sendMessage,
    stopStreaming,
    clearMessages,
    deleteChat,
    newChat,
    selectChat,
    toggleSearchMode,
    setIsSearchMode,
  };
}
