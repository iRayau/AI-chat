"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  MessageCircle,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  History,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

interface Chat {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface ChatSidebarProps {
  chats: Chat[];
  currentChatId: string | null;
  isLoading: boolean;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
}

export function ChatSidebar({
  chats,
  currentChatId,
  isLoading,
  onSelectChat,
  onNewChat,
  onDeleteChat,
}: ChatSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<Chat | null>(null);

  const handleDeleteConfirm = () => {
    if (chatToDelete) {
      onDeleteChat(chatToDelete.id);
      setChatToDelete(null);
    }
  };

  return (
    <>
      <div
        className={cn(
          "flex flex-col h-full border-r bg-muted/30 transition-all duration-300",
          isCollapsed ? "w-16" : "w-72"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b h-16">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">Chat History</h2>
            </div>
          )}
          <div className={cn("flex items-center gap-1", isCollapsed && "mx-auto")}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-8 w-8 rounded-lg",
                    !isCollapsed && "bg-primary text-primary-foreground hover:bg-primary/90"
                  )}
                  onClick={onNewChat}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">New chat</TooltipContent>
            </Tooltip>
            {!isCollapsed && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Collapse</TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>

        {/* Expand button when collapsed */}
        {isCollapsed && (
          <div className="p-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-full h-8 rounded-lg"
                  onClick={() => setIsCollapsed(false)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Expand sidebar</TooltipContent>
            </Tooltip>
          </div>
        )}

        {/* Chat List */}
        <ScrollArea className="flex-1">
          <div className={cn("p-2 space-y-1", isCollapsed && "px-1")}>
            {isLoading ? (
              <div className="space-y-2 p-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={cn(
                      "rounded-lg bg-muted animate-pulse",
                      isCollapsed ? "h-10 w-10 mx-auto" : "h-12"
                    )}
                  />
                ))}
              </div>
            ) : chats.length === 0 ? (
              <div className={cn("p-4 text-center", isCollapsed && "p-2")}>
                {isCollapsed ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="w-10 h-10 mx-auto flex items-center justify-center rounded-lg bg-muted">
                        <MessageCircle className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right">No chats yet</TooltipContent>
                  </Tooltip>
                ) : (
                  <div className="py-8">
                    <MessageCircle className="h-8 w-8 mx-auto mb-3 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">No chats yet</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      Start a conversation to see it here
                    </p>
                  </div>
                )}
              </div>
            ) : (
              chats.map((chat) => (
                <ChatItem
                  key={chat.id}
                  chat={chat}
                  isActive={chat.id === currentChatId}
                  isCollapsed={isCollapsed}
                  onSelect={() => onSelectChat(chat.id)}
                  onDelete={() => setChatToDelete(chat)}
                />
              ))
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        {!isCollapsed && chats.length > 0 && (
          <div className="p-3 border-t">
            <p className="text-xs text-muted-foreground text-center">
              {chats.length} {chats.length === 1 ? "chat" : "chats"}
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!chatToDelete} onOpenChange={(open) => !open && setChatToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Chat
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{chatToDelete?.title}&quot;? This action cannot be undone.
              All messages in this chat will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

interface ChatItemProps {
  chat: Chat;
  isActive: boolean;
  isCollapsed: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

function ChatItem({
  chat,
  isActive,
  isCollapsed,
  onSelect,
  onDelete,
}: ChatItemProps) {
  const timeAgo = formatDistanceToNow(new Date(chat.updated_at), {
    addSuffix: true,
  });

  if (isCollapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onSelect}
            className={cn(
              "w-10 h-10 mx-auto flex items-center justify-center rounded-lg transition-all duration-200 text-xs font-bold",
              isActive
                ? "bg-primary text-primary-foreground shadow-md"
                : "hover:bg-muted bg-muted/50"
            )}
          >
            {chat.title.charAt(0).toUpperCase()}
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-[200px]">
          <p className="font-medium">{chat.title}</p>
          <p className="text-xs text-muted-foreground">{timeAgo}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div
      className={cn(
        "group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200",
        isActive
          ? "bg-primary text-primary-foreground shadow-md"
          : "hover:bg-muted"
      )}
      onClick={onSelect}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-tight line-clamp-2">{chat.title}</p>
        <p
          className={cn(
            "text-xs mt-0.5",
            isActive ? "text-primary-foreground/70" : "text-muted-foreground"
          )}
        >
          {timeAgo}
        </p>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-7 w-7 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity",
              isActive &&
                "text-primary-foreground hover:bg-primary-foreground/10"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem
            className="text-destructive focus:text-destructive cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete chat
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
