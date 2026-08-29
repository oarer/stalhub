'use client'

import { useEffect, useState } from 'react'
import type { WeaponSlot } from '@/stores/useTTK.store'
import { useTTKStore } from '@/stores/useTTK.store'
import type { Item } from '@/types/item.type'
import { getAmmoType, getCompatibleAmmo, pickDefaultAmmo } from '../utils'

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
	allAmmo: Item[]
) {
	const { slots, setSlots, setFocusedSlotId, focusedSlotId } = useTTKStore()
	const [pendingSlotId, setPendingSlotId] = useState<string | null>(null)

	const updateSlot = (id: string, patch: Partial<WeaponSlot>) =>
		setSlots(slots.map((s) => (s.id === id ? { ...s, ...patch } : s)))

	const handleWeaponSelect = (slotId: string, weaponId: string) => {
		const w = weaponMap.get(weaponId)
		const compatible = w ? getCompatibleAmmo(allAmmo, getAmmoType(w)) : []
		const slot = slots.find((s) => s.id === slotId)
		const currentAmmoCompatible =
			slot?.ammoId && compatible.some((a) => a.id === slot.ammoId)

		updateSlot(slotId, {
			weaponId,
			ammoId: currentAmmoCompatible
				? slot!.ammoId
				: (pickDefaultAmmo(compatible)?.id ?? ''),
		})
		setFocusedSlotId(slotId)
		setPendingSlotId(null)
	}

	useEffect(() => {
		const missing = slots.filter((s) => s.weaponId && !s.ammoId)
		if (missing.length === 0) return

		let next = slots
		for (const s of missing) {
			const w = weaponMap.get(s.weaponId)
			if (!w) continue
			const compatible = getCompatibleAmmo(allAmmo, getAmmoType(w))
			const def = pickDefaultAmmo(compatible)
			if (def) {
				next = next.map((slot) =>
					slot.id === s.id ? { ...slot, ammoId: def.id } : slot
				)
			}
		}
		setSlots(next)
	}, [slots, weaponMap, allAmmo, setSlots])

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
