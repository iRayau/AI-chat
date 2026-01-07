"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Send, Square, Search, MessageCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  onStop: () => void;
  isStreaming: boolean;
  isSearchMode: boolean;
  onToggleSearchMode: () => void;
  disabled?: boolean;
}

export function ChatInput({
  onSend,
  onStop,
  isStreaming,
  isSearchMode,
  onToggleSearchMode,
  disabled,
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(() => {
    if (input.trim() && !isStreaming && !disabled) {
      onSend(input.trim());
      setInput("");
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  }, [input, isStreaming, disabled, onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [input]);

  // Focus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  return (
    <TooltipProvider>
      <div className="relative">
        <div
          className={cn(
            "flex items-end gap-2 rounded-2xl border bg-background/80 backdrop-blur-sm p-3 shadow-lg transition-all duration-200",
            "focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20",
            isSearchMode && "border-blue-500/50 ring-2 ring-blue-500/20"
          )}
        >
          {/* Mode Toggle */}
          <div className="flex items-center gap-1 pb-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-9 w-9 rounded-xl transition-all duration-200",
                    !isSearchMode
                      ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-md shadow-emerald-500/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                  onClick={() => isSearchMode && onToggleSearchMode()}
                >
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Chat Mode</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-9 w-9 rounded-xl transition-all duration-200",
                    isSearchMode
                      ? "bg-blue-500 text-white hover:bg-blue-600 shadow-md shadow-blue-500/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                  onClick={() => !isSearchMode && onToggleSearchMode()}
                >
                  <Search className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Search Mode</TooltipContent>
            </Tooltip>
          </div>

          {/* Input Area */}
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isSearchMode
                  ? "Search the web..."
                  : "Message AI Chat..."
              }
              className={cn(
                "min-h-[44px] max-h-[200px] w-full resize-none border-0 bg-transparent p-2 text-sm",
                "placeholder:text-muted-foreground/60 focus-visible:ring-0 focus-visible:outline-none"
              )}
              rows={1}
              disabled={disabled}
            />
          </div>

          {/* Send/Stop Button */}
          <div className="pb-1">
            {isStreaming ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    className="h-9 w-9 rounded-xl"
                    onClick={onStop}
                  >
                    <Square className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">Stop generating</TooltipContent>
              </Tooltip>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    size="icon"
                    className={cn(
                      "h-9 w-9 rounded-xl transition-all duration-200",
                      input.trim()
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-muted text-muted-foreground"
                    )}
                    onClick={handleSend}
                    disabled={!input.trim() || disabled}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">Send message</TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>

        {/* Mode Indicator */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2">
          <div
            className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 shadow-sm",
              isSearchMode
                ? "bg-blue-500 text-white"
                : "bg-emerald-500 text-white"
            )}
          >
            {isSearchMode ? (
              <>
                <Search className="h-3 w-3" />
                <span>Search Mode</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3 w-3" />
                <span>Chat Mode</span>
              </>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
