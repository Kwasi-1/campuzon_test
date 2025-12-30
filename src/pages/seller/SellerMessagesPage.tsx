import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MessageCircle,
  Search,
  Star,
  Clock,
  CheckCheck,
  Package,
} from 'lucide-react';
import {
  Card,
  CardContent,
  Badge,
  Input,
  Select,
  EmptyState,
  Breadcrumb,
} from '@/components/ui';
import { useAuthStore } from '@/stores';
import { formatRelativeTime } from '@/lib/utils';

// Mock conversations data for seller
const mockSellerConversations = [
  {
    id: 'conv-1',
    customer: {
      id: 'user-1',
      name: 'Kwame Asante',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
    },
    product: {
      id: 'prod-1',
      name: 'iPhone 14 Pro Max',
      image: 'https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=100',
    },
    lastMessage: {
      content: 'Is this still available? I need it urgently.',
      timestamp: '2024-12-29T10:30:00Z',
      isFromCustomer: true,
    },
    unreadCount: 2,
    hasOrder: false,
    isStarred: true,
  },
  {
    id: 'conv-2',
    customer: {
      id: 'user-2',
      name: 'Akosua Mensah',
      image: null,
    },
    product: {
      id: 'prod-2',
      name: 'AirPods Pro',
      image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=100',
    },
    lastMessage: {
      content: 'I\'ll deliver it to Akuafo Hall by 5pm today.',
      timestamp: '2024-12-29T09:15:00Z',
      isFromCustomer: false,
    },
    unreadCount: 0,
    hasOrder: true,
    orderNumber: 'CPZ-DEF456',
    isStarred: false,
  },
  {
    id: 'conv-3',
    customer: {
      id: 'user-3',
      name: 'Kofi Owusu',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    },
    product: {
      id: 'prod-3',
      name: 'MacBook Air M2',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=100',
    },
    lastMessage: {
      content: 'Thank you! The laptop is amazing.',
      timestamp: '2024-12-28T16:45:00Z',
      isFromCustomer: true,
    },
    unreadCount: 0,
    hasOrder: true,
    orderNumber: 'CPZ-GHI789',
    isStarred: false,
  },
  {
    id: 'conv-4',
    customer: {
      id: 'user-4',
      name: 'Ama Darko',
      image: null,
    },
    product: {
      id: 'prod-4',
      name: 'Samsung Galaxy S24',
      image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=100',
    },
    lastMessage: {
      content: 'Can you do GHS 4,000 for it?',
      timestamp: '2024-12-28T14:20:00Z',
      isFromCustomer: true,
    },
    unreadCount: 1,
    hasOrder: false,
    isStarred: false,
  },
  {
    id: 'conv-5',
    customer: {
      id: 'user-5',
      name: 'Yaw Boateng',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
    },
    product: null,
    lastMessage: {
      content: 'Do you have any iPhone 15 in stock?',
      timestamp: '2024-12-27T11:00:00Z',
      isFromCustomer: true,
    },
    unreadCount: 0,
    hasOrder: false,
    isStarred: true,
  },
];

const FILTER_OPTIONS = [
  { value: 'all', label: 'All Messages' },
  { value: 'unread', label: 'Unread' },
  { value: 'starred', label: 'Starred' },
  { value: 'with-order', label: 'With Orders' },
  { value: 'no-order', label: 'Without Orders' },
];

