import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { modulesService } from '@/services/calcs/modules.service'
import type {
	ModuleGroupKey,
	ModuleSlotConfig,
	ModulesData,
} from '@/types/module.type'

const EMPTY_MODULES_DATA: ModulesData = {
	qualityRarities: [],
	groups: [],
}

export const MODULE_GROUP_KEYS: ModuleGroupKey[] = [
	'add-on',
	'deviation',
	'concept',
]

type ModulesStatus = 'idle' | 'loading' | 'success' | 'error'

export type SavedModule = {
	id: string
	name: string
	slots: Record<ModuleGroupKey, ModuleSlotConfig>
	createdAt: number
	updatedAt: number
}

const defaultSlots = (): Record<ModuleGroupKey, ModuleSlotConfig> => ({
	'add-on': { moduleKey: '', quality: 0 },
	deviation: { moduleKey: '', quality: 0 },
	concept: { moduleKey: '', quality: 0 },
})

interface ModulesState {
	slots: Record<ModuleGroupKey, ModuleSlotConfig>
	data: ModulesData
	status: ModulesStatus

	savedModules: SavedModule[]
	currentModuleId: string | null

	setModule: (group: ModuleGroupKey, moduleKey: string) => void
	setQuality: (group: ModuleGroupKey, quality: number) => void
	resetGroup: (group: ModuleGroupKey) => void
	load: () => Promise<void>

	saveModule: (name: string) => void
	loadModule: (id: string) => void
	deleteModule: (id: string) => void
	updateModule: (id: string, data: Partial<Pick<SavedModule, 'name'>>) => void
	autoSave: () => void
	resetModule: () => void
}

const doAutoSave = (
	set: (
		state:
			| Partial<ModulesState>
			| ((state: ModulesState) => Partial<ModulesState>)
	) => void,
	get: () => ModulesState
) => {
	const { slots, savedModules, currentModuleId, data } = get()

	if (!currentModuleId) {
		const now = Date.now()
		const id = crypto.randomUUID()

		const groupLabels = MODULE_GROUP_KEYS.map((key) => {
			const group = data.groups.find((g) => g.key === key)
			return group?.lines.ru ?? key
		})
			.filter((_, i) => slots[MODULE_GROUP_KEYS[i]].moduleKey)
			.join(', ')

		const name = groupLabels
			? `Модули: ${groupLabels}`
			: 'Новая конфигурация'

		const newModule: SavedModule = {
			id,
			name,
			slots: JSON.parse(JSON.stringify(slots)),
			createdAt: now,
			updatedAt: now,
		}
		set({
			savedModules: [...savedModules, newModule],
			currentModuleId: id,
		})
		return
	}

	const index = savedModules.findIndex((m) => m.id === currentModuleId)
	if (index === -1) return

	savedModules[index] = {
		...savedModules[index],
		slots: JSON.parse(JSON.stringify(slots)),
		updatedAt: Date.now(),
	}

	set({ savedModules: [...savedModules] })
}

export const useModulesStore = create<ModulesState>()(
	persist(
		(set, get) => ({
			data: EMPTY_MODULES_DATA,
			status: 'idle',

			savedModules: [],
			currentModuleId: null,

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

			setModule: (group, moduleKey) => {
				set((state) => ({
					slots: {
						...state.slots,
						[group]: { ...state.slots[group], moduleKey },
					},
				}))
				doAutoSave(set, get)
			},

			setQuality: (group, quality) => {
				set((state) => ({
					slots: {
						...state.slots,
						[group]: { ...state.slots[group], quality },
					},
				}))
				doAutoSave(set, get)
			},

			resetGroup: (group) => {
				set((state) => ({
					slots: {
						...state.slots,
						[group]: { moduleKey: '', quality: 0 },
					},
				}))
				doAutoSave(set, get)
			},

			saveModule: (name) => {
				const { slots, savedModules } = get()
				const now = Date.now()
				const id = crypto.randomUUID()

				const newModule: SavedModule = {
					id,
					name,
					slots: JSON.parse(JSON.stringify(slots)),
					createdAt: now,
					updatedAt: now,
				}

				set({
					savedModules: [...savedModules, newModule],
					currentModuleId: id,
				})
			},

			loadModule: (id) => {
				const { slots, savedModules, currentModuleId } = get()

				if (currentModuleId) {
					const currentIndex = savedModules.findIndex(
						(m) => m.id === currentModuleId
					)
					if (currentIndex !== -1) {
						savedModules[currentIndex] = {
							...savedModules[currentIndex],
							slots: JSON.parse(JSON.stringify(slots)),
							updatedAt: Date.now(),
						}
					}
				}

				const saved = savedModules.find((m) => m.id === id)
				if (!saved) return

				set({
					slots: JSON.parse(JSON.stringify(saved.slots)),
					currentModuleId: id,
				})
			},

			deleteModule: (id) => {
				const { savedModules, currentModuleId } = get()
				set({
					savedModules: savedModules.filter((m) => m.id !== id),
					currentModuleId:
						currentModuleId === id ? null : currentModuleId,
				})
			},

			updateModule: (id, data) => {
				const { savedModules } = get()
				set({
					savedModules: savedModules.map((m) =>
						m.id === id
							? { ...m, ...data, updatedAt: Date.now() }
							: m
					),
				})
			},

			autoSave: () => {
				doAutoSave(set, get)
			},

			resetModule: () =>
				set({ slots: defaultSlots(), currentModuleId: null }),
		}),
		{
			name: 'modules-storage',
			partialize: (state) => ({
				slots: state.slots,
				savedModules: state.savedModules,
				currentModuleId: state.currentModuleId,
			}),
		}
	)
)
