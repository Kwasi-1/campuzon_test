import { create } from 'zustand';

type ModalType = 
  | 'login'
  | 'register'
  | 'confirmDelete'
  | 'orderDetails'
  | 'reviewProduct'
  | 'reportProduct'
  | 'escrowDetails'
  | 'createStore'
  | 'editProduct'
  | 'imagePreview'
  | null;

interface ModalData {
  [key: string]: unknown;
}

interface UIStore {
  // Sidebar
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Mobile menu
  mobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  setMobileMenuOpen: (open: boolean) => void;

  // Modal
  modalType: ModalType;
  modalData: ModalData | null;
  openModal: (type: ModalType, data?: ModalData) => void;
  closeModal: () => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;

  // Filters
  filtersOpen: boolean;
  toggleFilters: () => void;
  setFiltersOpen: (open: boolean) => void;

  // Theme
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;

  // Loading states
  globalLoading: boolean;
  setGlobalLoading: (loading: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  // Sidebar
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  // Mobile menu
  mobileMenuOpen: false,
  toggleMobileMenu: () => set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),

  // Modal
  modalType: null,
  modalData: null,
  openModal: (type, data = undefined) => set({ modalType: type, modalData: data }),
  closeModal: () => set({ modalType: null, modalData: null }),

  // Search
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  searchOpen: false,
  setSearchOpen: (open) => set({ searchOpen: open }),

  // Filters
  filtersOpen: false,
  toggleFilters: () => set((state) => ({ filtersOpen: !state.filtersOpen })),
  setFiltersOpen: (open) => set({ filtersOpen: open }),

  // Theme
  theme: 'system',
  setTheme: (theme) => {
    set({ theme });
    
    // Apply theme to document
    const root = document.documentElement;
    if (theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', isDark);
    } else {
      root.classList.toggle('dark', theme === 'dark');
    }
    
    localStorage.setItem('campuzon-theme', theme);
  },

  // Loading states
  globalLoading: false,
  setGlobalLoading: (loading) => set({ globalLoading: loading }),
}));

// Initialize theme on load
if (typeof window !== 'undefined') {
  const savedTheme = localStorage.getItem('campuzon-theme') as 'light' | 'dark' | 'system' | null;
  if (savedTheme) {
    useUIStore.getState().setTheme(savedTheme);
  }
}
