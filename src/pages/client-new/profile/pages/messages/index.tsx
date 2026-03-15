import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { MessageCircle } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  useConversations,
  useMarkAsRead,
  useMessages,
  useSendMessage,
  useUploadChatImage,
} from "@/hooks";
import { useAuthStore, useCartStore } from "@/stores";
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

function extractImageFromAttachments(
  attachments: string | null | undefined,
): string | undefined {
  if (!attachments) return undefined;

  try {
    const parsed = JSON.parse(attachments);
    if (Array.isArray(parsed) && typeof parsed[0] === "string") {
      return parsed[0];
    }
  } catch {
    if (typeof attachments === "string" && attachments.startsWith("http")) {
      return attachments;
    }
  }

  return undefined;
}

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedType, setSelectedType] = useState<ConversationFilter>("all");
  const selectedConversationId = routeConversationId ?? null;

  const {
    data: conversations = [],
    isLoading: isLoadingConversations,
    isFetching: isFetchingConversations,
  } = useConversations(isAuthenticated);
  const { data: serverMessages = [], isFetching: isFetchingMessages } =
    useMessages(selectedConversationId || "", isAuthenticated);
  const sendMessageMutation = useSendMessage();
  const uploadChatImageMutation = useUploadChatImage();
  const markAsReadMutation = useMarkAsRead();

  const isSending =
    sendMessageMutation.isPending || uploadChatImageMutation.isPending;
  const isLoading = isLoadingConversations || isFetchingConversations;

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
    (sum, conv) => sum + (conv.unreadCount ?? conv.buyerUnreadCount),
    0,
  );

  const selectedConversation = useMemo(
    () => conversations.find((c) => c.id === selectedConversationId),
    [conversations, selectedConversationId],
  );

  const activeMessages = useMemo(() => {
    return serverMessages.map(
      (message): MockMessage => ({
        id: message.id,
        senderID: message.senderID,
        content: message.content || "",
        timestamp: message.dateCreated,
        isRead: Boolean(message.isRead),
        isSystemMessage: Boolean(message.isSystemMessage),
        imageUrl: extractImageFromAttachments(message.attachments),
      }),
    );
  }, [serverMessages]);

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
    if (!selectedConversationId || !selectedConversation) return;

    const unreadCount =
      selectedConversation.unreadCount ?? selectedConversation.buyerUnreadCount;
    if (unreadCount > 0) {
      markAsReadMutation.mutate(selectedConversationId);
    }
  }, [markAsReadMutation, selectedConversation, selectedConversationId]);

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

  const handlePickImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (selectedImage?.previewUrl) {
      URL.revokeObjectURL(selectedImage.previewUrl);
    }

    const previewUrl = URL.createObjectURL(file);
    setSelectedImage({ file, previewUrl });
    event.target.value = "";
  };

  const handleSendMessage = async () => {
    if (
      (!newMessage.trim() && !selectedImage) ||
      !selectedConversationId ||
      isSending
    )
      return;

    try {
      let uploadedImageUrl: string | undefined;
      if (selectedImage) {
        uploadedImageUrl = await uploadChatImageMutation.mutateAsync({
          conversationId: selectedConversationId,
          file: selectedImage.file,
        });
      }

      await sendMessageMutation.mutateAsync({
        conversationId: selectedConversationId,
        content: newMessage.trim(),
        type: uploadedImageUrl && !newMessage.trim() ? "image" : "text",
        attachments: uploadedImageUrl ? [uploadedImageUrl] : [],
      });

      setNewMessage("");

      if (selectedImage?.previewUrl) {
        URL.revokeObjectURL(selectedImage.previewUrl);
      }
      setSelectedImage(null);
    } catch {
      // Error toasts are handled in mutation hooks.
    }
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

            {isFetchingMessages && (
              <div className="px-4 pb-2 text-xs text-muted-foreground">
                Refreshing messages...
              </div>
            )}

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
