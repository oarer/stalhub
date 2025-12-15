import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UwuState {
    uwuMode: boolean
    setUwuMode: (enabled: boolean) => void
    toggleUwu: () => void
}

export const useUwuStore = create<UwuState>()(
    persist(
        (set) => ({
            uwuMode: false,
            setUwuMode: (enabled) => set({ uwuMode: enabled }),
            toggleUwu: () => set((state) => ({ uwuMode: !state.uwuMode })),
        }),
        {
            name: 'uwu-mode',
        }
    )
)
