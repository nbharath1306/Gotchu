import { create } from 'zustand'

interface User {
  id: string;
  email?: string | null;
  name?: string | null;
  picture?: string | null;
  [key: string]: unknown;
}

interface AppState {
  user: User | null
  setUser: (user: User | null) => void
}

export const useStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}))
