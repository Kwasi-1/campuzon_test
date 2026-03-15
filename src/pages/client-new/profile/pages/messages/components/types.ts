import type { Conversation } from "@/types-new";

export type ConversationFilter = "all" | "order" | "inquiry" | "support";

export type SelectedImage = {
  file: File;
  previewUrl: string;
};

export type MockMessage = {
  id: string;
  senderID: string | null;
  content: string;
  timestamp: string;
  isOwnMessage?: boolean;
  isRead: boolean;
  isSystemMessage?: boolean;
  imageUrl?: string;
};

export type ConversationWithOptionalData = Conversation;
