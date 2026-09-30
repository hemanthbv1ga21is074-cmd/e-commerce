import { create } from 'zustand';

interface UIStore {
  megaMenuOpen: string | null;
  mobileDrawerOpen: boolean;
  searchOpen: boolean;
  devPanelOpen: boolean;
  setMegaMenu: (section: string | null) => void;
  toggleMobileDrawer: () => void;
  closeMobileDrawer: () => void;
  openSearch: () => void;
  toggleSearch: () => void;
  closeSearch: () => void;
  toggleDevPanel: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  megaMenuOpen: null,
  mobileDrawerOpen: false,
  searchOpen: false,
  devPanelOpen: false,
  setMegaMenu: (section) => set({ megaMenuOpen: section }),
  toggleMobileDrawer: () => set((s) => ({ mobileDrawerOpen: !s.mobileDrawerOpen })),
  closeMobileDrawer: () => set({ mobileDrawerOpen: false }),
  openSearch: () => set({ searchOpen: true }),
  toggleSearch: () => set((s) => ({ searchOpen: !s.searchOpen })),
  closeSearch: () => set({ searchOpen: false }),
  toggleDevPanel: () => set((s) => ({ devPanelOpen: !s.devPanelOpen })),
}));
