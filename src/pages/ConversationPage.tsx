import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Send,
  Image as ImageIcon,
  Package,
  MoreVertical,
  Phone,
  CheckCheck,
  Check,
  Info,
  ShoppingCart,
} from 'lucide-react';
import {
  Button,
  Input,
  Badge,
  Avatar,
  Skeleton,
} from '@/components/ui';
import { useAuthStore, useCartStore } from '@/stores';
import { formatRelativeTime, formatPrice, cn } from '@/lib/utils';
import type { Conversation, ChatMessage } from '@/types';

// Mock conversation data
const mockConversation: Conversation = {
  id: 'conv-1',
  buyerID: 'user-1',
  storeID: 'store-1',
  productID: 'prod-1',
  orderID: 'order-1',
  type: 'order',
  subject: 'Order CPZ-ABC123',
  isActive: true,
  buyerUnreadCount: 0,
  sellerUnreadCount: 0,
  lastMessageAt: '2024-12-29T10:30:00Z',
  dateCreated: '2024-12-20T09:00:00Z',
  store: {
    id: 'store-1',
    name: 'TechHub UG',
    logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop',
  },
  product: {
    id: 'prod-1',
    name: 'iPhone 14 Pro Max',
    price: 5500,
    thumbnail: 'https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=100&h=100&fit=crop',
  },
};

// Mock messages
const mockMessages: ChatMessage[] = [
  {
    id: 'msg-1',
    conversationID: 'conv-1',
    senderID: null,
    content: 'Order placed. Chat started.',
    messageType: 'system',
    attachments: null,
    isRead: true,
    isSystemMessage: true,
    isDeleted: false,
    dateCreated: '2024-12-20T09:00:00Z',
  },
  {
    id: 'msg-2',
    conversationID: 'conv-1',
    senderID: 'user-1',
    content: 'Hi, I just placed an order for the iPhone 14 Pro Max. When can I pick it up?',
    messageType: 'text',
    attachments: null,
    isRead: true,
    isSystemMessage: false,
    isDeleted: false,
    dateCreated: '2024-12-20T09:05:00Z',
    sender: {
      id: 'user-1',
      displayName: 'John Doe',
      profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
    },
  },
  {
    id: 'msg-3',
    conversationID: 'conv-1',
    senderID: 'store-1',
    content: 'Hello! Thank you for your order. I\'ll have it ready for pickup by tomorrow afternoon. I\'ll send you the exact location.',
    messageType: 'text',
    attachments: null,
    isRead: true,
    isSystemMessage: false,
    isDeleted: false,
    dateCreated: '2024-12-20T09:30:00Z',
    sender: {
      id: 'store-1',
      displayName: 'TechHub UG',
      profileImage: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop',
    },
  },
  {
    id: 'msg-4',
    conversationID: 'conv-1',
    senderID: 'user-1',
    content: 'Perfect! I\'ll be on campus all day tomorrow. Just let me know when and where.',
    messageType: 'text',
    attachments: null,
    isRead: true,
    isSystemMessage: false,
    isDeleted: false,
    dateCreated: '2024-12-20T09:35:00Z',
  },
  {
    id: 'msg-5',
    conversationID: 'conv-1',
    senderID: null,
    content: 'Order status updated to "Processing"',
    messageType: 'system',
    attachments: null,
    isRead: true,
    isSystemMessage: true,
    isDeleted: false,
    dateCreated: '2024-12-20T14:00:00Z',
  },
  {
    id: 'msg-6',
    conversationID: 'conv-1',
    senderID: 'store-1',
    content: 'Your order is ready for pickup at Balme Library, near the main entrance. I\'ll be wearing a blue TechHub t-shirt. Come anytime between 2-5pm.',
    messageType: 'text',
    attachments: null,
    isRead: true,
    isSystemMessage: false,
    isDeleted: false,
    dateCreated: '2024-12-21T10:00:00Z',
  },
  {
    id: 'msg-7',
    conversationID: 'conv-1',
    senderID: 'user-1',
    content: 'Great! I\'ll be there around 3pm. Thanks!',
    messageType: 'text',
    attachments: null,
    isRead: true,
    isSystemMessage: false,
    isDeleted: false,
    dateCreated: '2024-12-21T10:15:00Z',
  },
  {
    id: 'msg-8',
    conversationID: 'conv-1',
    senderID: null,
    content: 'Order delivered',
    messageType: 'system',
    attachments: null,
    isRead: true,
    isSystemMessage: true,
    isDeleted: false,
    dateCreated: '2024-12-21T15:30:00Z',
  },
  {
    id: 'msg-9',
    conversationID: 'conv-1',
    senderID: 'store-1',
    content: 'Thank you for your purchase! Hope you enjoy your new iPhone. Please don\'t forget to confirm delivery in the app so I can receive the payment. Let me know if you have any questions!',
    messageType: 'text',
    attachments: null,
    isRead: true,
    isSystemMessage: false,
    isDeleted: false,
    dateCreated: '2024-12-21T15:35:00Z',
  },
];

