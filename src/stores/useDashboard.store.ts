import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { findFreePosition } from '@/views/dashboard/layouts/layoutUtils'

export type DashboardItem = {
	id: string
	widgetId: string
	x: number
	y: number
	w: number
	h: number
}

type DashboardState = {
	items: DashboardItem[]
	hasHydrated: boolean
	addWidget: (widgetId: string, w: number, h: number) => void
	removeWidget: (id: string) => void
	moveItem: (id: string, x: number, y: number) => void
	resizeItem: (id: string, w: number, h: number) => void
	resetLayout: () => void
	setHasHydrated: (hydrated: boolean) => void
}

export const useDashboardStore = create<DashboardState>()(
	persist(
		(set) => ({
			items: [],
			hasHydrated: false,

			addWidget: (widgetId, w, h) =>
				set((state) => {
					const { x, y } = findFreePosition(state.items, w, h)
					const item: DashboardItem = {
						id: `w-${Date.now()}-${Math.random()
							.toString(36)
							.slice(2, 8)}`,
						widgetId,
						x,
						y,
						w,
						h,
					}
					return { items: [...state.items, item] }
				}),

			removeWidget: (id) =>
				set((state) => ({
					items: state.items.filter((item) => item.id !== id),
				})),

			moveItem: (id, x, y) =>
				set((state) => {
					const target = state.items.find((item) => item.id === id)
					if (!target) return state
					return {
						items: state.items.map((item) =>
							item.id === id
								? {
										...item,
										x: Math.max(x, 0),
										y: Math.max(y, 0),
									}
								: item
						),
					}
				}),

			resizeItem: (id, w, h) =>
				set((state) => {
					const target = state.items.find((item) => item.id === id)
					if (!target) return state
					return {
						items: state.items.map((item) =>
							item.id === id
								? {
										...item,
										w: Math.max(w, 0),
										h: Math.max(h, 0),
									}
								: item
						),
					}
				}),

			resetLayout: () => set({ items: [] }),
			setHasHydrated: (hasHydrated) => set({ hasHydrated }),
		}),
		{
			name: 'dashboard',
			partialize: (state) => ({ items: state.items }),
			onRehydrateStorage: () => (state) => {
				state?.setHasHydrated(true)
			},
		}
	)
)
