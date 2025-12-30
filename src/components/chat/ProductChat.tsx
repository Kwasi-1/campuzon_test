import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  X, 
  Send, 
  Minimize2,
  Store,
  Loader2
} from 'lucide-react';
import { Button, Avatar } from '@/components/ui';
import { useAuthStore } from '@/stores';
import { useStartConversation, useSendMessage, useMessages } from '@/hooks';
import { cn, formatRelativeTime } from '@/lib/utils';
import type { Product, ChatMessage, Conversation } from '@/types';

interface ProductChatProps {
  product: Product;
  onLoginRequired?: () => void;
}

export function ProductChat({ product, onLoginRequired }: ProductChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { isAuthenticated, user } = useAuthStore();
  const startConversation = useStartConversation();
  const sendMessage = useSendMessage();
  
  // Fetch messages if we have a conversation
  const { data: serverMessages, isLoading: isLoadingMessages } = useMessages(
    conversation?.id || ''
  );

  // Use server messages directly or local messages for optimistic updates
  const displayMessages = serverMessages || localMessages;

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
    if (!conversation && product.storeID) {
      try {
        const conv = await startConversation.mutateAsync(product.storeID) as Conversation;
        setConversation(conv);
      } catch (error) {
        console.error('Failed to start conversation:', error);
      }
    }
  };

  const handleSend = async () => {
    if (!message.trim() || !conversation) return;

    const messageContent = message.trim();
    setMessage('');

    // Optimistic update - add message locally
    const optimisticMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      conversationID: conversation.id,
      senderID: user?.id || null,
      content: messageContent,
      messageType: 'text',
      attachments: null,
      isRead: false,
      isSystemMessage: false,
      isDeleted: false,
      dateCreated: new Date().toISOString(),
      sender: {
        id: user?.id || '',
        displayName: user?.displayName || user?.firstName || 'You',
        profileImage: user?.profileImage || null,
      },
    };
    setLocalMessages(prev => [...prev, optimisticMessage]);

    try {
      await sendMessage.mutateAsync({
        conversationId: conversation.id,
        content: messageContent,
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      // Remove optimistic message on error
      setLocalMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickMessages = [
    `Hi! Is this ${product.name} still available?`,
    'Can you offer a discount?',
    'When can we meet for pickup?',
    'Can you tell me more about the condition?',
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
            className="fixed bottom-6 right-6 z-50"
          >
            <button
              onClick={handleOpen}
              className="group relative flex items-center justify-center h-14 w-14 bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground rounded-2xl shadow-lg hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 rotate-0 hover:rotate-6"
            >
              {/* Glow effect */}
              <span className="absolute inset-0 rounded-2xl bg-primary/40 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Icon */}
              <MessageCircle className="relative h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
              
              {/* Online indicator */}
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
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
              height: isMinimized ? 'auto' : 480
            }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-[360px] bg-background rounded-2xl shadow-2xl border overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar
                  src={product.store?.logo}
                  alt={product.store?.name}
                  fallback={product.store?.name || 'Store'}
                  size="sm"
                />
                <div>
                  <p className="font-medium text-sm">{product.store?.name || 'Seller'}</p>
                  <p className="text-xs opacity-80">Usually responds within an hour</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <Minimize2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Product Context */}
                <div className="p-3 border-b bg-muted/30">
                  <div className="flex items-center gap-3">
                    <img
                      src={product.thumbnail || product.images?.[0] || '/placeholder-product.jpg'}
                      alt={product.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{product.name}</p>
                      <p className="text-sm text-primary font-semibold">
                        GH₵ {product.price.toLocaleString()}
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
                        <p className="text-xs mt-1">Ask about the product, negotiate price, or arrange pickup.</p>
                      </div>
                      
                      {/* Quick Messages */}
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground font-medium">Quick messages:</p>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {quickMessages.map((qm, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleQuickMessage(qm)}
                              className="text-xs px-3 py-1.5 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors"
                            >
                              {qm.length > 30 ? qm.slice(0, 30) + '...' : qm}
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
                              'flex items-end gap-2',
                              isMe ? 'flex-row-reverse' : 'flex-row'
                            )}
                          >
                            {!isMe && (
                              <Avatar
                                src={msg.sender?.profileImage}
                                alt={msg.sender?.displayName || 'Seller'}
                                fallback={msg.sender?.displayName || 'S'}
                                size="xs"
                              />
                            )}
                            <div
                              className={cn(
                                'max-w-[75%] px-3 py-2 rounded-2xl text-sm',
                                isMe
                                  ? 'bg-primary text-primary-foreground rounded-br-md'
                                  : 'bg-muted rounded-bl-md'
                              )}
                            >
                              <p>{msg.content}</p>
                              <p className={cn(
                                'text-[10px] mt-1',
                                isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'
                              )}>
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
                      disabled={!message.trim() || !conversation || sendMessage.isPending}
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
