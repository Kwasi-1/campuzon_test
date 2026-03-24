import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  Check,
  CheckCheck,
  ImagePlus,
  MessageCircle,
  MoreVertical,
  Phone,
  Search,
  Send,
  Star,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuthStore } from "@/stores";
import { formatRelativeTime } from "@/lib/utils";
import {
  useConversations,
  useMarkAsRead,
  useMessages,
  useSendMessage,
  useUploadChatImage,
} from "@/hooks/useChat";
import { useSellerMyStore } from "@/hooks/useSellerPortal";
import { SellerPageTemplate } from "@/pages/seller/components/SellerPageTemplate";
import type { ChatMessage, Conversation } from "@/types-new";
import toast from "react-hot-toast";

type SellerConversationFilter =
  | "all"
  | "unread"
  | "starred"
  | "with-order"
  | "no-order";

type SelectedImage = {
  name: string;
  dataUrl: string;
  file: File;
};

const FILTER_OPTIONS: Array<{
  value: SellerConversationFilter;
  label: string;
}> = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "starred", label: "Starred" },
  { value: "with-order", label: "With Order" },
  { value: "no-order", label: "Without Order" },
];

function formatAmount(value?: number | null): string {
  if (typeof value !== "number") return "";
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 0,
  }).format(value);
}

function extractImageUrl(message: ChatMessage): string | null {
  if (!message.attachments) return null;

  if (message.attachments.startsWith("http")) return message.attachments;

  try {
    const parsed = JSON.parse(message.attachments) as unknown;
    if (typeof parsed === "string" && parsed.startsWith("http")) {
      return parsed;
    }
    if (Array.isArray(parsed)) {
      const first = parsed.find(
        (item) => typeof item === "string" && item.startsWith("http"),
      );
      return typeof first === "string" ? first : null;
    }
    if (parsed && typeof parsed === "object") {
      const record = parsed as Record<string, unknown>;
      const maybeUrl = record.url;
      if (typeof maybeUrl === "string" && maybeUrl.startsWith("http")) {
        return maybeUrl;
      }
    }
  } catch {
    return null;
  }

  return null;
}

function getStoreActionBlockReason(storeStatus?: string): string | null {
  switch (storeStatus) {
    case "pending":
      return "Your store is not active. Please wait for approval.";
    case "suspended":
      return "Your store is suspended. Only admin can reactivate this store.";
    case "closed":
      return "Your store is closed. Contact support for next steps.";
    default:
      return null;
  }
}

