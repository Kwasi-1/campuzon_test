import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, extractData, extractError } from '@/lib/api';
import type { Conversation, ChatMessage } from '@/types';
import toast from 'react-hot-toast';

// Query Keys
export const chatKeys = {
  all: ['chat'] as const,
  conversations: () => [...chatKeys.all, 'conversations'] as const,
  conversation: (id: string) => [...chatKeys.all, 'conversation', id] as const,
  messages: (conversationId: string) => [...chatKeys.all, 'messages', conversationId] as const,
};

// Get all conversations
export function useConversations() {
  return useQuery<Conversation[]>({
    queryKey: chatKeys.conversations(),
    queryFn: async (): Promise<Conversation[]> => {
      const response = await api.get('/chat/conversations');
      return extractData<Conversation[]>(response);
    },
  });
}

// Get single conversation
export function useConversation(id: string) {
  return useQuery<Conversation>({
    queryKey: chatKeys.conversation(id),
    queryFn: async (): Promise<Conversation> => {
      const response = await api.get(`/chat/conversations/${id}`);
      return extractData<Conversation>(response);
    },
    enabled: !!id,
  });
}

// Get messages for a conversation
export function useMessages(conversationId: string) {
  return useQuery<ChatMessage[]>({
    queryKey: chatKeys.messages(conversationId),
    queryFn: async (): Promise<ChatMessage[]> => {
      const response = await api.get(`/chat/conversations/${conversationId}/messages`);
      return extractData<ChatMessage[]>(response);
    },
    enabled: !!conversationId,
    refetchInterval: 5000, // Poll every 5 seconds
  });
}

// Start or get conversation with a user
export function useStartConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recipientId: string) => {
      const response = await api.post('/chat/conversations', { recipientId });
      return extractData(response);
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
    mutationFn: async ({ conversationId, content }: { conversationId: string; content: string }) => {
      const response = await api.post(`/chat/conversations/${conversationId}/messages`, { content });
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
