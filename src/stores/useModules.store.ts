import { modulesService } from '@/services/calcs/modules.service'
import type {
	ModuleGroupKey,
	ModulesData,
	ModuleSlotConfig,
} from '@/types/module.type'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import raw from '../../modules.json'

export const MODULE_GROUP_KEYS: ModuleGroupKey[] = ['add-on', 'deviation', 'concept']

export type ModulesStatus = 'idle' | 'loading' | 'success' | 'error'

const defaultSlots = (): Record<ModuleGroupKey, ModuleSlotConfig> => ({
	'add-on': { moduleKey: '', quality: 0 },
	deviation: { moduleKey: '', quality: 0 },
	concept: { moduleKey: '', quality: 0 },
})

interface ModulesState {
	slots: Record<ModuleGroupKey, ModuleSlotConfig>
	data: ModulesData
	status: ModulesStatus
	setModule: (group: ModuleGroupKey, moduleKey: string) => void
	setQuality: (group: ModuleGroupKey, quality: number) => void
	resetGroup: (group: ModuleGroupKey) => void
	load: () => Promise<void>
}

export const useModulesStore = create<ModulesState>()(
	persist(
		(set, get) => ({
			data: raw as ModulesData,
			status: 'idle',

			load: async () => {
				const { status } = get()
				if (status === 'loading' || status === 'success') return

				set({ status: 'loading' })

				try {
					const data = await modulesService.getModules()
					set({ data, status: 'success' })
				} catch {
					set({ status: 'error' })
				}
			},
			slots: defaultSlots(),

			setModule: (group, moduleKey) =>
				set((state) => ({
					slots: {
						...state.slots,
						[group]: { ...state.slots[group], moduleKey },
					},
				})),

			setQuality: (group, quality) =>
				set((state) => ({
					slots: {
						...state.slots,
						[group]: { ...state.slots[group], quality },
					},
				})),

			resetGroup: (group) =>
				set((state) => ({
					slots: {
						...state.slots,
						[group]: { moduleKey: '', quality: 0 },
					},
				})),
		}),
		{
			name: 'modules-storage',
			partialize: (state) => ({
				slots: state.slots,
			}),
		}
	)
)
