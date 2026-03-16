import { MessageCircle, Search } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Conversation } from "@/types-new";
import type { ConversationFilter } from "./types";

type ConversationsSidebarProps = {
  conversations: Conversation[];
  selectedConversationId: string | null;
  selectedType: ConversationFilter;
  searchQuery: string;
  totalUnread: number;
  onSearchChange: (value: string) => void;
  onTypeChange: (value: ConversationFilter) => void;
  onSelectConversation: (conversationId: string) => void;
  hiddenOnMobileWhenConversationOpen: boolean;
};

export function ConversationsSidebar({
  conversations,
  selectedConversationId,
  selectedType,
  searchQuery,
  totalUnread,
  onSearchChange,
  onTypeChange,
  onSelectConversation,
  hiddenOnMobileWhenConversationOpen,
}: ConversationsSidebarProps) {
  return (
    <div
      className={`w-full md:min-w-[320px] md:max-w-[350px] lg:min-w-[400px] lg:max-w-[450px] md:border-r border-border flex flex-col ${
        hiddenOnMobileWhenConversationOpen ? "hidden md:flex" : "flex"
      }`}
    >
      <div className="sticky top-0 z-30 bg-background">
        <div className="p-4 border-b border-border">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h1 className="text-2xl font-semibold">Messages</h1>
            {totalUnread > 0 && (
              <Badge variant="outline" className="h-6 min-w-6 px-2">
                {totalUnread >= 100 ? "99+" : totalUnread}
              </Badge>
            )}
          </div>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 rounded-full"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {(["all", "order", "inquiry", "support"] as const).map((type) => (
              <Button
                key={type}
                variant={selectedType === type ? "default" : "outline"}
                size="sm"
                className="rounded-full flex-shrink-0"
                onClick={() => onTypeChange(type)}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 overflow-y-auto">
        <div className="p-2">
          {conversations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No conversations yet</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                className={`w-full overflow-hidden p-4 rounded-md cursor-pointer transition-colors mb-[2px] ${
                  conv.id === selectedConversationId
                    ? "bg-muted/50 border border-muted/50"
                    : "hover:bg-muted/40"
                }`}
                onClick={() => onSelectConversation(conv.id)}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={conv.store.logo || undefined} />
                    <AvatarFallback>
                      {conv.store.name?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-medium text-foreground truncate flex-1 min-w-0">
                        {conv.store.name}
                      </h3>
                      {conv.lastMessageAt && (
                        <span className="text-xs text-muted-foreground whitespace-nowrap truncate max-w-[96px] text-right">
                          {formatDistanceToNow(new Date(conv.lastMessageAt), {
                            addSuffix: true,
                          })}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <p className="text-sm text-muted-foreground max-w-[200px] truncate flex-1 min-w-0">
                        {conv.lastMessage?.content || "No messages yet"}
                      </p>
                      {conv.buyerUnreadCount > 0 && (
                        <Badge
                          variant="default"
                          className="ml-2 h-5 min-w-5 flex-shrink-0 flex items-center justify-center text-xs"
                        >
                          {conv.buyerUnreadCount >= 100
                            ? "99+"
                            : conv.buyerUnreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
