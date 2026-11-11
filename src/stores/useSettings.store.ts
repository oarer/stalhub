import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsState {
	showUno: boolean
	setShowUno: (enabled: boolean) => void
}

export const useSettingsStore = create<SettingsState>()(
	persist(
		(set) => ({
			showUno: true,
			setShowUno: (enabled) => set({ showUno: enabled }),
		}),
		{
			name: 'app-settings',
			partialize: (state) => ({ showUno: state.showUno }),
		}
	)
)
