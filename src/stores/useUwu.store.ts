import { create } from 'zustand'

interface UwuState {
  uwuMode: boolean
  setUwuMode: (enabled: boolean) => void
  toggleUwu: () => void
}

export const useUwuStore = create<UwuState>((set) => ({
  uwuMode: false,
  setUwuMode: (enabled) => set({ uwuMode: enabled }),
  toggleUwu: () => set((state) => ({ uwuMode: !state.uwuMode })),
}))