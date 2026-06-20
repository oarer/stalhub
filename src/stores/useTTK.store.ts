import { HitZone } from '@/views/calcs/ttk/constants/ttk'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface WeaponSlot {
	id: string
	weaponId: string
	ammoId: string
	variantIndex: number
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

	setSlots: (slots: WeaponSlot[]) => void
	setBulletRes: (v: number) => void
	setVitality: (v: number) => void
	setHitZone: (v: HitZone) => void
	setFocusedSlotId: (id: string | null) => void
	setPlateId: (id: string) => void
	setPlateDurability: (v: number) => void
	setBuildId: (id: string | null) => void
}

export const useTTKStore = create<TTKState>()(
	persist(
		(set) => ({
			slots: [{ id: '1', weaponId: '', ammoId: '', variantIndex: 15 }],
			bulletRes: 0,
			vitality: 0,
			hitZone: 'body',
			focusedSlotId: null,
			plateId: '',
			plateDurability: 100,
			buildId: null,

			setSlots: (slots) => set({ slots }),
			setBulletRes: (bulletRes) => set({ bulletRes }),
			setVitality: (vitality) => set({ vitality }),
			setHitZone: (hitZone) => set({ hitZone }),
			setFocusedSlotId: (focusedSlotId) => set({ focusedSlotId }),
			setPlateId: (plateId) => set({ plateId }),
			setPlateDurability: (plateDurability) => set({ plateDurability }),
			setBuildId: (buildId) => set({ buildId }),
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
			}),
		}
	)
)
