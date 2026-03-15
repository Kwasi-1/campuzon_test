import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, extractData, extractError } from '@/lib/api';
import type { Conversation, ChatMessage } from '@/types-new';
import toast from 'react-hot-toast';

type ConversationsResponse = {
  conversations?: Conversation[];
};

type ConversationResponse = {
  conversation?: Conversation;
  messages?: ChatMessage[];
};

type SendMessagePayload = {
  conversationId: string;
  content?: string;
  type?: 'text' | 'image' | 'system';
  attachments?: string[];
};

function normalizeConversation(conversation: Conversation): Conversation {
  const fallbackStore = conversation.participant?.type === 'store'
    ? {
        id: conversation.participant.id,
        name: conversation.participant.name || 'Store',
        logo: conversation.participant.image || null,
      }
    : {
        id: conversation.storeID,
        name: 'Store',
        logo: null,
      };

  return {
    ...conversation,
    store: conversation.store
      ? {
          id: conversation.store.id,
          name: conversation.store.name,
          logo: conversation.store.logo ?? null,
        }
      : fallbackStore,
    product: conversation.product
      ? {
          id: conversation.product.id,
          name: conversation.product.name,
          price: Number(conversation.product.price || 0),
          thumbnail: conversation.product.thumbnail ?? null,
        }
      : undefined,
  };
}

// Query Keys
export const chatKeys = {
  all: ['chat'] as const,
  conversations: () => [...chatKeys.all, 'conversations'] as const,
  conversation: (id: string) => [...chatKeys.all, 'conversation', id] as const,
  messages: (conversationId: string) => [...chatKeys.all, 'messages', conversationId] as const,
};

// Get all conversations
export function useConversations(enabled = true) {
  return useQuery<Conversation[]>({
    queryKey: chatKeys.conversations(),
    queryFn: async (): Promise<Conversation[]> => {
      const response = await api.get('/chat/conversations');
      const payload = extractData<Conversation[] | ConversationsResponse>(response);

      if (Array.isArray(payload)) {
        return payload.map(normalizeConversation);
      }

      return (payload.conversations || []).map(normalizeConversation);
    },
    enabled,
  });
}

// Get single conversation
export function useConversation(id: string, enabled = true) {
  return useQuery<Conversation>({
    queryKey: chatKeys.conversation(id),
    queryFn: async (): Promise<Conversation> => {
      const response = await api.get(`/chat/conversations/${id}`);
      const payload = extractData<Conversation | ConversationResponse>(response);

      if ('conversation' in (payload as ConversationResponse)) {
        return normalizeConversation((payload as ConversationResponse).conversation as Conversation);
      }

      return normalizeConversation(payload as Conversation);
    },
    enabled: enabled && !!id,
  });
}

// Get messages for a conversation
export function useMessages(conversationId: string, enabled = true) {
  return useQuery<ChatMessage[]>({
    queryKey: chatKeys.messages(conversationId),
    queryFn: async (): Promise<ChatMessage[]> => {
      const response = await api.get(`/chat/conversations/${conversationId}`);
      const payload = extractData<ConversationResponse>(response);
      return payload.messages || [];
    },
    enabled: enabled && !!conversationId,
    refetchInterval: 5000, // Poll every 5 seconds
  });
}

// Start or get conversation with a user
export function useStartConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productID, message }: { productID: string; message?: string }) => {
      const response = await api.post('/chat/conversations', { productID, message });
      const payload = extractData<{ conversation?: Conversation } | Conversation>(response);

      if ('conversation' in (payload as { conversation?: Conversation })) {
        return normalizeConversation((payload as { conversation?: Conversation }).conversation as Conversation);
      }

      return normalizeConversation(payload as Conversation);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
    },
    onError: (error) => {
      toast.error(extractError(error));
    },
  });
}

// Send message
export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ conversationId, content, type = 'text', attachments = [] }: SendMessagePayload) => {
      const response = await api.post(`/chat/conversations/${conversationId}/messages`, {
        content,
        type,
        attachments,
      });
      return extractData(response);
    },
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({ queryKey: chatKeys.messages(conversationId) });
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
    },
    onError: (error) => {
      toast.error(extractError(error));
    },
  });
}

// Mark messages as read
export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conversationId: string) => {
      const response = await api.post(`/chat/conversations/${conversationId}/read`);
      return extractData(response);
    },
    onSuccess: (_, conversationId) => {
      queryClient.invalidateQueries({ queryKey: chatKeys.conversation(conversationId) });
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
    },
  });
}

export function useUploadChatImage() {
  return useMutation({
    mutationFn: async ({ conversationId, file }: { conversationId: string; file: File }) => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post(`/chat/messages/${conversationId}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const payload = extractData<{ url: string }>(response);
      return payload.url;
    },
    onError: (error) => {
      toast.error(extractError(error));
    },
  });
}
