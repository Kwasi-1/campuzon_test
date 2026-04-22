import { Link } from "react-router-dom";
import { ChevronLeft, MoreVertical, Phone } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Conversation } from "@/types-new";

type ConversationHeaderProps = {
  conversation: Conversation;
  onBack: () => void;
};

export function ConversationHeader({
  conversation,
  onBack,
}: ConversationHeaderProps) {
  return (
    <div className="p-4 border-b flex items-center gap-3 bg-background flex-shrink-0">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden rounded-sm py-0 px-2 h-auto w-auto"
        onClick={onBack}
        aria-label="Back to conversation list"
        title="Back"
      >
        <ChevronLeft className="h-7 w-7" />
      </Button>

      <Avatar className="h-10 w-10">
        <AvatarImage src={conversation.store.logo || undefined} />
        <AvatarFallback>
          {conversation.store.name?.charAt(0) || "?"}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <Link
          to={`/stores/${conversation.store.id}`}
          className="font-semibold truncate block hover:text-primary transition-colors"
        >
          {conversation.store.name}
        </Link>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="text-[10px] capitalize h-5">
            {conversation.type}
          </Badge>
          {conversation.orderID && (
            <Link
              to={`/orders/${conversation.orderID}`}
              className="hover:text-primary transition-colors"
            >
              View Order
            </Link>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" aria-label="Call" title="Call">
          <Phone className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="More options"
          title="More options"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
