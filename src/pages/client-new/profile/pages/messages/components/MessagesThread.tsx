import { motion } from "framer-motion";
import { Check, CheckCheck, Info } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatRelativeTime, cn } from "@/lib/utils";
import type { Conversation } from "@/types-new";
import type { MockMessage } from "./types";

type MessagesThreadProps = {
  messages: MockMessage[];
  conversation: Conversation;
  currentUserId?: string | null;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
};

export function MessagesThread({
  messages,
  conversation,
  currentUserId,
  messagesEndRef,
}: MessagesThreadProps) {
  return (
    <ScrollArea className="flex-1 p-4 overflow-y-auto">
      {messages.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No messages yet. Start the conversation!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((msg, index) => {
            const isOwnMessage =
              msg.isOwnMessage ||
              (msg.senderID && msg.senderID === currentUserId);
            const isSystemMessage = Boolean(msg.isSystemMessage);
            const previousSenderId =
              index > 0 ? messages[index - 1].senderID : null;
            const showAvatar =
              !isOwnMessage &&
              !isSystemMessage &&
              (index === 0 || previousSenderId !== msg.senderID);

            if (isSystemMessage) {
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-center"
                >
                  <div className="bg-muted px-4 py-2 rounded-full text-xs text-muted-foreground flex items-center gap-2">
                    <Info className="h-3 w-3" />
                    {msg.content}
                  </div>
                </motion.div>
              );
            }

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex items-start gap-3",
                  isOwnMessage ? "flex-row-reverse" : "",
                )}
              >
                {!isOwnMessage && showAvatar && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={conversation.store.logo || undefined} />
                    <AvatarFallback>
                      {conversation.store.name?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                )}
                {!isOwnMessage && !showAvatar && <div className="w-8" />}

                <div
                  className={cn(
                    "max-w-[70%]",
                    isOwnMessage ? "ml-auto flex flex-col items-end" : "",
                  )}
                >
                  <div
                    className={cn(
                      "w-fit px-3 py-2 rounded-2xl",
                      isOwnMessage
                        ? "bg-blue-500 text-primary-foreground rounded-tr-sm"
                        : "bg-muted text-foreground rounded-tl-sm",
                    )}
                  >
                    {msg.imageUrl && (
                      <img
                        src={msg.imageUrl}
                        alt="Shared attachment"
                        className="mb-2 max-w-[260px] max-h-[260px] rounded-md object-cover"
                      />
                    )}
                    {msg.content && (
                      <p className="text-sm break-words whitespace-pre-wrap">
                        {msg.content}
                      </p>
                    )}
                    <p
                      className={cn(
                        "text-[10px] mt-1",
                        isOwnMessage
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground",
                      )}
                    >
                      {formatRelativeTime(msg.timestamp)}
                    </p>
                  </div>

                  {isOwnMessage && (
                    <div className="flex items-center gap-1 mt-1">
                      {msg.isRead ? (
                        <CheckCheck className="h-3 w-3 text-blue-500" />
                      ) : (
                        <Check className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      )}
    </ScrollArea>
  );
}