export function SellerMessagesPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { data: store } = useSellerMyStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<SellerConversationFilter>("all");
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [newMessage, setNewMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(
    null,
  );
  const [starredConversationIds, setStarredConversationIds] = useState<
    Set<string>
  >(new Set());

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: conversations = [] } = useConversations(
    Boolean(isAuthenticated && user?.isOwner),
  );
  const { data: activeMessages = [] } = useMessages(
    selectedConversationId || "",
    Boolean(selectedConversationId),
  );
  const markAsRead = useMarkAsRead();
  const sendMessage = useSendMessage();
  const uploadImage = useUploadChatImage();
  const storeActionBlockReason = getStoreActionBlockReason(store?.status);
  const areMessageActionsDisabled = Boolean(storeActionBlockReason);
  const areStarActionsDisabled =
    store?.status === "suspended" || store?.status === "closed";
  const starActionBlockReason =
    store?.status === "suspended"
      ? "Your store is suspended. Only admin can reactivate this store."
      : store?.status === "closed"
        ? "Your store is closed. Contact support for next steps."
        : null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages, selectedConversationId]);

  const selectedConversation = useMemo(
    () =>
      conversations.find(
        (conversation) => conversation.id === selectedConversationId,
      ) ?? null,
    [conversations, selectedConversationId],
  );

  const filteredConversations = useMemo(() => {
    let nextConversations = [...conversations];

    switch (filter) {
      case "unread":
        nextConversations = nextConversations.filter(
          (conversation) => (conversation.unreadCount || 0) > 0,
        );
        break;
      case "starred":
        nextConversations = nextConversations.filter((conversation) =>
          starredConversationIds.has(conversation.id),
        );
        break;
      case "with-order":
        nextConversations = nextConversations.filter((conversation) =>
          Boolean(conversation.orderID),
        );
        break;
      case "no-order":
        nextConversations = nextConversations.filter(
          (conversation) => !conversation.orderID,
        );
        break;
      default:
        break;
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      nextConversations = nextConversations.filter((conversation) => {
        const participantName =
          conversation.participant?.name?.toLowerCase() || "";
        const productName = conversation.product?.name?.toLowerCase() || "";
        const lastMessage =
          conversation.lastMessage?.content?.toLowerCase() || "";
        return (
          participantName.includes(query) ||
          productName.includes(query) ||
          lastMessage.includes(query)
        );
      });
    }

    return nextConversations;
  }, [conversations, filter, searchQuery, starredConversationIds]);

  const unreadCount = conversations.filter(
    (conversation) => (conversation.unreadCount || 0) > 0,
  ).length;
  const totalMessages = conversations.length;
  const starredCount = starredConversationIds.size;
  const withOrderCount = conversations.filter((conversation) =>
    Boolean(conversation.orderID),
  ).length;

  const getFilterCount = (value: SellerConversationFilter) => {
    switch (value) {
      case "all":
        return totalMessages;
      case "unread":
        return unreadCount;
      case "starred":
        return starredCount;
      case "with-order":
        return withOrderCount;
      case "no-order":
        return totalMessages - withOrderCount;
      default:
        return 0;
    }
  };

  if (!isAuthenticated || !user?.isOwner) {
    navigate("/login");
    return null;
  }

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    markAsRead.mutate(conversationId);
  };

  const toggleConversationStar = (conversationId: string) => {
    if (areStarActionsDisabled) {
      toast.error(starActionBlockReason || "Action unavailable");
      return;
    }

    setStarredConversationIds((previous) => {
      const next = new Set(previous);
      if (next.has(conversationId)) {
        next.delete(conversationId);
      } else {
        next.add(conversationId);
      }
      return next;
    });
  };

  const handleSendMessage = async () => {
    if (storeActionBlockReason) {
      toast.error(storeActionBlockReason);
      return;
    }

    if (!selectedConversationId || (!newMessage.trim() && !selectedImage)) {
      return;
    }

    let attachmentUrl: string | undefined;

    if (selectedImage) {
      attachmentUrl = await uploadImage.mutateAsync({
        conversationId: selectedConversationId,
        file: selectedImage.file,
      });
    }

    const content =
      newMessage.trim() || (attachmentUrl ? "Shared an image" : "");
    await sendMessage.mutateAsync({
      conversationId: selectedConversationId,
      content,
      type: attachmentUrl ? "image" : "text",
      attachments: attachmentUrl ? [attachmentUrl] : [],
    });

    setNewMessage("");
    setSelectedImage(null);
  };

  const handlePickImage = (event: ChangeEvent<HTMLInputElement>) => {
    if (storeActionBlockReason) {
      toast.error(storeActionBlockReason);
      return;
    }

    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        setSelectedImage({
          name: file.name,
          dataUrl: result,
          file,
        });
      }
    };
    reader.readAsDataURL(file);

    event.target.value = "";
  };

  return (
    <SellerPageTemplate messagesPadding={true}>


      <div className="flex h-[calc(100vh-7rem)] md:h-[calc(100vh-16rem)] -mb-10 -mt-2 md:mb-auto md:mt-auto min-h-[500px] w-full overflow-hidden md:rounded-xl md:border bg-background md:shadow-sm md:min-h-[600px]">
        <div
          className={`w-full border-border md:flex md:min-w-[320px] md:max-w-[350px] md:flex-col md:border-r lg:min-w-[400px] lg:max-w-[450px] ${
            selectedConversationId ? "hidden md:flex" : "flex flex-col"
          }`}
        >
          <div className="sticky top-0 z-30 bg-background">
            <div className="border-b border-border p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-2xl font-semibold">Messages</h2>
                {unreadCount > 0 ? (
                  <Badge variant="outline" className="h-6 min-w-6 px-2">
                    {unreadCount >= 100 ? "99+" : unreadCount}
                  </Badge>
                ) : null}
              </div>

              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="rounded-full pl-10"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {FILTER_OPTIONS.map((option) => (
                  <Button
                    key={option.value}
                    variant={filter === option.value ? "default" : "outline"}
                    size="sm"
                    className="flex-shrink-0 rounded-full"
                    onClick={() => setFilter(option.value)}
                  >
                    {option.label}
                    <span className="ml-1.5 text-xs opacity-70">
                      {getFilterCount(option.value)}
                    </span>
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <ScrollArea className="flex-1 overflow-y-auto">
            <div className="p-2">
              {filteredConversations.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <MessageCircle className="mx-auto mb-3 h-12 w-12 opacity-50" />
                  <p>No conversations found</p>
                </div>
              ) : (
                filteredConversations.map((conversation) => {
                  const isStarred = starredConversationIds.has(conversation.id);
                  const participantName =
                    conversation.participant?.name || "Customer";
                  const participantImage =
                    conversation.participant?.image || undefined;
                  const lastMessageContent =
                    conversation.lastMessage?.content || "No messages yet";
                  const lastMessageTimestamp =
                    conversation.lastMessage?.dateCreated ||
                    conversation.lastMessageAt ||
                    new Date().toISOString();
                  const isFromCustomer =
                    conversation.lastMessage?.senderID !== user.id;

                  return (
                    <button
                      key={conversation.id}
                      type="button"
                      className={`mb-[2px] w-full overflow-hidden rounded-md border p-4 text-left transition-colors ${
                        conversation.id === selectedConversationId
                          ? "border-muted/50 bg-muted/50"
                          : "border-transparent hover:bg-muted/40"
                      }`}
                      onClick={() => handleSelectConversation(conversation.id)}
                    >
                      <div className="flex min-w-0 items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={participantImage} />
                          <AvatarFallback>
                            {participantName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="min-w-0 flex-1 truncate font-medium text-foreground">
                              {participantName}
                            </h3>
                            <span className="max-w-[96px] truncate whitespace-nowrap text-right text-xs text-muted-foreground">
                              {formatRelativeTime(lastMessageTimestamp)}
                            </span>
                          </div>

                          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                            <Badge
                              variant="outline"
                              className="h-5 text-[10px]"
                            >
                              {conversation.orderID ? "Order" : "Inquiry"}
                            </Badge>
                            {isStarred ? (
                              <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                            ) : null}
                            {conversation.orderID ? (
                              <span className="truncate">
                                {conversation.orderID}
                              </span>
                            ) : null}
                          </div>

                          <div className="mt-1 flex items-center justify-between gap-2">
                            <p
                              className={`min-w-0 flex-1 truncate text-sm text-muted-foreground ${(conversation.unreadCount || 0) > 0 ? "max-w-[180px] md:max-w-[190px] lg:max-w-[220px]" : "max-w-[220px]"}`}
                            >
                              {isFromCustomer ? "" : "You: "}
                              {lastMessageContent}
                            </p>
                            {(conversation.unreadCount || 0) > 0 ? (
                              <Badge
                                variant="default"
                                className="ml-2 flex h-5 min-w-5 flex-shrink-0 items-center justify-center text-xs"
                              >
                                {(conversation.unreadCount || 0) >= 100
                                  ? "99+"
                                  : conversation.unreadCount}
                              </Badge>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </div>

        <div
          className={`flex-1 overflow-hidden bg-muted/10 ${
            selectedConversationId
              ? "flex flex-col"
              : "hidden md:flex md:flex-col"
          }`}
        >
          {selectedConversation ? (
            <>
              <div className="flex shrink-0 items-center gap-3 border-b bg-background p-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="mr-2 md:hidden"
                  onClick={() => setSelectedConversationId(null)}
                  aria-label="Back to conversation list"
                  title="Back"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>

                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={selectedConversation.participant?.image || undefined}
                  />
                  <AvatarFallback>
                    {(selectedConversation.participant?.name || "C").charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <h3 className="block truncate font-semibold">
                    {selectedConversation.participant?.name || "Customer"}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="h-5 text-[10px]">
                      {selectedConversation.orderID ? "order" : "inquiry"}
                    </Badge>
                    <span>
                      {selectedConversation.orderID || "Direct customer chat"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Call"
                    title="Call"
                  >
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Star conversation"
                    title="Star conversation"
                    onClick={() =>
                      toggleConversationStar(selectedConversation.id)
                    }
                    disabled={areStarActionsDisabled}
                  >
                    <Star
                      className={`h-4 w-4 ${starredConversationIds.has(selectedConversation.id) ? "fill-yellow-500 text-yellow-500" : ""}`}
                    />
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

              {selectedConversation.product ? (
                <div className="bg-muted/30 md:m-2">
                  <div className="p-2 px-4">
                    <div className="flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-muted/50">
                      <img
                        src={selectedConversation.product.thumbnail || ""}
                        alt={selectedConversation.product.name}
                        className="h-12 w-12 rounded-sm object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">
                          {selectedConversation.product.name}
                        </p>
                        <p className="text-sm font-semibold text-primary">
                          {formatAmount(selectedConversation.product.price)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              <ScrollArea className="flex-1 overflow-y-auto p-4">
                {activeMessages.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeMessages.map((message, index) => {
                      const isSystemMessage =
                        message.isSystemMessage ||
                        message.messageType === "system";
                      const isOwnMessage =
                        !isSystemMessage && message.senderID === user.id;
                      const previousSender =
                        index > 0 ? activeMessages[index - 1].senderID : null;
                      const showAvatar =
                        !isOwnMessage &&
                        !isSystemMessage &&
                        (index === 0 || previousSender !== message.senderID);
                      const imageUrl = extractImageUrl(message);

                      if (isSystemMessage) {
                        return (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-center"
                          >
                            <div className="rounded-full bg-muted px-4 py-2 text-xs text-muted-foreground">
                              {message.content}
                            </div>
                          </motion.div>
                        );
                      }

                      return (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex items-start gap-3 ${
                            isOwnMessage ? "flex-row-reverse" : ""
                          }`}
                        >
                          {!isOwnMessage && showAvatar ? (
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={
                                  selectedConversation.participant?.image ||
                                  undefined
                                }
                              />
                              <AvatarFallback>
                                {(
                                  selectedConversation.participant?.name || "C"
                                ).charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          ) : null}

                          {!isOwnMessage && !showAvatar ? (
                            <div className="w-8" />
                          ) : null}

                          <div
                            className={`max-w-[70%] ${
                              isOwnMessage
                                ? "ml-auto flex flex-col items-end"
                                : ""
                            }`}
                          >
                            <div
                              className={`w-fit rounded-2xl px-3 py-2 ${
                                isOwnMessage
                                  ? "rounded-tr-sm bg-blue-500 text-primary-foreground"
                                  : "rounded-tl-sm bg-muted text-foreground"
                              }`}
                            >
                              {imageUrl ? (
                                <img
                                  src={imageUrl}
                                  alt="Shared attachment"
                                  className="mb-2 max-h-[260px] max-w-[260px] rounded-md object-cover"
                                />
                              ) : null}
                              <p className="whitespace-pre-wrap break-words text-sm">
                                {message.content}
                              </p>
                              <p
                                className={`mt-1 text-[10px] ${
                                  isOwnMessage
                                    ? "text-primary-foreground/70"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {formatRelativeTime(message.dateCreated)}
                              </p>
                            </div>

                            {isOwnMessage ? (
                              <div className="mt-1 flex items-center gap-1">
                                {message.isRead ? (
                                  <CheckCheck className="h-3 w-3 text-blue-500" />
                                ) : (
                                  <Check className="h-3 w-3 text-muted-foreground" />
                                )}
                              </div>
                            ) : null}
                          </div>
                        </motion.div>
                      );
                    })}

                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              <div className="border-t bg-background p-4">
                {selectedImage ? (
                  <div className="mb-3 inline-flex items-center gap-2 rounded-md border border-border bg-muted/40 p-2">
                    <img
                      src={selectedImage.dataUrl}
                      alt="Attachment preview"
                      className="h-12 w-12 rounded object-cover"
                    />
                    <span className="max-w-[180px] truncate text-xs text-muted-foreground">
                      {selectedImage.name}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setSelectedImage(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : null}

                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    aria-label="Attach an image"
                    title="Attach an image"
                    className="hidden"
                    onChange={handlePickImage}
                  />

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={areMessageActionsDisabled}
                    title={storeActionBlockReason || "Attach image"}
                    className="flex h-10 w-10 items-center justify-center rounded-full p-0"
                  >
                    <ImagePlus className="h-4 w-4" />
                  </Button>

                  <Input
                    value={newMessage}
                    onChange={(event) => setNewMessage(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        void handleSendMessage();
                      }
                    }}
                    placeholder="Reply to customer..."
                    disabled={areMessageActionsDisabled}
                    className="flex-1 rounded-full"
                  />

                  <Button
                    onClick={() => void handleSendMessage()}
                    disabled={
                      areMessageActionsDisabled ||
                      (!newMessage.trim() && !selectedImage) ||
                      sendMessage.isPending
                    }
                    title={storeActionBlockReason || "Send message"}
                    className="flex h-10 w-10 items-center justify-center rounded-full p-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-muted-foreground">
              <MessageCircle className="mb-4 h-16 w-16 opacity-20" />
              <h2 className="mb-2 text-xl font-semibold">Seller Messages</h2>
              <p className="max-w-sm text-center">
                Select a conversation from the sidebar to view customer messages
                and reply.
              </p>
            </div>
          )}
        </div>
      </div>
    </SellerPageTemplate>
  );
}
