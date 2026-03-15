import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MessageCircle,
  Search,
  Package,
  ChevronRight,
  ChevronLeft,
  Clock,
  Send,
  Check,
  CheckCheck,
  Pin,
  ImagePlus,
  X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConversationSkeleton } from "@/components/shared/Skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuthStore } from "@/stores";
import { formatRelativeTime } from "@/lib/utils";
import type { Conversation } from "@/types-new";
import { formatDistanceToNow } from "date-fns";

// Mock conversations for display
const mockConversations: Conversation[] = [
  {
    id: "conv-1",
    buyerID: "user-1",
    storeID: "store-1",
    productID: "prod-1",
    orderID: "order-1",
    type: "order",
    subject: "Order CPZ-ABC123",
    isActive: true,
    buyerUnreadCount: 2,
    sellerUnreadCount: 0,
    lastMessageAt: "2024-12-29T10:30:00Z",
    dateCreated: "2024-12-20T09:00:00Z",
    store: {
      id: "store-1",
      name: "TechHub UG",
      logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop",
    },
    product: {
      id: "prod-1",
      name: "iPhone 14 Pro Max",
      price: 5500,
      thumbnail:
        "https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=100&h=100&fit=crop",
    },
    lastMessage: {
      id: "msg-1",
      conversationID: "conv-1",
      senderID: "store-1",
      content: "Your order is ready for pickup at Balme Library!",
      messageType: "text",
      attachments: null,
      isRead: false,
      isSystemMessage: false,
      isDeleted: false,
      dateCreated: "2024-12-29T10:30:00Z",
    },
  },
  {
    id: "conv-2",
    buyerID: "user-1",
    storeID: "store-2",
    productID: "prod-2",
    orderID: null,
    type: "inquiry",
    subject: "Question about AirPods Pro",
    isActive: true,
    buyerUnreadCount: 0,
    sellerUnreadCount: 1,
    lastMessageAt: "2024-12-28T15:20:00Z",
    dateCreated: "2024-12-28T14:00:00Z",
    store: {
      id: "store-2",
      name: "Campus Gadgets",
      logo: null,
    },
    product: {
      id: "prod-2",
      name: "AirPods Pro (2nd Gen)",
      price: 850,
      thumbnail:
        "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=100&h=100&fit=crop",
    },
    lastMessage: {
      id: "msg-2",
      conversationID: "conv-2",
      senderID: "user-1",
      content: "Do you have the black silicone case in stock?",
      messageType: "text",
      attachments: null,
      isRead: true,
      isSystemMessage: false,
      isDeleted: false,
      dateCreated: "2024-12-28T15:20:00Z",
    },
  },
  {
    id: "conv-3",
    buyerID: "user-1",
    storeID: "store-3",
    productID: null,
    orderID: "order-3",
    type: "support",
    subject: "Return Request",
    isActive: true,
    buyerUnreadCount: 0,
    sellerUnreadCount: 0,
    lastMessageAt: "2024-12-25T09:00:00Z",
    dateCreated: "2024-12-24T16:00:00Z",
    store: {
      id: "store-3",
      name: "Campus Fashion",
      logo: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=100&h=100&fit=crop",
    },
    lastMessage: {
      id: "msg-3",
      conversationID: "conv-3",
      senderID: "store-3",
      content:
        "Your return has been processed. Refund will arrive in 3-5 days.",
      messageType: "text",
      attachments: null,
      isRead: true,
      isSystemMessage: false,
      isDeleted: false,
      dateCreated: "2024-12-25T09:00:00Z",
    },
  },
];

type MockMessage = {
  id: string;
  senderID: string;
  content: string;
  timestamp: string;
  isOwnMessage: boolean;
  isRead: boolean;
  imageUrl?: string;
};

