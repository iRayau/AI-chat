"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  Sparkles,
  Home,
  MessageCircle,
  Globe,
  ImageIcon,
  Menu,
} from "lucide-react";
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
import { ChatSidebar } from "./chat-sidebar";
import { SearchResultsView } from "./search-results-view";
import { ImagesView } from "./images-view";
import { usePersistedChat } from "@/hooks/use-persisted-chat";
import { cn } from "@/lib/utils";

type TabType = "home" | "chat" | "search" | "images";

export function ChatInterface() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const hasScrolledRef = useRef(false);

  // Scroll to bottom function
  const scrollToBottom = useCallback((smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: smooth ? "smooth" : "instant",
        block: "end",
      });
    }
  }, []);

  const {
    messages,
    isStreaming,
    isSearchMode,
    isSearching,
    sendMessage,
    stopStreaming,
    deleteChat,
    newChat,
    selectChat,
    toggleSearchMode,
    latestSearchResults,
    currentChatId,
    chats,
    isLoadingChats,
  } = usePersistedChat({
    onStreamingStart: () => {
      // Reset the scroll flag and enable auto-scroll
      hasScrolledRef.current = false;
      setShouldAutoScroll(true);
    },
    onStreamingEnd: () => {
      setShouldAutoScroll(false);
    },
  });

  // Scroll once when streaming starts or when new messages arrive (not during streaming)
  useEffect(() => {
    if (shouldAutoScroll && !hasScrolledRef.current && messages.length > 0) {
      // Scroll once at the start of streaming
      scrollToBottom(true);
      hasScrolledRef.current = true;
    }
  }, [shouldAutoScroll, messages.length, scrollToBottom]);

  // Scroll when switching chats (loading existing chat)
  useEffect(() => {
    if (messages.length > 0 && !isStreaming) {
      // Small delay to allow content to render
      const timer = setTimeout(() => {
        scrollToBottom(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [currentChatId]); // Only when chat changes

  const isEmpty = messages.length === 0;
  const hasMessages = messages.length > 0;
  const hasSearchResults =
    latestSearchResults && latestSearchResults.webResults.length > 0;
  const hasImages =
    latestSearchResults && latestSearchResults.imageResults.length > 0;

  const tabs: {
    id: TabType;
    label: string;
    icon: React.ReactNode;
    enabled: boolean;
  }[] = [
    {
      id: "home",
      label: "Home",
      icon: <Home className="h-4 w-4" />,
      enabled: true,
    },
    {
      id: "chat",
      label: "Chat",
      icon: <MessageCircle className="h-4 w-4" />,
      enabled: hasMessages,
    },
    {
      id: "search",
      label: "Search",
      icon: <Globe className="h-4 w-4" />,
      enabled: hasSearchResults || false,
    },
    {
      id: "images",
      label: "Images",
      icon: <ImageIcon className="h-4 w-4" />,
      enabled: hasImages || false,
    },
  ];

  const handleDeleteChat = (chatId: string) => {
    deleteChat(chatId);
    if (chatId === currentChatId) {
      setActiveTab("home");
    }
  };

  const handleNewChat = () => {
    newChat();
    setActiveTab("home");
  };

  const handleSelectChat = (chatId: string) => {
    selectChat(chatId);
    setShowMobileSidebar(false);
    setActiveTab("home");
  };

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-background">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <ChatSidebar
            chats={chats}
            currentChatId={currentChatId}
            isLoading={isLoadingChats}
            onSelectChat={handleSelectChat}
            onNewChat={handleNewChat}
            onDeleteChat={handleDeleteChat}
          />
        </div>

        {/* Mobile Sidebar Overlay */}
        {showMobileSidebar && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setShowMobileSidebar(false)}
            />
            <div className="absolute left-0 top-0 bottom-0 w-72 bg-background shadow-xl">
              <ChatSidebar
                chats={chats}
                currentChatId={currentChatId}
                isLoading={isLoadingChats}
                onSelectChat={handleSelectChat}
                onNewChat={() => {
                  handleNewChat();
                  setShowMobileSidebar(false);
                }}
                onDeleteChat={handleDeleteChat}
              />
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-lg">
            <div className="flex h-16 items-center justify-between px-4 sm:px-6">
              {/* Left side */}
              <div className="flex items-center gap-3">
                {/* Mobile menu button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden h-9 w-9"
                  onClick={() => setShowMobileSidebar(true)}
                >
                  <Menu className="h-5 w-5" />
                </Button>

                {/* Logo */}
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div className="hidden sm:block">
                    <h1 className="text-lg font-semibold tracking-tight">
                      AI Chat
                    </h1>
                    <p className="text-xs text-muted-foreground">
                      Powered by AI
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <UserMenu />
              </div>
            </div>

            {/* Centered Tab Navigation */}
            <div className="flex items-center justify-center gap-1 px-4 pb-3">
              {tabs.map((tab) => {
                const getActiveStyles = () => {
                  if (activeTab !== tab.id) return "";
                  switch (tab.id) {
                    case "home":
                      return "bg-emerald-500 text-white shadow-md shadow-emerald-500/30";
                    case "chat":
                      return "bg-violet-500 text-white shadow-md shadow-violet-500/30";
                    case "search":
                      return "bg-blue-500 text-white shadow-md shadow-blue-500/30";
                    case "images":
                      return "bg-purple-500 text-white shadow-md shadow-purple-500/30";
                    default:
                      return "bg-primary text-primary-foreground shadow-md";
                  }
                };

                return (
                  <Tooltip key={tab.id}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => tab.enabled && setActiveTab(tab.id)}
                        disabled={!tab.enabled}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                          activeTab === tab.id
                            ? getActiveStyles()
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
                        {tab.id === "search" &&
                          "Search results will appear here"}
                        {tab.id === "images" &&
                          "Image results will appear here"}
                      </TooltipContent>
                    )}
                  </Tooltip>
                );
              })}
            </div>
          </header>

          {/* Content Area */}
          <ScrollArea className="flex-1" ref={scrollContainerRef}>
            <div className="mx-auto max-w-4xl">
              {/* Home Tab */}
              {activeTab === "home" && (
                <>
                  {isEmpty ? (
                    <EmptyState
                      isSearchMode={isSearchMode}
                      onExampleClick={sendMessage}
                    />
                  ) : (
                    <div className="pb-32">
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

              {/* Chat Tab */}
              {activeTab === "chat" && (
                <>
                  {isEmpty ? (
                    <div className="flex min-h-[60vh] items-center justify-center">
                      <div className="text-center">
                        <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                        <p className="text-muted-foreground">
                          No chat messages yet
                        </p>
                        <p className="text-sm text-muted-foreground/70">
                          Start a conversation below
                        </p>
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

              {/* Search Tab */}
              {activeTab === "search" && (
                <SearchResultsView
                  results={latestSearchResults?.webResults || []}
                  onBack={() => setActiveTab("home")}
                />
              )}

              {/* Images Tab */}
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
                AI Chat can make mistakes. Consider checking important
                information.
              </p>
            </div>
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
      query:
        "Write a Python function to sort a list of dictionaries by a specific key",
    },
    {
      title: "Help me brainstorm",
      description: "ideas for a mobile app",
      query: "Help me brainstorm creative ideas for a productivity mobile app",
    },
    {
      title: "Explain the difference",
      description: "between REST and GraphQL",
      query:
        "Explain the difference between REST and GraphQL APIs with examples",
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
