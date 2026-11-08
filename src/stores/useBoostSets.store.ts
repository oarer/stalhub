import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { BoostCategory } from '@/types/build.type'

export type BoostSet = {
	id: string
	name: string
	boosts: Record<BoostCategory, string | null>
	createdAt: number
}

type BoostSetsState = {
	sets: BoostSet[]

	addSet: (name: string, boosts: Record<BoostCategory, string | null>) => void
	removeSet: (id: string) => void
}

export const useBoostSetsStore = create<BoostSetsState>()(
	persist(
		(set) => ({
			sets: [],

			addSet: (name, boosts) => {
				set((state) => ({
					sets: [
						...state.sets,
						{
							id: crypto.randomUUID(),
							name,
							boosts: { ...boosts },
							createdAt: Date.now(),
						},
					],
				}))
			},

			removeSet: (id) => {
				set((state) => ({
					sets: state.sets.filter((boostSet) => boostSet.id !== id),
				}))
			},
		}),
		{
			name: 'boost-sets-storage',
			version: 1,
		}
	)
)
