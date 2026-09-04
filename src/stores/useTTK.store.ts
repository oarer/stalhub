import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { HitZone } from '@/views/calcs/ttk/constants/ttk'

export interface WeaponSlot {
	id: string
	weaponId: string
	ammoId: string
	variantIndex: number
	useBurstRof: boolean
	holdTime: number
	moduleKey: string
	moduleQuality: number
}

interface TTKState {
	slots: WeaponSlot[]
	bulletRes: number
	vitality: number
	hitZone: HitZone
	focusedSlotId: string | null
	plateId: string
	plateDurability: number
	buildId: string | null
	modulesEnabled: boolean

	setSlots: (slots: WeaponSlot[]) => void
	setBulletRes: (v: number) => void
	setVitality: (v: number) => void
	setHitZone: (v: HitZone) => void
	setFocusedSlotId: (id: string | null) => void
	setPlateId: (id: string) => void
	setPlateDurability: (v: number) => void
	setBuildId: (id: string | null) => void
	setModulesEnabled: (v: boolean) => void
}

export const useTTKStore = create<TTKState>()(
	persist(
		(set) => ({
			slots: [
				{
					id: '1',
					weaponId: '',
					ammoId: '',
					variantIndex: 15,
					useBurstRof: false,
					holdTime: 0,
					moduleKey: '',
					moduleQuality: 0,
				},
			],
			bulletRes: 0,
			vitality: 0,
			hitZone: 'body',
			focusedSlotId: null,
			plateId: '',
			plateDurability: 100,
			buildId: null,
			modulesEnabled: false,

			setSlots: (slots) => set({ slots }),
			setBulletRes: (bulletRes) => set({ bulletRes }),
			setVitality: (vitality) => set({ vitality }),
			setHitZone: (hitZone) => set({ hitZone }),
			setFocusedSlotId: (focusedSlotId) => set({ focusedSlotId }),
			setPlateId: (plateId) => set({ plateId }),
			setPlateDurability: (plateDurability) => set({ plateDurability }),
			setBuildId: (buildId) => set({ buildId }),
			setModulesEnabled: (modulesEnabled) => set({ modulesEnabled }),
		}),
		{
			name: 'ttk-storage',
			partialize: (s) => ({
				slots: s.slots,
				bulletRes: s.bulletRes,
				vitality: s.vitality,
				hitZone: s.hitZone,
				plateId: s.plateId,
				buildId: s.buildId,
				modulesEnabled: s.modulesEnabled,
			}),
			merge: (persisted, current) => {
				const state = persisted as Partial<TTKState> | undefined
				const slots = state?.slots ?? current.slots
				return {
					...current,
					...state,
					slots: slots.map((s) => ({
						...s,
						moduleKey:
							typeof s.moduleKey === 'string' ? s.moduleKey : '',
						moduleQuality:
							typeof s.moduleQuality === 'number'
								? s.moduleQuality
								: 0,
						holdTime:
							typeof s.holdTime === 'number' ? s.holdTime : 0,
					})),
				}
			},
		}
	)
)
