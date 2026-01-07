"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Trash2, Plus, Sparkles, Home, MessageCircle, Globe, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { UserMenu } from "./user-menu";
import { SearchResultsView } from "./search-results-view";
import { ImagesView } from "./images-view";
import { useChat } from "@/hooks/use-chat";
import { cn } from "@/lib/utils";

type TabType = "home" | "chat" | "search" | "images";

export function ChatInterface() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const {
    messages,
    isStreaming,
    isSearchMode,
    isSearching,
    sendMessage,
    stopStreaming,
    clearMessages,
    toggleSearchMode,
    latestSearchResults,
  } = useChat();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const isEmpty = messages.length === 0;
  const hasMessages = messages.length > 0;
  const hasSearchResults = latestSearchResults && latestSearchResults.webResults.length > 0;
  const hasImages = latestSearchResults && latestSearchResults.imageResults.length > 0;

  const tabs: { id: TabType; label: string; icon: React.ReactNode; enabled: boolean }[] = [
    { id: "home", label: "Home", icon: <Home className="h-4 w-4" />, enabled: true },
    { id: "chat", label: "Chat", icon: <MessageCircle className="h-4 w-4" />, enabled: hasMessages },
    { id: "search", label: "Search", icon: <Globe className="h-4 w-4" />, enabled: hasSearchResults || false },
    { id: "images", label: "Images", icon: <ImageIcon className="h-4 w-4" />, enabled: hasImages || false },
  ];

  return (
    <TooltipProvider>
      <div className="flex h-screen flex-col bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold tracking-tight">AI Chat</h1>
                <p className="text-xs text-muted-foreground">Powered by AI</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-lg"
                    onClick={() => {
                      clearMessages();
                      setActiveTab("home");
                    }}
                    disabled={isEmpty}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>New chat</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-lg text-muted-foreground hover:text-destructive"
                    onClick={() => {
                      clearMessages();
                      setActiveTab("home");
                    }}
                    disabled={isEmpty}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Clear chat</TooltipContent>
              </Tooltip>

              <UserMenu />
            </div>
          </div>

          {/* Centered Tab Navigation */}
          <div className="flex items-center justify-center gap-1 px-4 pb-3">
            {tabs.map((tab) => (
              <Tooltip key={tab.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => tab.enabled && setActiveTab(tab.id)}
                    disabled={!tab.enabled}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      activeTab === tab.id
                        ? "bg-primary text-primary-foreground shadow-md"
                        : tab.enabled
                          ? "text-muted-foreground hover:text-foreground hover:bg-muted"
                          : "text-muted-foreground/40 cursor-not-allowed opacity-50"
                    )}
                  >
                    {tab.icon}
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                </TooltipTrigger>
                {!tab.enabled && (
                  <TooltipContent>
                    {tab.id === "chat" && "Start a conversation first"}
                    {tab.id === "search" && "Search results will appear here"}
                    {tab.id === "images" && "Image results will appear here"}
                  </TooltipContent>
                )}
              </Tooltip>
            ))}
          </div>
        </header>

        {/* Content Area */}
        <ScrollArea ref={scrollAreaRef} className="flex-1">
          <div className="mx-auto max-w-4xl">
            {/* Home Tab - Shows everything */}
            {activeTab === "home" && (
              <>
                {isEmpty ? (
                  <EmptyState
                    isSearchMode={isSearchMode}
                    onExampleClick={sendMessage}
                  />
                ) : (
                  <div className="pb-32">
                    {/* Search Results Preview */}
                    {(hasSearchResults || hasImages) && (
                      <div className="px-4 py-4 border-b">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            Search Results
                          </h3>
                          <div className="flex gap-2">
                            {hasSearchResults && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setActiveTab("search")}
                                className="text-xs"
                              >
                                View Sources ({latestSearchResults?.webResults.length})
                              </Button>
                            )}
                            {hasImages && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setActiveTab("images")}
                                className="text-xs"
                              >
                                View Images ({latestSearchResults?.imageResults.length})
                              </Button>
                            )}
                          </div>
                        </div>
                        {/* Quick preview of images */}
                        {hasImages && latestSearchResults && (
                          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-3">
                            {latestSearchResults.imageResults.slice(0, 6).map((img, idx) => (
                              <button
                                key={idx}
                                onClick={() => setActiveTab("images")}
                                className="aspect-square rounded-lg overflow-hidden bg-muted hover:opacity-80 transition-opacity"
                              >
                                <img
                                  src={img.thumbnail || img.url}
                                  alt={img.title}
                                  className="w-full h-full object-cover"
                                />
                              </button>
                            ))}
                          </div>
                        )}
                        {/* Quick preview of sources */}
                        {hasSearchResults && latestSearchResults && (
                          <div className="flex flex-wrap gap-2">
                            {latestSearchResults.webResults.slice(0, 4).map((result, idx) => {
                              const domain = new URL(result.url).hostname.replace("www.", "");
                              return (
                                <a
                                  key={idx}
                                  href={result.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-xs hover:bg-accent transition-colors"
                                >
                                  <Globe className="h-3 w-3" />
                                  {domain}
                                </a>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Chat Messages */}
                    {messages.map((message) => (
                      <ChatMessage
                        key={message.id}
                        message={message}
                        userImage={session?.user?.image}
                      />
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </>
            )}

            {/* Chat Tab - Shows only chat messages */}
            {activeTab === "chat" && (
              <>
                {isEmpty ? (
                  <div className="flex min-h-[60vh] items-center justify-center">
                    <div className="text-center">
                      <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                      <p className="text-muted-foreground">No chat messages yet</p>
                      <p className="text-sm text-muted-foreground/70">Start a conversation below</p>
                    </div>
                  </div>
                ) : (
                  <div className="pb-32">
                    {messages.map((message) => (
                      <ChatMessage
                        key={message.id}
                        message={message}
                        userImage={session?.user?.image}
                        hideSearchResults
                      />
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </>
            )}

            {/* Search Tab - Shows only web results */}
            {activeTab === "search" && (
              <SearchResultsView
                results={latestSearchResults?.webResults || []}
                onBack={() => setActiveTab("home")}
              />
            )}

            {/* Images Tab - Shows only images */}
            {activeTab === "images" && (
              <ImagesView
                images={latestSearchResults?.imageResults || []}
                onBack={() => setActiveTab("home")}
              />
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="sticky bottom-0 border-t bg-gradient-to-t from-background via-background to-transparent pt-4 pb-6">
          <div className="mx-auto max-w-3xl px-4">
            {/* Searching Indicator */}
            {isSearching && (
              <div className="mb-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                <span>Searching the web...</span>
              </div>
            )}
            <ChatInput
              onSend={sendMessage}
              onStop={stopStreaming}
              isStreaming={isStreaming}
              isSearchMode={isSearchMode}
              onToggleSearchMode={toggleSearchMode}
            />
            <p className="mt-3 text-center text-xs text-muted-foreground">
              AI Chat can make mistakes. Consider checking important information.
            </p>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

interface EmptyStateProps {
  isSearchMode: boolean;
  onExampleClick: (message: string) => void;
}

function EmptyState({ isSearchMode, onExampleClick }: EmptyStateProps) {
  const chatExamples = [
    {
      title: "Explain quantum computing",
      description: "in simple terms",
      query: "Explain quantum computing in simple terms",
    },
    {
      title: "Write a Python function",
      description: "to sort a list of dictionaries",
      query: "Write a Python function to sort a list of dictionaries by a specific key",
    },
    {
      title: "Help me brainstorm",
      description: "ideas for a mobile app",
      query: "Help me brainstorm creative ideas for a productivity mobile app",
    },
    {
      title: "Explain the difference",
      description: "between REST and GraphQL",
      query: "Explain the difference between REST and GraphQL APIs with examples",
    },
  ];

  const searchExamples = [
    {
      title: "Latest news about",
      description: "AI developments",
      query: "Latest news about artificial intelligence developments 2024",
    },
    {
      title: "Best restaurants",
      description: "in New York City",
      query: "Best restaurants in New York City 2024",
    },
    {
      title: "Current weather",
      description: "in Tokyo",
      query: "Current weather forecast in Tokyo Japan",
    },
    {
      title: "Upcoming movies",
      description: "releasing this year",
      query: "Upcoming blockbuster movies releasing this year",
    },
  ];

  const examples = isSearchMode ? searchExamples : chatExamples;

  return (
    <div className="flex min-h-[calc(100vh-16rem)] flex-col items-center justify-center px-4 py-12">
      <div className="mb-8 flex flex-col items-center text-center">
        <div
          className={cn(
            "mb-6 flex h-20 w-20 items-center justify-center rounded-2xl shadow-xl",
            isSearchMode
              ? "bg-gradient-to-br from-blue-500 to-cyan-600 shadow-blue-500/20"
              : "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/20"
          )}
        >
          {isSearchMode ? (
            <Globe className="h-10 w-10 text-white" />
          ) : (
            <Sparkles className="h-10 w-10 text-white" />
          )}
        </div>
        <h2 className="text-2xl font-semibold tracking-tight">
          {isSearchMode ? "Search the Web" : "How can I help you today?"}
        </h2>
        <p className="mt-2 text-muted-foreground max-w-md">
          {isSearchMode
            ? "Search for real-time information from across the web with AI-powered insights."
            : "I'm your AI assistant. I can help you with coding, writing, analysis, and more."}
        </p>
      </div>

      <div className="grid w-full max-w-2xl gap-3 sm:grid-cols-2">
        {examples.map((example, index) => (
          <button
            key={index}
            onClick={() => onExampleClick(example.query)}
            className={cn(
              "group flex flex-col items-start gap-1 rounded-xl border p-4 text-left transition-all duration-200",
              "hover:border-primary/50 hover:bg-accent/50 hover:shadow-md",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            )}
          >
            <span className="text-sm font-medium group-hover:text-primary transition-colors">
              {example.title}
            </span>
            <span className="text-xs text-muted-foreground">
              {example.description}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
