'use client'

import { useState } from 'react'
import type { Item } from '@/types/item.type'
import type { WeaponSlot } from '@/stores/useTTK.store'
import { useTTKStore } from '@/stores/useTTK.store'
import { getAmmoType } from '../utils'

const mkSlot = (): WeaponSlot => ({
	id:
		typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
			? crypto.randomUUID()
			: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`,
	weaponId: '',
	ammoId: '',
	variantIndex: 15,
	useBurstRof: false,
})

export function useTTKWeaponSlots(
	weaponMap: Map<string, Item>,
	ammoByType: Map<string, Item[]>
) {
	const { slots, setSlots, setFocusedSlotId, focusedSlotId } = useTTKStore()
	const [pendingSlotId, setPendingSlotId] = useState<string | null>(null)

	const updateSlot = (id: string, patch: Partial<WeaponSlot>) =>
		setSlots(slots.map((s) => (s.id === id ? { ...s, ...patch } : s)))

	const handleWeaponSelect = (slotId: string, weaponId: string) => {
		const w = weaponMap.get(weaponId)
		const compatible = w ? (ammoByType.get(getAmmoType(w)) ?? []) : []
		const slot = slots.find((s) => s.id === slotId)
		const currentAmmoCompatible =
			slot?.ammoId && compatible.some((a) => a.id === slot.ammoId)

		updateSlot(slotId, {
			weaponId,
			ammoId:
				compatible.length === 1
					? compatible[0].id
					: currentAmmoCompatible
						? slot!.ammoId
						: '',
		})
		setFocusedSlotId(slotId)
		setPendingSlotId(null)
	}

	const addSlot = () => {
		const newSlot = mkSlot()
		setSlots([...slots, newSlot])
		setFocusedSlotId(newSlot.id)
		setPendingSlotId(newSlot.id)
	}

	const removeSlot = (id: string) => {
		setSlots(slots.filter((s) => s.id !== id))
	}

	return {
		slots,
		pendingSlotId,
		focusedSlotId,
		updateSlot,
		handleWeaponSelect,
		addSlot,
		removeSlot,
		setFocusedSlotId,
	}
}
