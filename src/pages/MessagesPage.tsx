import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MessageCircle,
  Search,
  Package,
  ChevronRight,
  Clock,
} from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  Input,
  Badge,
  EmptyState,
  Breadcrumb,
  ConversationSkeleton,
  Avatar,
} from '@/components/ui';
import { useAuthStore } from '@/stores';
import { formatRelativeTime } from '@/lib/utils';
import type { Conversation } from '@/types';

// Mock conversations for display
const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    buyerID: 'user-1',
    storeID: 'store-1',
    productID: 'prod-1',
    orderID: 'order-1',
    type: 'order',
    subject: 'Order CPZ-ABC123',
    isActive: true,
    buyerUnreadCount: 2,
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
    lastMessage: {
      id: 'msg-1',
      conversationID: 'conv-1',
      senderID: 'store-1',
      content: 'Your order is ready for pickup at Balme Library!',
      messageType: 'text',
      attachments: null,
      isRead: false,
      isSystemMessage: false,
      isDeleted: false,
      dateCreated: '2024-12-29T10:30:00Z',
    },
  },
  {
    id: 'conv-2',
    buyerID: 'user-1',
    storeID: 'store-2',
    productID: 'prod-2',
    orderID: null,
    type: 'inquiry',
    subject: 'Question about AirPods Pro',
    isActive: true,
    buyerUnreadCount: 0,
    sellerUnreadCount: 1,
    lastMessageAt: '2024-12-28T15:20:00Z',
    dateCreated: '2024-12-28T14:00:00Z',
    store: {
      id: 'store-2',
      name: 'Campus Gadgets',
      logo: null,
    },
    product: {
      id: 'prod-2',
      name: 'AirPods Pro (2nd Gen)',
      price: 850,
      thumbnail: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=100&h=100&fit=crop',
    },
    lastMessage: {
      id: 'msg-2',
      conversationID: 'conv-2',
      senderID: 'user-1',
      content: 'Do you have the black silicone case in stock?',
      messageType: 'text',
      attachments: null,
      isRead: true,
      isSystemMessage: false,
      isDeleted: false,
      dateCreated: '2024-12-28T15:20:00Z',
    },
  },
  {
    id: 'conv-3',
    buyerID: 'user-1',
    storeID: 'store-3',
    productID: null,
    orderID: 'order-3',
    type: 'support',
    subject: 'Return Request',
    isActive: true,
    buyerUnreadCount: 0,
    sellerUnreadCount: 0,
    lastMessageAt: '2024-12-25T09:00:00Z',
    dateCreated: '2024-12-24T16:00:00Z',
    store: {
      id: 'store-3',
      name: 'Campus Fashion',
      logo: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=100&h=100&fit=crop',
    },
    lastMessage: {
      id: 'msg-3',
      conversationID: 'conv-3',
      senderID: 'store-3',
      content: 'Your return has been processed. Refund will arrive in 3-5 days.',
      messageType: 'text',
      attachments: null,
      isRead: true,
      isSystemMessage: false,
      isDeleted: false,
      dateCreated: '2024-12-25T09:00:00Z',
    },
  },
];

export function MessagesPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'order' | 'inquiry' | 'support'>('all');

  // In a real app, this would come from an API
  const isLoading = false;
  const conversations = mockConversations;

  // Filter conversations
  const filteredConversations = conversations.filter((conv) => {
    const matchesType = selectedType === 'all' || conv.type === selectedType;
    const matchesSearch =
      searchQuery === '' ||
      conv.store?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.product?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage?.content?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const totalUnread = conversations.reduce((sum, conv) => sum + conv.buyerUnreadCount, 0);

  if (!isAuthenticated) {
    navigate('/login?redirect=/messages');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb
        items={[
          { label: 'Profile', href: '/profile' },
          { label: 'Messages' },
        ]}
        className="mb-6"
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Messages</h1>
          <p className="text-muted-foreground">
            {totalUnread > 0 ? `${totalUnread} unread message${totalUnread > 1 ? 's' : ''}` : 'Your conversations with sellers'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'order', 'inquiry', 'support'] as const).map((type) => (
            <Button
              key={type}
              variant={selectedType === type ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedType(type)}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Conversations List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <ConversationSkeleton key={i} />
          ))}
        </div>
      ) : filteredConversations.length === 0 ? (
        <EmptyState
          icon={<MessageCircle className="h-16 w-16" />}
          title={searchQuery || selectedType !== 'all' ? 'No matching conversations' : 'No messages yet'}
          description={
            searchQuery || selectedType !== 'all'
              ? 'Try adjusting your search or filters'
              : "When you message sellers, conversations will appear here"
          }
          action={
            <Link to="/products">
              <Button>Browse Products</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredConversations.map((conversation, index) => (
            <motion.div
              key={conversation.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link to={`/messages/${conversation.id}`}>
                <Card className={`hover:shadow-md transition-all cursor-pointer ${
                  conversation.buyerUnreadCount > 0 ? 'border-primary/50 bg-primary/5' : ''
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Store Avatar */}
                      <div className="relative flex-shrink-0">
                        {conversation.store?.logo ? (
                          <img
                            src={conversation.store.logo}
                            alt={conversation.store.name || ''}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <Avatar
                            size="lg"
                            fallback={conversation.store?.name?.[0] || 'S'}
                          />
                        )}
                        {conversation.buyerUnreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                            {conversation.buyerUnreadCount}
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${conversation.buyerUnreadCount > 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {conversation.store?.name || 'Unknown Store'}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {conversation.type === 'order' && <Package className="h-3 w-3 mr-1" />}
                              {conversation.type}
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatRelativeTime(conversation.lastMessageAt)}
                          </span>
                        </div>

                        {/* Subject / Product */}
                        {conversation.product && (
                          <div className="flex items-center gap-2 mb-1">
                            <img
                              src={conversation.product.thumbnail || '/placeholder-product.jpg'}
                              alt={conversation.product.name}
                              className="w-8 h-8 rounded object-cover"
                            />
                            <span className="text-sm text-muted-foreground truncate">
                              {conversation.product.name}
                            </span>
                          </div>
                        )}

                        {/* Last Message */}
                        <p className={`text-sm truncate ${
                          conversation.buyerUnreadCount > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'
                        }`}>
                          {conversation.lastMessage?.content || 'No messages yet'}
                        </p>
                      </div>

                      {/* Arrow */}
                      <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
