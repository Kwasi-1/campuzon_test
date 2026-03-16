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
  Package,
  Phone,
  Search,
  Send,
  Star,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuthStore } from "@/stores";
import { formatRelativeTime } from "@/lib/utils";
import { SellerPageTemplate } from "@/pages/seller/components/SellerPageTemplate";

type SellerConversationFilter =
  | "all"
  | "unread"
  | "starred"
  | "with-order"
  | "no-order";

type SellerConversation = {
  id: string;
  customer: {
    id: string;
    name: string;
    image: string | null;
  };
  product: {
    id: string;
    name: string;
    image: string;
    price: string;
  } | null;
  lastMessage: {
    content: string;
    timestamp: string;
    isFromCustomer: boolean;
  };
  unreadCount: number;
  hasOrder: boolean;
  orderNumber?: string;
  isStarred: boolean;
};

type SellerMessage = {
  id: string;
  sender: "customer" | "seller" | "system";
  content: string;
  timestamp: string;
  isRead?: boolean;
  imageUrl?: string;
};

type SelectedImage = {
  name: string;
  dataUrl: string;
};

const mockSellerConversations: SellerConversation[] = [
  {
    id: "conv-1",
    customer: {
      id: "user-1",
      name: "Kwame Asante",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
    },
    product: {
      id: "prod-1",
      name: "iPhone 14 Pro Max",
      image:
        "https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=100",
      price: "GHS 9,500",
    },
    lastMessage: {
      content: "Is this still available? I need it urgently.",
      timestamp: "2024-12-29T10:30:00Z",
      isFromCustomer: true,
    },
    unreadCount: 2,
    hasOrder: false,
    isStarred: true,
  },
  {
    id: "conv-2",
    customer: {
      id: "user-2",
      name: "Akosua Mensah",
      image: null,
    },
    product: {
      id: "prod-2",
      name: "AirPods Pro",
      image:
        "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=100",
      price: "GHS 2,150",
    },
    lastMessage: {
      content: "I'll deliver it to Akuafo Hall by 5pm today.",
      timestamp: "2024-12-29T09:15:00Z",
      isFromCustomer: false,
    },
    unreadCount: 0,
    hasOrder: true,
    orderNumber: "CPZ-DEF456",
    isStarred: false,
  },
  {
    id: "conv-3",
    customer: {
      id: "user-3",
      name: "Kofi Owusu",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
    },
    product: {
      id: "prod-3",
      name: "MacBook Air M2",
      image:
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=100",
      price: "GHS 14,800",
    },
    lastMessage: {
      content: "Thank you! The laptop is amazing.",
      timestamp: "2024-12-28T16:45:00Z",
      isFromCustomer: true,
    },
    unreadCount: 0,
    hasOrder: true,
    orderNumber: "CPZ-GHI789",
    isStarred: false,
  },
  {
    id: "conv-4",
    customer: {
      id: "user-4",
      name: "Ama Darko",
      image: null,
    },
    product: {
      id: "prod-4",
      name: "Samsung Galaxy S24",
      image:
        "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=100",
      price: "GHS 6,200",
    },
    lastMessage: {
      content: "Can you do GHS 4,000 for it?",
      timestamp: "2024-12-28T14:20:00Z",
      isFromCustomer: true,
    },
    unreadCount: 1,
    hasOrder: false,
    isStarred: false,
  },
  {
    id: "conv-5",
    customer: {
      id: "user-5",
      name: "Yaw Boateng",
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
    },
    product: null,
    lastMessage: {
      content: "Do you have any iPhone 15 in stock?",
      timestamp: "2024-12-27T11:00:00Z",
      isFromCustomer: true,
    },
    unreadCount: 0,
    hasOrder: false,
    isStarred: true,
  },
];

