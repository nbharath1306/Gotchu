import { create } from 'zustand'

interface AppState {
  user: any | null
  setUser: (user: any | null) => void
}

export const useStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}))