export function ConversationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { items: cartItems } = useCartStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages);

  // In a real app, this would come from an API
  const conversation = mockConversation;
  const isLoading = false;

  // Check if the product from this conversation is in the cart (order not completed)
  const productInCart = conversation.product
    ? cartItems.find((item) => item.product.id === conversation.product?.id)
    : null;

  // Show complete order button if product is in cart and conversation is about the order
  const showCompleteOrderButton = productInCart && (conversation.type === 'order' || conversation.type === 'inquiry');

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim() || isSending) return;

    setIsSending(true);

    // Create new message
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      conversationID: id!,
      senderID: user?.id || 'user-1',
      content: message,
      messageType: 'text',
      attachments: null,
      isRead: false,
      isSystemMessage: false,
      isDeleted: false,
      dateCreated: new Date().toISOString(),
      sender: {
        id: user?.id || 'user-1',
        displayName: user?.displayName || 'You',
        profileImage: user?.profileImage || null,
      },
    };

    // Add to messages
    setMessages((prev) => [...prev, newMessage]);
    setMessage('');
    setIsSending(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isAuthenticated) {
    navigate('/login?redirect=/messages');
    return null;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 py-3">
            <Link to="/messages">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>

            {/* Store Info */}
            <div className="flex items-center gap-3 flex-1">
              {conversation.store?.logo ? (
                <img
                  src={conversation.store.logo}
                  alt={conversation.store.name || ''}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <Avatar size="md" fallback={conversation.store?.name?.[0] || 'S'} />
              )}
              <div>
                <Link
                  to={`/stores/${conversation.store?.id}`}
                  className="font-medium hover:text-primary transition-colors"
                >
                  {conversation.store?.name}
                </Link>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline" className="text-xs">
                    {conversation.type}
                  </Badge>
                  {conversation.orderID && (
                    <Link
                      to={`/orders/${conversation.orderID}`}
                      className="hover:text-primary"
                    >
                      View Order
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Phone className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Context */}
      {conversation.product && (
        <div className="border-b bg-muted/30">
          <div className="container mx-auto px-4 py-2">
            <Link
              to={`/products/${conversation.product.id}`}
              className="flex items-center gap-3 hover:bg-muted/50 rounded-lg p-2 -m-2 transition-colors"
            >
              <img
                src={conversation.product.thumbnail || '/placeholder-product.jpg'}
                alt={conversation.product.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{conversation.product.name}</p>
                <p className="text-sm text-primary font-bold">
                  {formatPrice(conversation.product.price)}
                </p>
              </div>
              <Package className="h-4 w-4 text-muted-foreground" />
            </Link>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-4">
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((msg, index) => {
              const isOwnMessage = msg.senderID === user?.id || msg.senderID === 'user-1';
              const isSystem = msg.isSystemMessage;
              const showAvatar =
                !isSystem &&
                (index === 0 || messages[index - 1].senderID !== msg.senderID);

              if (isSystem) {
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
                  className={cn('flex gap-3', isOwnMessage ? 'justify-end' : 'justify-start')}
                >
                  {!isOwnMessage && showAvatar && (
                    <Avatar
                      size="sm"
                      src={msg.sender?.profileImage || undefined}
                      fallback={msg.sender?.displayName?.[0] || 'S'}
                    />
                  )}
                  {!isOwnMessage && !showAvatar && <div className="w-8" />}

                  <div
                    className={cn(
                      'max-w-[75%] rounded-2xl px-4 py-2',
                      isOwnMessage
                        ? 'bg-primary text-primary-foreground rounded-tr-sm'
                        : 'bg-muted rounded-tl-sm'
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    <div
                      className={cn(
                        'flex items-center gap-1 mt-1 text-xs',
                        isOwnMessage ? 'text-primary-foreground/70 justify-end' : 'text-muted-foreground'
                      )}
                    >
                      <span>{formatRelativeTime(msg.dateCreated)}</span>
                      {isOwnMessage && (
                        msg.isRead ? (
                          <CheckCheck className="h-3 w-3" />
                        ) : (
                          <Check className="h-3 w-3" />
                        )
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Complete Order Banner */}
      {showCompleteOrderButton && (
        <div className="border-t bg-primary/5">
          <div className="container mx-auto px-4 py-3">
            <div className="max-w-3xl mx-auto">
              <Link to="/checkout" className="block">
                <Button className="w-full gap-2" size="lg">
                  <ShoppingCart className="h-5 w-5" />
                  Complete Order ({productInCart.quantity} item{productInCart.quantity > 1 ? 's' : ''} in cart)
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="border-t bg-background">
        <div className="container mx-auto px-4 py-3">
          <div className="max-w-3xl mx-auto flex items-center gap-3">
            <Button variant="ghost" size="sm">
              <ImageIcon className="h-5 w-5" />
            </Button>
            <Input
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || isSending}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