const initialMessagesByConversation: Record<string, SellerMessage[]> = {
  "conv-1": [
    {
      id: "conv-1-msg-1",
      sender: "customer",
      content: "Hi, is the iPhone still available?",
      timestamp: "2024-12-29T10:12:00Z",
      isRead: true,
    },
    {
      id: "conv-1-msg-2",
      sender: "seller",
      content: "Yes, it is still available and in excellent condition.",
      timestamp: "2024-12-29T10:16:00Z",
      isRead: true,
    },
    {
      id: "conv-1-msg-3",
      sender: "customer",
      content: "Is this still available? I need it urgently.",
      timestamp: "2024-12-29T10:30:00Z",
      isRead: false,
    },
  ],
  "conv-2": [
    {
      id: "conv-2-msg-1",
      sender: "customer",
      content: "Can you confirm when it will be delivered?",
      timestamp: "2024-12-29T08:48:00Z",
      isRead: true,
    },
    {
      id: "conv-2-msg-2",
      sender: "seller",
      content: "I'll deliver it to Akuafo Hall by 5pm today.",
      timestamp: "2024-12-29T09:15:00Z",
      isRead: true,
    },
  ],
  "conv-3": [
    {
      id: "conv-3-msg-1",
      sender: "seller",
      content: "Glad it arrived safely. Let me know if you need anything else.",
      timestamp: "2024-12-28T15:58:00Z",
      isRead: true,
    },
    {
      id: "conv-3-msg-2",
      sender: "customer",
      content: "Thank you! The laptop is amazing.",
      timestamp: "2024-12-28T16:45:00Z",
      isRead: true,
    },
  ],
  "conv-4": [
    {
      id: "conv-4-msg-1",
      sender: "customer",
      content: "Can you do GHS 4,000 for it?",
      timestamp: "2024-12-28T14:20:00Z",
      isRead: false,
    },
  ],
  "conv-5": [
    {
      id: "conv-5-msg-1",
      sender: "customer",
      content: "Do you have any iPhone 15 in stock?",
      timestamp: "2024-12-27T11:00:00Z",
      isRead: true,
    },
  ],
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

export function SellerMessagesPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  const [conversations, setConversations] = useState<SellerConversation[]>(
    mockSellerConversations,
  );
  const [messagesByConversation, setMessagesByConversation] = useState(
    initialMessagesByConversation,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<SellerConversationFilter>("all");
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [newMessage, setNewMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(
    null,
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredConversations = useMemo(() => {
    let nextConversations = [...conversations];

    switch (filter) {
      case "unread":
        nextConversations = nextConversations.filter(
          (conversation) => conversation.unreadCount > 0,
        );
        break;
      case "starred":
        nextConversations = nextConversations.filter(
          (conversation) => conversation.isStarred,
        );
        break;
      case "with-order":
        nextConversations = nextConversations.filter(
          (conversation) => conversation.hasOrder,
        );
        break;
      case "no-order":
        nextConversations = nextConversations.filter(
          (conversation) => !conversation.hasOrder,
        );
        break;
      default:
        break;
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      nextConversations = nextConversations.filter(
        (conversation) =>
          conversation.customer.name.toLowerCase().includes(query) ||
          conversation.product?.name.toLowerCase().includes(query) ||
          conversation.lastMessage.content.toLowerCase().includes(query),
      );
    }

    return nextConversations;
  }, [conversations, filter, searchQuery]);

  const selectedConversation = useMemo(
    () =>
      conversations.find(
        (conversation) => conversation.id === selectedConversationId,
      ) ?? null,
    [conversations, selectedConversationId],
  );

  const activeMessages = useMemo(() => {
    if (!selectedConversationId) {
      return [];
    }

    return messagesByConversation[selectedConversationId] || [];
  }, [messagesByConversation, selectedConversationId]);

  const unreadCount = conversations.filter(
    (conversation) => conversation.unreadCount > 0,
  ).length;
  const totalMessages = conversations.length;
  const starredCount = conversations.filter(
    (conversation) => conversation.isStarred,
  ).length;
  const withOrderCount = conversations.filter(
    (conversation) => conversation.hasOrder,
  ).length;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages, selectedConversationId]);

  if (!isAuthenticated || !user?.isOwner) {
    navigate("/login");
    return null;
  }

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

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);

    setConversations((previousConversations) =>
      previousConversations.map((conversation) =>
        conversation.id === conversationId
          ? { ...conversation, unreadCount: 0 }
          : conversation,
      ),
    );

    setMessagesByConversation((previousMessages) => ({
      ...previousMessages,
      [conversationId]: (previousMessages[conversationId] || []).map(
        (message) =>
          message.sender === "customer"
            ? { ...message, isRead: true }
            : message,
      ),
    }));
  };

  const handleSendMessage = () => {
    if (!selectedConversationId || (!newMessage.trim() && !selectedImage)) {
      return;
    }

    const timestamp = new Date().toISOString();
    const trimmedMessage = newMessage.trim();
    const nextMessage: SellerMessage = {
      id: `${selectedConversationId}-${Date.now()}`,
      sender: "seller",
      content: trimmedMessage,
      timestamp,
      isRead: true,
      imageUrl: selectedImage?.dataUrl,
    };

    setMessagesByConversation((previousMessages) => ({
      ...previousMessages,
      [selectedConversationId]: [
        ...(previousMessages[selectedConversationId] || []),
        nextMessage,
      ],
    }));

    setConversations((previousConversations) =>
      previousConversations.map((conversation) =>
        conversation.id === selectedConversationId
          ? {
              ...conversation,
              lastMessage: {
                content: trimmedMessage,
                timestamp,
                isFromCustomer: false,
              },
            }
          : conversation,
      ),
    );

    setNewMessage("");
    setSelectedImage(null);
  };

  const handlePickImage = (event: ChangeEvent<HTMLInputElement>) => {
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
        });
      }
    };
    reader.readAsDataURL(file);

    event.target.value = "";
  };

  return (
    <SellerPageTemplate
      // title="Messages"
      // description={
      //   unreadCount > 0 ? (
      //     <span>
      //       <span className="font-medium text-primary">
      //         {unreadCount} unread
      //       </span>{" "}
      //       · {totalMessages} total
      //     </span>
      //   ) : (
      //     `${totalMessages} conversations`
      //   )
      // }
    >
      <div className="flex h-[calc(100vh-16rem)] min-h-[500px] w-full overflow-hidden rounded-xl border bg-background shadow-sm md:min-h-[600px]">
        <div
          className={`w-full border-border md:flex md:min-w-[320px] md:max-w-[350px] md:flex-col md:border-r lg:min-w-[400px] lg:max-w-[450px] ${
            selectedConversationId ? "hidden md:flex" : "flex flex-col"
          }`}
        >
          <div className="sticky top-0 z-30 bg-background">
            <div className="border-b border-border p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-2xl font-bold">Messages</h2>
                {unreadCount > 0 ? (
                  <Badge variant="default" className="h-6 min-w-6 px-2">
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
                filteredConversations.map((conversation) => (
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
                        <AvatarImage
                          src={conversation.customer.image || undefined}
                        />
                        <AvatarFallback>
                          {conversation.customer.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="min-w-0 flex-1 truncate font-semibold text-foreground">
                            {conversation.customer.name}
                          </h3>
                          <span className="max-w-[96px] truncate whitespace-nowrap text-right text-xs text-muted-foreground">
                            {formatRelativeTime(
                              conversation.lastMessage.timestamp,
                            )}
                          </span>
                        </div>

                        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="outline" className="h-5 text-[10px]">
                            {conversation.hasOrder ? "Order" : "Inquiry"}
                          </Badge>
                          {conversation.isStarred ? (
                            <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                          ) : null}
                          {conversation.orderNumber ? (
                            <span className="truncate">
                              {conversation.orderNumber}
                            </span>
                          ) : null}
                        </div>

                        <div className="mt-1 flex items-center justify-between gap-2">
                          <p className="max-w-[220px] min-w-0 flex-1 truncate text-sm text-muted-foreground">
                            {conversation.lastMessage.isFromCustomer
                              ? ""
                              : "You: "}
                            {conversation.lastMessage.content}
                          </p>
                          {conversation.unreadCount > 0 ? (
                            <Badge
                              variant="default"
                              className="ml-2 flex h-5 min-w-5 flex-shrink-0 items-center justify-center text-xs"
                            >
                              {conversation.unreadCount >= 100
                                ? "99+"
                                : conversation.unreadCount}
                            </Badge>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </button>
                ))
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
                    src={selectedConversation.customer.image || undefined}
                  />
                  <AvatarFallback>
                    {selectedConversation.customer.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <h3 className="block truncate font-semibold">
                    {selectedConversation.customer.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="h-5 text-[10px]">
                      {selectedConversation.hasOrder ? "order" : "inquiry"}
                    </Badge>
                    {selectedConversation.orderNumber ? (
                      <span>{selectedConversation.orderNumber}</span>
                    ) : (
                      <span>Direct customer chat</span>
                    )}
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
                        src={selectedConversation.product.image}
                        alt={selectedConversation.product.name}
                        className="h-12 w-12 rounded-sm object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">
                          {selectedConversation.product.name}
                        </p>
                        <p className="text-sm font-semibold text-primary">
                          {selectedConversation.product.price}
                        </p>
                      </div>
                      <Package className="h-4 w-4 text-muted-foreground" />
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
                      const isOwnMessage = message.sender === "seller";
                      const isSystemMessage = message.sender === "system";
                      const previousSender =
                        index > 0 ? activeMessages[index - 1].sender : null;
                      const showAvatar =
                        !isOwnMessage &&
                        !isSystemMessage &&
                        (index === 0 || previousSender !== message.sender);

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
                                  selectedConversation.customer.image ||
                                  undefined
                                }
                              />
                              <AvatarFallback>
                                {selectedConversation.customer.name.charAt(0)}
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
                              {message.imageUrl ? (
                                <img
                                  src={message.imageUrl}
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
                                {formatRelativeTime(message.timestamp)}
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
                        handleSendMessage();
                      }
                    }}
                    placeholder="Reply to customer..."
                    className="flex-1 rounded-full"
                  />

                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() && !selectedImage}
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
