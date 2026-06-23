'use client'

import { useMemo } from 'react'
import { useBuildStore } from '@/stores/useBuild.store'
import { useTTKStore } from '@/stores/useTTK.store'
import type { InfoColor } from '@/types/item.type'
import { infoColorMap } from '@/types/item.type'
import { messageToString } from '@/utils/itemUtils'
import { computePrimeFromBuild } from '@/views/calcs/builds/utils/computePrimeFromBuild'
import type { TTKSeries } from '../components/TTKChart'
import { COLORS } from '../constants/ttk'
import {
	buildSeries,
	calcTTKAtDist,
	getAmmoType,
	getDamageBlock,
} from '../utils'
import type { useTTKData } from './useTTKData'

export function useTTKComputations(data: ReturnType<typeof useTTKData>) {
	const {
		weapons,
		allAmmo,
		plates,
		armors,
		containers,
		artefacts,
		consumables,
		locale,
	} = data

	const { savedBuilds } = useBuildStore()
	const {
		slots,
		focusedSlotId,
		bulletRes,
		vitality,
		hitZone,
		plateId,
		plateDurability,
		buildId,
	} = useTTKStore()

	const weaponMap = useMemo(
		() => new Map(weapons.map((w) => [w.id, w])),
		[weapons]
	)
	const ammoMap = useMemo(
		() => new Map(allAmmo.map((a) => [a.id, a])),
		[allAmmo]
	)

	const ammoByType = useMemo(() => {
		const map = new Map<string, (typeof allAmmo)[0][]>()
		for (const a of allAmmo) {
			const key = getAmmoType(a)
			if (!map.has(key)) map.set(key, [])
			map.get(key)!.push(a)
		}
		return map
	}, [allAmmo])

	const selectedPlate = useMemo(
		() => plates.find((p) => p.id === plateId) ?? null,
		[plates, plateId]
	)

	const { bulletRes: effectiveBr, vitality: effectiveVit } = useMemo(() => {
		if (buildId) {
			const saved = savedBuilds.find((b) => b.id === buildId)
			if (saved) {
				const result = computePrimeFromBuild(
					saved.build,
					armors,
					containers,
					artefacts,
					consumables,
					locale
				)
				return result
			}
		}
		return { bulletRes, vitality, prime: 0 }
	}, [
		buildId,
		savedBuilds,
		armors,
		containers,
		artefacts,
		consumables,
		locale,
		bulletRes,
		vitality,
	])

	const prime = useMemo(() => {
		return ((100 + effectiveBr) * (effectiveVit + 100)) / 100
	}, [effectiveBr, effectiveVit])

	const activeSlots = useMemo(() => slots.filter((s) => s.weaponId), [slots])

	const focusedSlot = useMemo(
		() =>
			slots.find((s) => s.id === focusedSlotId && s.weaponId) ??
			activeSlots[0] ??
			null,
		[slots, focusedSlotId, activeSlots]
	)

	const focusedWeapon = useMemo(
		() =>
			focusedSlot ? (weaponMap.get(focusedSlot.weaponId) ?? null) : null,
		[focusedSlot, weaponMap]
	)

	const focusedAmmo = useMemo(
		() => (focusedSlot ? (ammoMap.get(focusedSlot.ammoId) ?? null) : null),
		[focusedSlot, ammoMap]
	)

	const weaponOptions = useMemo(
		() => weapons.filter((w) => getDamageBlock(w) !== null),
		[weapons]
	)

	const focusedItemColor = infoColorMap[focusedWeapon?.color as InfoColor]

	const plate = useMemo(
		() => (hitZone === 'body' ? selectedPlate : null),
		[hitZone, selectedPlate]
	)

	const ttkSeries: TTKSeries[] = useMemo(
		() =>
			activeSlots
				.map((s, i) => {
					const weapon = weaponMap.get(s.weaponId)
					if (!weapon) return null
					const ammo = ammoMap.get(s.ammoId) ?? null
					return {
						...buildSeries(
							weapon,
							ammo,
							effectiveBr,
							effectiveVit,
							hitZone,
							s.variantIndex,
							s.useBurstRof,
							plate,
							plateDurability
						),
						color: COLORS[i % COLORS.length],
						labelColor: infoColorMap[weapon.color as InfoColor],
					}
				})
				.filter((s): s is NonNullable<typeof s> => s !== null),
		[
			weaponMap,
			ammoMap,
			effectiveBr,
			effectiveVit,
			hitZone,
			activeSlots,
			plate,
			plateDurability,
		]
	)

	const summaryRows = useMemo(
		() =>
			activeSlots
				.map((s, i) => {
					const weapon = weaponMap.get(s.weaponId)
					if (!weapon) return null
					const ammo = ammoMap.get(s.ammoId) ?? null
					const block = getDamageBlock(weapon)

					const result0 = calcTTKAtDist(
						weapon,
						ammo,
						effectiveBr,
						effectiveVit,
						hitZone,
						0,
						s.variantIndex,
						s.useBurstRof,
						plate,
						plateDurability
					)
					const resultMax = block
						? calcTTKAtDist(
								weapon,
								ammo,
								effectiveBr,
								effectiveVit,
								hitZone,
								block.maxDistance,
								s.variantIndex,
								s.useBurstRof,
								plate,
								plateDurability
							)
						: result0

					return {
						label: messageToString(weapon.name, locale),
						color: COLORS[i % COLORS.length],
						weaponColor: weapon.color,
						ttk0: result0.ttk,
						ttkMax: resultMax.ttk,
						shots0: result0.shots,
						shotsMax: resultMax.shots,
						maxDist: block?.maxDistance ?? 0,
					}
				})
				.filter((r): r is NonNullable<typeof r> => r !== null),
		[
			weaponMap,
			ammoMap,
			effectiveBr,
			effectiveVit,
			hitZone,
			activeSlots,
			locale,
			plate,
			plateDurability,
		]
	)

	const maxDist = useMemo(() => {
		let m = 100
		for (const s of activeSlots) {
			const b = getDamageBlock(weaponMap.get(s.weaponId))
			if (b && b.maxDistance > m) m = b.maxDistance
		}
		return m
	}, [activeSlots, weaponMap])

	return {
		weaponMap,
		ammoMap,
		ammoByType,
		selectedPlate,
		prime,
		activeSlots,
		focusedSlot,
		focusedWeapon,
		focusedAmmo,
		weaponOptions,
		focusedItemColor,
		plate,
		ttkSeries,
		summaryRows,
		maxDist,
	}
}
