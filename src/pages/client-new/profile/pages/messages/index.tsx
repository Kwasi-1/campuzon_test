import { useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuthStore, useCartStore } from "@/stores";
import type { Conversation } from "@/types-new";
import { CompleteOrderBanner } from "./components/CompleteOrderBanner";
import { ConversationHeader } from "./components/ConversationHeader";
import { ConversationsSidebar } from "./components/ConversationsSidebar";
import { MessageComposer } from "./components/MessageComposer";
import { MessagesThread } from "./components/MessagesThread";
import { ProductContextBar } from "./components/ProductContextBar";
import type {
  ConversationFilter,
  MockMessage,
  SelectedImage,
} from "./components/types";

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

const mockMessages: Record<string, MockMessage[]> = {
  "conv-1": [
    {
      id: "msg-system-1",
      senderID: null,
      content: "Order placed. Chat started.",
      timestamp: "2024-12-28T12:00:00Z",
      isRead: true,
      isSystemMessage: true,
    },
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
  const { isAuthenticated, user } = useAuthStore();
  const { items: cartItems } = useCartStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(
    null,
  );
  const [isSending, setIsSending] = useState(false);
  const [conversationMessages, setConversationMessages] =
    useState<Record<string, MockMessage[]>>(mockMessages);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedType, setSelectedType] = useState<ConversationFilter>("all");
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

  const activeMessages = useMemo(() => {
    if (!selectedConversationId) return [];
    return conversationMessages[selectedConversationId] || [];
  }, [conversationMessages, selectedConversationId]);

  const productInCart = useMemo(() => {
    if (!selectedConversation?.product) return null;
    return (
      cartItems.find(
        (item) => item.product.id === selectedConversation.product?.id,
      ) || null
    );
  }, [cartItems, selectedConversation]);

  const showCompleteOrderButton =
    !!productInCart &&
    !!selectedConversation &&
    (selectedConversation.type === "order" ||
      selectedConversation.type === "inquiry");

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
    if (
      (!newMessage.trim() && !selectedImage) ||
      !selectedConversationId ||
      isSending
    )
      return;

    setIsSending(true);

    const nextMessage: MockMessage = {
      id: `temp-${Date.now()}`,
      senderID: user?.id || "user-1",
      content: newMessage,
      timestamp: new Date().toISOString(),
      isOwnMessage: true,
      isRead: false,
      imageUrl: selectedImage?.previewUrl,
    };

    setConversationMessages((prev) => {
      const previousMessages = prev[selectedConversationId] || [];
      return {
        ...prev,
        [selectedConversationId]: [...previousMessages, nextMessage],
      };
    });

    setNewMessage("");
    setSelectedImage(null);
    setIsSending(false);
  };

  return (
    <div className="flex h-[calc(100vh-16rem)] min-h-[500px] md:min-h-[600px] w-full overflow-hidden border rounded-xl bg-background shadow-sm">
      {/* Sidebar List */}
      <ConversationsSidebar
        conversations={filteredConversations}
        selectedConversationId={selectedConversationId}
        selectedType={selectedType}
        searchQuery={searchQuery}
        totalUnread={totalUnread}
        onSearchChange={setSearchQuery}
        onTypeChange={setSelectedType}
        onSelectConversation={handleSelectConversation}
        hiddenOnMobileWhenConversationOpen={!!selectedConversationId}
      />

      {/* Chat Area */}
      <div
        className={`flex-1 flex flex-col ${selectedConversationId ? "flex" : "hidden md:flex"} overflow-hidden bg-muted/10`}
      >
        {selectedConversation ? (
          <>
            <ConversationHeader
              conversation={selectedConversation}
              onBack={() => navigate("/messages")}
            />

            <ProductContextBar conversation={selectedConversation} />

            <MessagesThread
              messages={activeMessages}
              conversation={selectedConversation}
              currentUserId={user?.id}
              messagesEndRef={messagesEndRef}
            />

            {showCompleteOrderButton && productInCart && (
              <CompleteOrderBanner quantity={productInCart.quantity} />
            )}

            <MessageComposer
              newMessage={newMessage}
              selectedImage={selectedImage}
              isSending={isSending}
              onChangeMessage={setNewMessage}
              onSendMessage={handleSendMessage}
              onPickImage={handlePickImage}
              onRemoveImage={() => {
                if (selectedImage?.previewUrl) {
                  URL.revokeObjectURL(selectedImage.previewUrl);
                }
                setSelectedImage(null);
              }}
              fileInputRef={fileInputRef}
            />
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
