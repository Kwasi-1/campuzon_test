import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  X,
  Send,
  Minimize2,
  Store,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/stores";
import { useCurrency } from "@/hooks";
import { useStartConversation, useSendMessage, useMessages } from "@/hooks";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { Product, ChatMessage, Conversation } from "@/types-new";

interface ProductChatProps {
  product: Product;
  onLoginRequired?: () => void;
  bottomOffsetClass?: string;
}

export function ProductChat({
  product,
  onLoginRequired,
  bottomOffsetClass = "bottom-28",
}: ProductChatProps) {
  const { formatGHS } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState("");
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { isAuthenticated, user } = useAuthStore();
  const startConversation = useStartConversation();
  const sendMessage = useSendMessage();

  // Fetch messages if we have a conversation
  const { data: serverMessages, isLoading: isLoadingMessages } = useMessages(
    conversation?.id || "",
  );

  // Use server messages directly or local messages for optimistic updates
  const displayMessages = serverMessages || localMessages;

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayMessages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  const handleOpen = async () => {
    if (!isAuthenticated) {
      onLoginRequired?.();
      return;
    }
    setIsOpen(true);
    setIsMinimized(false);

    // Start or get existing conversation
    if (!conversation && product.id) {
      try {
        const conv = (await startConversation.mutateAsync({
          productID: product.id,
        })) as Conversation;
        setConversation(conv);
      } catch (error) {
        console.error("Failed to start conversation:", error);
      }
    }
  };

  const handleSend = async () => {
    if (!message.trim() || !conversation) return;

    const messageContent = message.trim();
    setMessage("");

    // Optimistic update - add message locally
    const optimisticMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      conversationID: conversation.id,
      senderID: user?.id || null,
      content: messageContent,
      messageType: "text",
      attachments: null,
      isRead: false,
      isSystemMessage: false,
      isDeleted: false,
      dateCreated: new Date().toISOString(),
      sender: {
        id: user?.id || "",
        displayName: user?.displayName || user?.firstName || "You",
        profileImage: user?.profileImage || null,
      },
    };
    setLocalMessages((prev) => [...prev, optimisticMessage]);

    try {
      await sendMessage.mutateAsync({
        conversationId: conversation.id,
        content: messageContent,
      });
    } catch (error) {
      console.error("Failed to send message:", error);
      // Remove optimistic message on error
      setLocalMessages((prev) =>
        prev.filter((m) => m.id !== optimisticMessage.id),
      );
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickMessages = [
    `Hi! Is this ${product.name} still available?`,
    "Can you offer a discount?",
    "When can we meet for pickup?",
    "Can you tell me more about the condition?",
  ];

  const handleQuickMessage = (text: string) => {
    setMessage(text);
    inputRef.current?.focus();
  };

  // Check if this is the user's own product
  const isOwnProduct = user?.store?.id === product.storeID;

  if (isOwnProduct) {
    return null; // Don't show chat on own products
  }

  return (
    <>
      {/* Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={cn(
              "hidden md:block fixed right-4 lg:right-6 z-50",
              bottomOffsetClass,
            )}
          >
            <button
              onClick={handleOpen}
              className="group relative flex items-center justify-center h-12 md:h-14 w-12 md:w-14 bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all duration-300 rotate-0 hover:rotate-6"
            >
              {/* Glow effect */}
              <span className="absolute inset-0 rounded-2xl bg-primary/40 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Icon */}
              <MessageCircle className="relative h-5 md:h-6 w-5 md:w-6 transition-transform duration-300 group-hover:scale-110" />

              {/* Online indicator */}
              <span className="absolute -top-0.5 -right-0.5 flex h-3.5 md:h-4 w-3.5 md:w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-white shadow-sm" />
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              height: isMinimized ? "auto" : "calc(100dvh - 120px)",
            }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={cn(
              "fixed md:right-4 lg:right-6 z-50 inset-x-0 md:inset-x-auto md:w-[360px] bg-background rounded-b-2xl md:rounded-2xl shadow-2xl md:border border-t border-gray-200 md:border-gray-200 overflow-hidden flex flex-col",
              bottomOffsetClass,
            )}
          >
            {/* Header */}
            <div className="border text-foreground p-3 sm:p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <Avatar className="h-10 sm:h-12 w-10 sm:w-12">
                  <AvatarImage
                    src={product.store?.logo}
                    alt={product.store?.name}
                  />
                  <AvatarFallback>
                    {product.store?.name?.charAt(0) || "S"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-medium text-xs sm:text-sm truncate">
                    {product.store?.name || "Seller"}
                  </p>
                  <p className="text-xs opacity-80 hidden sm:block">
                    Usually responds within an hour
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  aria-label={isMinimized ? "Expand chat" : "Minimize chat"}
                  title={isMinimized ? "Expand chat" : "Minimize chat"}
                  className="hidden sm:block p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <Minimize2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  aria-label="Close chat"
                  title="Close chat"
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Product Context */}
                <div className="p-2.5 sm:p-3 border-b bg-muted/30">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <img
                      src={
                        product.thumbnail ||
                        product.images?.[0] ||
                        "/placeholder-product.jpg"
                      }
                      alt={product.name}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium truncate">
                        {product.name}
                      </p>
                      <p className="text-xs sm:text-sm text-primary font-semibold">
                        {formatGHS(
                          Number.isFinite(product.price) ? product.price : 0,
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[200px]">
                  {isLoadingMessages || startConversation.isPending ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : displayMessages.length === 0 ? (
                    <div className="text-center space-y-4">
                      <div className="text-muted-foreground text-sm">
                        <Store className="h-10 w-10 mx-auto mb-2 opacity-50" />
                        <p>Start a conversation with the seller!</p>
                        <p className="text-xs mt-1">
                          Ask about the product, negotiate price, or arrange
                          pickup.
                        </p>
                      </div>

                      {/* Quick Messages */}
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground font-medium">
                          Quick messages:
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {quickMessages.map((qm, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleQuickMessage(qm)}
                              className="text-xs px-3 py-1.5 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors"
                            >
                              {qm.length > 30 ? qm.slice(0, 30) + "..." : qm}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      {displayMessages.map((msg) => {
                        const isMe = msg.senderID === user?.id;
                        return (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                              "flex items-end gap-2",
                              isMe ? "flex-row-reverse" : "flex-row",
                            )}
                          >
                            {!isMe && (
                              <Avatar className="w-10 h-10">
                                <AvatarImage
                                  src={msg.sender?.profileImage}
                                  alt={msg.sender?.displayName || "Seller"}
                                />
                                <AvatarFallback>
                                  {msg.sender?.displayName.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <div
                              className={cn(
                                "max-w-[75%] px-3 py-2 rounded-2xl text-sm",
                                isMe
                                  ? "bg-blue-500 text-primary-foreground rounded-br-md"
                                  : "bg-muted rounded-bl-md",
                              )}
                            >
                              <p>{msg.content}</p>
                              <p
                                className={cn(
                                  "text-[10px] mt-1",
                                  isMe
                                    ? "text-primary-foreground/70"
                                    : "text-muted-foreground",
                                )}
                              >
                                {formatRelativeTime(msg.dateCreated)}
                              </p>
                            </div>
                          </motion.div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                {/* Input */}
                <div className="p-3 border-t bg-background">
                  <div className="flex items-center gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 rounded-full bg-muted border-0 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      disabled={!conversation || sendMessage.isPending}
                    />
                    <Button
                      onClick={handleSend}
                      disabled={
                        !message.trim() ||
                        !conversation ||
                        sendMessage.isPending
                      }
                      size="icon"
                      className="rounded-full h-10 w-10"
                    >
                      {sendMessage.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
