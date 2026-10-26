import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

type SidebarState = {
	collapsed: boolean
	toggle: () => void
	setCollapsed: (value: boolean) => void
}

export const useSidebarStore = create<SidebarState>()(
	persist(
		(set) => ({
			collapsed: false,
			toggle: () => set((state) => ({ collapsed: !state.collapsed })),
			setCollapsed: (value) => set({ collapsed: value }),
		}),
		{
			name: 'stalhub:sidebar',
			version: 1,
			storage: createJSONStorage(() => localStorage),
		}
	)
)