const mockMessages: Record<string, MockMessage[]> = {
  "conv-1": [
    {
      id: "msg-0",
      senderID: "user-1",
      content: "Hello, is my order ready?",
      timestamp: "2024-12-28T14:30:00Z",
      isOwnMessage: true,
      isRead: true,
    },
    {
      id: "msg-1",
      senderID: "store-1",
      content: "Your order is ready for pickup at Balme Library!",
      timestamp: "2024-12-29T10:30:00Z",
      isOwnMessage: false,
      isRead: false,
    },
  ],
  "conv-2": [
    {
      id: "msg-2",
      senderID: "user-1",
      content: "Do you have the black silicone case in stock?",
      timestamp: "2024-12-28T15:20:00Z",
      isOwnMessage: true,
      isRead: true,
    },
  ],
  "conv-3": [
    {
      id: "msg-3",
      senderID: "store-3",
      content:
        "Your return has been processed. Refund will arrive in 3-5 days.",
      timestamp: "2024-12-25T09:00:00Z",
      isOwnMessage: false,
      isRead: true,
    },
  ],
};

export function MessagesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: routeConversationId } = useParams<{ id?: string }>();
  const { isAuthenticated } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState<{
    file: File;
    previewUrl: string;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedType, setSelectedType] = useState<
    "all" | "order" | "inquiry" | "support"
  >("all");
  const selectedConversationId = routeConversationId ?? null;

  // In a real app, this would come from an API
  const isLoading = false;
  const conversations = mockConversations;

  // Filter conversations
  const filteredConversations = conversations.filter((conv) => {
    const matchesType = selectedType === "all" || conv.type === selectedType;
    const matchesSearch =
      searchQuery === "" ||
      conv.store?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.product?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage?.content
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const totalUnread = conversations.reduce(
    (sum, conv) => sum + conv.buyerUnreadCount,
    0,
  );

  const selectedConversation = useMemo(
    () => conversations.find((c) => c.id === selectedConversationId),
    [conversations, selectedConversationId],
  );

  const activeMessages = useMemo(
    () =>
      selectedConversationId ? mockMessages[selectedConversationId] || [] : [],
    [selectedConversationId],
  );

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`, {
        replace: true,
      });
    }
  }, [isAuthenticated, navigate, location.pathname]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages, selectedConversationId]);

  useEffect(() => {
    return () => {
      if (selectedImage?.previewUrl) {
        URL.revokeObjectURL(selectedImage.previewUrl);
      }
    };
  }, [selectedImage]);

  if (!isAuthenticated) {
    return null;
  }

  const handleSelectConversation = (conversationId: string) => {
    navigate(`/messages/${conversationId}`);
  };

  const handlePickImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (selectedImage?.previewUrl) {
      URL.revokeObjectURL(selectedImage.previewUrl);
    }

    const previewUrl = URL.createObjectURL(file);
    setSelectedImage({ file, previewUrl });
    event.target.value = "";
  };

  const handleSendMessage = () => {
    if ((!newMessage.trim() && !selectedImage) || !selectedConversationId)
      return;
    mockMessages[selectedConversationId].push({
      id: `temp-${Date.now()}`,
      senderID: "user-1",
      content: newMessage,
      timestamp: new Date().toISOString(),
      isOwnMessage: true,
      isRead: false,
      imageUrl: selectedImage?.previewUrl,
    });
    setNewMessage("");
    setSelectedImage(null);
  };

  return (
    <div className="flex h-[calc(100vh-16rem)] min-h-[500px] md:min-h-[600px] w-full overflow-hidden border rounded-xl bg-background shadow-sm">
      {/* Sidebar List */}
      <div
        className={`w-full md:min-w-[320px] md:max-w-[350px] lg:min-w-[400px] lg:max-w-[450px] md:border-r border-border flex flex-col ${selectedConversationId ? "hidden md:flex" : "flex"}`}
      >
        <div className="sticky top-0 z-30 bg-background">
          <div className="p-4 border-b border-border">
            <h1 className="text-2xl font-bold mb-4">Messages</h1>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
                  onClick={() => setSelectedType(type)}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </div>
        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="p-2">
            {filteredConversations.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No conversations yet</p>
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`w-full overflow-hidden p-4 rounded-md cursor-pointer transition-colors mb-[2px] ${
                    conv.id === selectedConversationId
                      ? "bg-muted/50 border border-muted/50"
                      : "hover:bg-muted/40"
                  }`}
                  onClick={() => handleSelectConversation(conv.id)}
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
                        <h3 className="font-semibold text-foreground truncate flex-1 min-w-0">
                          {conv.store.name}
                        </h3>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          {conv.lastMessageAt && (
                            <span className="text-xs text-muted-foreground whitespace-nowrap truncate max-w-[96px] text-right">
                              {formatDistanceToNow(
                                new Date(conv.lastMessageAt),
                                {
                                  addSuffix: true,
                                },
                              )}
                            </span>
                          )}
                        </div>
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

      {/* Chat Area */}
      <div
        className={`flex-1 flex flex-col ${selectedConversationId ? "flex" : "hidden md:flex"} overflow-hidden bg-muted/10`}
      >
        {selectedConversation ? (
          <>
            <div className="p-4 border-b flex items-center gap-3 bg-background flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden mr-2"
                onClick={() => navigate("/messages")}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={selectedConversation.store.logo || undefined}
                />
                <AvatarFallback>
                  {selectedConversation.store.name?.charAt(0) || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="font-semibold">
                  {selectedConversation.store.name}
                </h2>
                <p className="text-xs text-muted-foreground capitalize">
                  {selectedConversation.type}
                </p>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4 overflow-y-auto">
              {activeMessages.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex items-start gap-3 ${msg.isOwnMessage ? "flex-row-reverse" : ""}`}
                    >
                      {!msg.isOwnMessage && (
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={selectedConversation.store.logo || undefined}
                          />
                          <AvatarFallback>
                            {selectedConversation.store.name?.charAt(0) || "?"}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`max-w-[70%] ${msg.isOwnMessage ? "ml-auto flex flex-col items-end" : ""}`}
                      >
                        <div
                          className={`w-fit px-3 py-2 rounded-lg ${msg.isOwnMessage ? "bg-blue-500 text-primary-foreground" : "bg-muted text-foreground"}`}
                        >
                          {msg.imageUrl && (
                            <img
                              src={msg.imageUrl}
                              alt="Shared attachment"
                              className="mb-2 max-w-[260px] max-h-[260px] rounded-md object-cover"
                            />
                          )}
                          <p className="text-sm text-wrap break-words">
                            {msg.content}
                          </p>
                          <p
                            className={`text-[10px] mt-1 ${msg.isOwnMessage ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                          >
                            {formatDistanceToNow(new Date(msg.timestamp), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                        {msg.isOwnMessage && (
                          <div className="flex items-center gap-1 mt-1">
                            {msg.isRead ? (
                              <CheckCheck className="h-3 w-3 text-blue-500" />
                            ) : (
                              <Check className="h-3 w-3 text-muted-foreground" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            <div className="p-4 bg-background border-t">
              {selectedImage && (
                <div className="mb-3 inline-flex items-center gap-2 rounded-md border border-border p-2 bg-muted/40">
                  <img
                    src={selectedImage.previewUrl}
                    alt="Attachment preview"
                    className="h-12 w-12 rounded object-cover"
                  />
                  <span className="text-xs text-muted-foreground max-w-[180px] truncate">
                    {selectedImage.file.name}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => {
                      URL.revokeObjectURL(selectedImage.previewUrl);
                      setSelectedImage(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

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
                  className="rounded-full h-10 w-10 p-0 flex items-center justify-center"
                >
                  <ImagePlus className="h-4 w-4" />
                </Button>
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 rounded-full"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() && !selectedImage}
                  className="rounded-full h-10 w-10 p-0 flex items-center justify-center"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
            <MessageCircle className="h-16 w-16 mb-4 opacity-20" />
            <h2 className="text-xl font-semibold mb-2">Your Messages</h2>
            <p className="text-center max-w-sm">
              Select a conversation from the sidebar or start a new one to begin
              messaging.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
