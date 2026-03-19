import { create } from 'zustand';

interface AuthPromptState {
  isOpen: boolean;
  targetPath: string | null;
  message: string;
  openAuthPrompt: (targetPath?: string | null, message?: string) => void;
  closeAuthPrompt: () => void;
}

const DEFAULT_MESSAGE = 'Session expired. Please sign in again to continue.';

export const useAuthPromptStore = create<AuthPromptState>((set) => ({
  isOpen: false,
  targetPath: null,
  message: DEFAULT_MESSAGE,
  openAuthPrompt: (targetPath, message) =>
    set({
      isOpen: true,
      targetPath: targetPath ?? null,
      message: message || DEFAULT_MESSAGE,
    }),
  closeAuthPrompt: () =>
    set({
      isOpen: false,
      targetPath: null,
      message: DEFAULT_MESSAGE,
    }),
}));
