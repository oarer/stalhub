import { create } from 'zustand'

import type { ItemListing } from '@/types/api.type'

interface ItemState {
    items: ItemListing[] | null
    commit: string | null
    loading: boolean
    error: string | null

    setItems: (items: ItemListing[]) => void
    setCommit: (commit: string) => void
    setLoading: (state: boolean) => void
    setError: (err: string | null) => void
}

export const useItemStore = create<ItemState>((set) => ({
    items: null,
    commit: null,
    loading: false,
    error: null,

    setItems: (items) => set({ items }),
    setCommit: (commit) => set({ commit }),
    setLoading: (state) => set({ loading: state }),
    setError: (error) => set({ error }),
}))