export function SellerMessagesPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');

  // Filter conversations
  const filteredConversations = useMemo(() => {
    let conversations = [...mockSellerConversations];

    // Apply filter
    switch (filter) {
      case 'unread':
        conversations = conversations.filter((c) => c.unreadCount > 0);
        break;
      case 'starred':
        conversations = conversations.filter((c) => c.isStarred);
        break;
      case 'with-order':
        conversations = conversations.filter((c) => c.hasOrder);
        break;
      case 'no-order':
        conversations = conversations.filter((c) => !c.hasOrder);
        break;
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      conversations = conversations.filter(
        (c) =>
          c.customer.name.toLowerCase().includes(query) ||
          c.product?.name.toLowerCase().includes(query) ||
          c.lastMessage.content.toLowerCase().includes(query)
      );
    }

    return conversations;
  }, [searchQuery, filter]);

  // Stats
  const unreadCount = mockSellerConversations.filter((c) => c.unreadCount > 0).length;
  const totalMessages = mockSellerConversations.length;

  // Redirect if not authenticated or not a store owner
  if (!isAuthenticated || !user?.isOwner) {
    navigate('/login');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb
        items={[
          { label: 'Seller Dashboard', href: '/seller/dashboard' },
          { label: 'Messages' },
        ]}
        className="mb-6"
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Messages</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0 ? (
              <span>
                <span className="text-primary font-medium">{unreadCount} unread</span> · {totalMessages} total
              </span>
            ) : (
              `${totalMessages} conversations`
            )}
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter */}
            <Select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              options={FILTER_OPTIONS}
              className="w-full md:w-48"
            />
          </div>
        </CardContent>
      </Card>

      {/* Conversations List */}
      {filteredConversations.length === 0 ? (
        <EmptyState
          icon={<MessageCircle className="h-16 w-16" />}
          title={searchQuery || filter !== 'all' ? 'No matching messages' : 'No messages yet'}
          description={
            searchQuery || filter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Customer messages will appear here'
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
              <Link to={`/seller/messages/${conversation.id}`}>
                <Card
                  className={`hover:shadow-md transition-shadow cursor-pointer ${
                    conversation.unreadCount > 0 ? 'border-primary/50 bg-primary/5' : ''
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Customer Avatar */}
                      {conversation.customer.image ? (
                        <img
                          src={conversation.customer.image}
                          alt={conversation.customer.name}
                          className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="font-medium text-primary text-lg">
                            {conversation.customer.name[0]}
                          </span>
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2">
                            <h3 className={`font-medium ${conversation.unreadCount > 0 ? 'font-semibold' : ''}`}>
                              {conversation.customer.name}
                            </h3>
                            {conversation.isStarred && (
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            )}
                            {conversation.hasOrder && (
                              <Badge variant="secondary" className="text-xs">
                                <Package className="h-3 w-3 mr-1" />
                                {conversation.orderNumber}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatRelativeTime(conversation.lastMessage.timestamp)}
                          </div>
                        </div>

                        {/* Product Context */}
                        {conversation.product && (
                          <div className="flex items-center gap-2 mb-2">
                            <img
                              src={conversation.product.image}
                              alt={conversation.product.name}
                              className="w-8 h-8 rounded object-cover"
                            />
                            <span className="text-sm text-muted-foreground truncate">
                              Re: {conversation.product.name}
                            </span>
                          </div>
                        )}

                        {/* Last Message */}
                        <div className="flex items-center justify-between gap-2">
                          <p
                            className={`text-sm truncate ${
                              conversation.unreadCount > 0
                                ? 'text-foreground font-medium'
                                : 'text-muted-foreground'
                            }`}
                          >
                            {!conversation.lastMessage.isFromCustomer && (
                              <span className="text-muted-foreground mr-1">You:</span>
                            )}
                            {conversation.lastMessage.content}
                          </p>

                          {conversation.unreadCount > 0 && (
                            <Badge className="bg-primary text-white">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                          {conversation.unreadCount === 0 && !conversation.lastMessage.isFromCustomer && (
                            <CheckCheck className="h-4 w-4 text-blue-500 flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {/* Quick Stats */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <MessageCircle className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{totalMessages}</p>
            <p className="text-sm text-muted-foreground">Total Chats</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Badge className="h-6 w-6 mx-auto mb-2 bg-primary/10 text-primary rounded-full flex items-center justify-center">
              {unreadCount}
            </Badge>
            <p className="text-2xl font-bold">{unreadCount}</p>
            <p className="text-sm text-muted-foreground">Unread</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Star className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
            <p className="text-2xl font-bold">
              {mockSellerConversations.filter((c) => c.isStarred).length}
            </p>
            <p className="text-sm text-muted-foreground">Starred</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Package className="h-6 w-6 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold">
              {mockSellerConversations.filter((c) => c.hasOrder).length}
            </p>
            <p className="text-sm text-muted-foreground">With Orders</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
