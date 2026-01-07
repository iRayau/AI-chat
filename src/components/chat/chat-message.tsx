"use client";

import { memo, useState } from "react";
import Image from "next/image";
import {
  User,
  Bot,
  ExternalLink,
  Globe,
  ImageIcon,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Message, SearchImage, SearchResult } from "@/types";

interface ChatMessageProps {
  message: Message;
  userImage?: string | null;
  hideSearchResults?: boolean;
}

function ChatMessageComponent({
  message,
  userImage,
  hideSearchResults,
}: ChatMessageProps) {
  const isUser = message.role === "user";
  const hasSearchResults =
    !hideSearchResults &&
    ((message.searchResults && message.searchResults.length > 0) ||
      (message.searchImages && message.searchImages.length > 0));

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

        {/* Search Results - Show with each message that has them */}
        {hasSearchResults && (
          <InlineSearchResults
            results={message.searchResults || []}
            images={message.searchImages || []}
          />
        )}

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

interface InlineSearchResultsProps {
  results: SearchResult[];
  images: SearchImage[];
}

function InlineSearchResults({ results, images }: InlineSearchResultsProps) {
  const [showAllSources, setShowAllSources] = useState(false);
  const [showAllImages, setShowAllImages] = useState(false);
  const [selectedImage, setSelectedImage] = useState<SearchImage | null>(null);

  const displayedSources = showAllSources ? results : results.slice(0, 3);
  const displayedImages = showAllImages ? images : images.slice(0, 4);

  return (
    <div className="space-y-3 mb-4">
      {/* Images Section */}
      {images.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ImageIcon className="h-3.5 w-3.5" />
            <span>Images ({images.length})</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {displayedImages.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(image)}
                className="group relative aspect-square rounded-lg overflow-hidden bg-muted border hover:border-primary/50 transition-all"
              >
                <Image
                  src={image.thumbnail || image.url}
                  alt={image.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                  unoptimized
                />
              </button>
            ))}
          </div>
          {images.length > 4 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllImages(!showAllImages)}
              className="text-xs h-7 text-muted-foreground"
            >
              {showAllImages ? (
                <>
                  <ChevronUp className="h-3 w-3 mr-1" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3 mr-1" />
                  Show {images.length - 4} more images
                </>
              )}
            </Button>
          )}
        </div>
      )}

      {/* Sources Section */}
      {results.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Globe className="h-3.5 w-3.5" />
            <span>Sources ({results.length})</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {displayedSources.map((result, index) => {
              const domain = new URL(result.url).hostname.replace("www.", "");
              return (
                <a
                  key={index}
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 px-3 py-2 rounded-lg bg-card border hover:border-primary/50 hover:bg-accent/50 transition-all max-w-[200px]"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded bg-muted flex-shrink-0">
                    <Globe className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium truncate group-hover:text-primary transition-colors">
                      {result.title}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {domain}
                    </p>
                  </div>
                  <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </a>
              );
            })}
          </div>
          {results.length > 3 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllSources(!showAllSources)}
              className="text-xs h-7 text-muted-foreground"
            >
              {showAllSources ? (
                <>
                  <ChevronUp className="h-3 w-3 mr-1" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3 mr-1" />
                  Show {results.length - 3} more sources
                </>
              )}
            </Button>
          )}
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <ImagePreviewModal
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
}

function ImagePreviewModal({
  image,
  onClose,
}: {
  image: SearchImage;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-3xl max-h-[80vh] w-full bg-card rounded-xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
        >
          ✕
        </button>
        <div className="relative aspect-video bg-muted">
          <Image
            src={image.url}
            alt={image.title}
            fill
            className="object-contain"
            unoptimized
          />
        </div>
        <div className="p-4 border-t">
          <h3 className="font-medium line-clamp-2 mb-1">{image.title}</h3>
          <p className="text-sm text-muted-foreground mb-3">{image.source}</p>
          <a
            href={image.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <ExternalLink className="h-4 w-4" />
            Open original
          </a>
        </div>
      </div>
    </div>
  );
}

function MessageContent({ content }: { content: string }) {
  const lines = content.split("\n");

  return (
    <div className="space-y-2">
      {lines.map((line, index) => {
        if (line.startsWith("```")) {
          return null;
        }

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

        if (line.startsWith("- ") || line.startsWith("* ")) {
          return (
            <li key={index} className="ml-4 list-disc">
              <InlineFormatting text={line.slice(2)} />
            </li>
          );
        }

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

        if (!line.trim()) {
          return <div key={index} className="h-2" />;
        }

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

        const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
        return boldParts.map((boldPart, boldIndex) => {
          if (boldPart.startsWith("**") && boldPart.endsWith("**")) {
            return (
              <strong key={`${index}-${boldIndex}`}>
                {boldPart.slice(2, -2)}
              </strong>
            );
          }

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
