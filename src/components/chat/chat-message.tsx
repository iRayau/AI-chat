"use client";

import { memo } from "react";
import { User, Bot, ExternalLink } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Message } from "@/types";

interface ChatMessageProps {
  message: Message;
  userImage?: string | null;
  hideSearchResults?: boolean;
}

function ChatMessageComponent({ message, userImage, hideSearchResults }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "message-fade-in flex gap-4 px-4 py-6",
        isUser ? "bg-transparent" : "bg-muted/30"
      )}
    >
      <div className="flex-shrink-0">
        {isUser ? (
          <Avatar className="h-8 w-8">
            {userImage && <AvatarImage src={userImage} alt="User" />}
            <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white">
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        ) : (
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
              <Bot className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        )}
      </div>

      <div className="flex-1 min-w-0 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {isUser ? "You" : "AI Chat"}
          </span>
          {message.isStreaming && (
            <span className="text-xs text-muted-foreground animate-pulse">
              typing...
            </span>
          )}
        </div>

        {/* Message Content */}
        <div
          className={cn(
            "prose-chat text-sm leading-relaxed",
            message.isStreaming && !message.content && "text-muted-foreground"
          )}
        >
          {message.content ? (
            <MessageContent content={message.content} />
          ) : message.isStreaming ? (
            <span className="flex items-center gap-2">
              <span className="inline-flex gap-1">
                <span className="h-2 w-2 rounded-full bg-current animate-bounce [animation-delay:-0.3s]" />
                <span className="h-2 w-2 rounded-full bg-current animate-bounce [animation-delay:-0.15s]" />
                <span className="h-2 w-2 rounded-full bg-current animate-bounce" />
              </span>
            </span>
          ) : null}
          {message.isStreaming && message.content && (
            <span className="typing-cursor" />
          )}
        </div>
      </div>
    </div>
  );
}

function MessageContent({ content }: { content: string }) {
  // Simple markdown-like rendering
  const lines = content.split("\n");

  return (
    <div className="space-y-2">
      {lines.map((line, index) => {
        // Code block detection
        if (line.startsWith("```")) {
          return null; // Handle code blocks separately
        }

        // Headers
        if (line.startsWith("### ")) {
          return (
            <h3 key={index} className="text-base font-semibold mt-4 mb-2">
              {line.slice(4)}
            </h3>
          );
        }
        if (line.startsWith("## ")) {
          return (
            <h2 key={index} className="text-lg font-semibold mt-4 mb-2">
              {line.slice(3)}
            </h2>
          );
        }
        if (line.startsWith("# ")) {
          return (
            <h1 key={index} className="text-xl font-semibold mt-4 mb-2">
              {line.slice(2)}
            </h1>
          );
        }

        // Bullet points
        if (line.startsWith("- ") || line.startsWith("* ")) {
          return (
            <li key={index} className="ml-4 list-disc">
              <InlineFormatting text={line.slice(2)} />
            </li>
          );
        }

        // Numbered lists
        if (/^\d+\.\s/.test(line)) {
          const match = line.match(/^(\d+)\.\s(.*)$/);
          if (match) {
            return (
              <li key={index} className="ml-4 list-decimal">
                <InlineFormatting text={match[2]} />
              </li>
            );
          }
        }

        // Empty lines
        if (!line.trim()) {
          return <div key={index} className="h-2" />;
        }

        // Regular paragraphs
        return (
          <p key={index}>
            <InlineFormatting text={line} />
          </p>
        );
      })}
    </div>
  );
}

function InlineFormatting({ text }: { text: string }) {
  // Handle inline code
  const parts = text.split(/(`[^`]+`)/g);

  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code
              key={index}
              className="px-1.5 py-0.5 rounded bg-muted font-mono text-sm"
            >
              {part.slice(1, -1)}
            </code>
          );
        }

        // Handle bold
        const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
        return boldParts.map((boldPart, boldIndex) => {
          if (boldPart.startsWith("**") && boldPart.endsWith("**")) {
            return (
              <strong key={`${index}-${boldIndex}`}>
                {boldPart.slice(2, -2)}
              </strong>
            );
          }

          // Handle links
          const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
          const linkParts = boldPart.split(linkRegex);

          if (linkParts.length > 1) {
            const result = [];
            for (let i = 0; i < linkParts.length; i += 3) {
              if (linkParts[i]) {
                result.push(linkParts[i]);
              }
              if (linkParts[i + 1] && linkParts[i + 2]) {
                result.push(
                  <a
                    key={`${index}-${boldIndex}-${i}`}
                    href={linkParts[i + 2]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-600 underline underline-offset-2 inline-flex items-center gap-1"
                  >
                    {linkParts[i + 1]}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                );
              }
            }
            return <span key={`${index}-${boldIndex}`}>{result}</span>;
          }

          return boldPart;
        });
      })}
    </>
  );
}

export const ChatMessage = memo(ChatMessageComponent);
