import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface NsfwGateState {
	ageConfirmed: boolean
	confirmAge: () => void
}

export const useNsfwGateStore = create<NsfwGateState>()(
	persist(
		(set) => ({
			ageConfirmed: false,
			confirmAge: () => set({ ageConfirmed: true }),
		}),
		{
			name: 'nsfw-age-gate',
			partialize: (state) => ({ ageConfirmed: state.ageConfirmed }),
		}
	)
)