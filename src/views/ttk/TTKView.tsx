'use client'

import { Icon } from '@iconify/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useMemo } from 'react'
import { unbounded } from '@/app/fonts'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { getLocale } from '@/lib/getLocale'
import { itemsQueries } from '@/queries/calcs/items.queries'
import { useBuildStore } from '@/stores/useBuild.store'
import type { WeaponSlot } from '@/stores/useTTK.store'
import { useTTKStore } from '@/stores/useTTK.store'
import { InfoColor, infoColorMap } from '@/types/item.type'
import { computePrimeFromBuild } from '@/utils/computePrimeFromBuild'
import { messageToString } from '@/utils/itemUtils'
import { MannequinControls } from './components/MannequinControls'
import type { TTKSeries } from './components/TTKChart'
import { TTKChart } from './components/TTKChart'
import { TTKSummaryTable } from './components/TTKSummaryTable'
import { WeaponSlotCard } from './components/WeaponSlotCard'
import { WeaponStatsPanel } from './components/WeaponStatsPanel'
import { COLORS, HIT_ZONES } from './constants/ttk'
import {
	buildSeries,
	getAmmoType,
	getDamageBlock,
	getDmgPerShot,
	getNumericStat,
	getReloadTime,
} from './utils/weaponStats'

// это пиздец

const mkSlot = (): WeaponSlot => ({
	id:
		typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
			? crypto.randomUUID()
			: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`,
	weaponId: '',
	ammoId: '',
	variantIndex: 15,
})

export function TTKView() {
	const weaponsQuery = useSuspenseQuery(itemsQueries.get({ type: 'weapons' }))
	const ammoQuery = useSuspenseQuery(itemsQueries.get({ type: 'ammo' }))
	const platesQuery = useSuspenseQuery(itemsQueries.get({ type: 'plates' }))
	const armorsQuery = useSuspenseQuery(itemsQueries.get({ type: 'armor' }))
	const containersQuery = useSuspenseQuery(
		itemsQueries.get({ type: 'containers' })
	)
	const artefactsQuery = useSuspenseQuery(
		itemsQueries.get({ type: 'artefact' })
	)
	const consumablesQuery = useSuspenseQuery(
		itemsQueries.get({ type: 'consumables' })
	)

	const weapons = weaponsQuery.data
	const allAmmo = ammoQuery.data

	const t = useTranslations()
	const locale = getLocale()

	const { savedBuilds } = useBuildStore()
	const {
		slots,
		setSlots,
		bulletRes,
		vitality,
		hitZone,
		setHitZone,
		focusedSlotId,
		setFocusedSlotId,
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

	const getCompatibleAmmoCached = (typeKey: string) =>
		ammoByType.get(typeKey) ?? []

	const selectedPlate = platesQuery.data.find((p) => p.id === plateId) ?? null

	const prime = useMemo(() => {
		if (buildId) {
			const saved = savedBuilds.find((b) => b.id === buildId)
			if (saved)
				return computePrimeFromBuild(
					saved.build,
					armorsQuery.data,
					containersQuery.data,
					artefactsQuery.data,
					consumablesQuery.data,
					locale
				)
		}
		return ((100 + bulletRes) * (vitality + 100)) / 100
	}, [
		buildId,
		savedBuilds,
		armorsQuery.data,
		containersQuery.data,
		artefactsQuery.data,
		consumablesQuery.data,
		locale,
		bulletRes,
		vitality,
	])

	const updateSlot = (id: string, patch: Partial<WeaponSlot>) =>
		setSlots(slots.map((s) => (s.id === id ? { ...s, ...patch } : s)))

	const activeSlots = slots.filter((s) => s.weaponId)
	const focusedSlot =
		slots.find((s) => s.id === focusedSlotId && s.weaponId) ??
		activeSlots[0] ??
		null
	const focusedWeapon = focusedSlot
		? (weaponMap.get(focusedSlot.weaponId) ?? null)
		: null
	const focusedAmmo = focusedSlot
		? (ammoMap.get(focusedSlot.ammoId) ?? null)
		: null
	const weaponOptions = useMemo(
		() => weapons.filter((w) => getDamageBlock(w) !== null),
		[weapons]
	)

	const focusedItemColor =
		infoColorMap[focusedWeapon?.color as InfoColor] || InfoColor.DEFAULT

	const plate = hitZone === 'body' ? selectedPlate : null

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
							prime,
							hitZone,
							s.variantIndex,
							plate,
							plateDurability
						),
						color: COLORS[i % COLORS.length],
					}
				})
				.filter((s): s is NonNullable<typeof s> => s !== null),
		[
			weaponMap,
			ammoMap,
			prime,
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
					const dmg0 = getDmgPerShot(
						weapon,
						ammo,
						hitZone,
						0,
						s.variantIndex,
						plate,
						plateDurability
					)
					const block = getDamageBlock(weapon)
					const dmgMax = block
						? getDmgPerShot(
								weapon,
								ammo,
								hitZone,
								block.maxDistance,
								s.variantIndex,
								plate,
								plateDurability
							)
						: dmg0
					const rofVal = getNumericStat(
						weapon,
						'weapon.tooltip.weapon.info.rate_of_fire'
					)
					const shots0 = dmg0 > 0 ? Math.ceil(prime / dmg0) : 0
					const shotsMax = dmgMax > 0 ? Math.ceil(prime / dmgMax) : 0
					return {
						label: messageToString(weapon.name, locale),
						color: COLORS[i % COLORS.length],
						ttk0:
							dmg0 > 0 && rofVal > 0
								? (shots0 - 1) * (60 / rofVal) +
									getReloadTime(weapon, shots0)
								: 0,
						ttkMax:
							dmgMax > 0 && rofVal > 0
								? (shotsMax - 1) * (60 / rofVal) +
									getReloadTime(weapon, shotsMax)
								: 0,
						shots0,
						shotsMax,
						maxDist: block?.maxDistance ?? 0,
					}
				})
				.filter((r): r is NonNullable<typeof r> => r !== null),
		[
			weaponMap,
			ammoMap,
			prime,
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

	return (
		<section className="mx-auto flex max-w-7xl flex-col gap-10 px-4 pt-32 pb-12 lg:pt-36">
			<div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
				<MannequinControls prime={prime} />

				<div className="flex flex-col gap-4">
					<div className="flex items-center gap-2">
						<Icon className="text-lg" icon="lucide:crosshair" />
						<p
							className={`${unbounded.className} font-semibold text-lg`}
						>
							{t('ttk.page.weapon')}
						</p>
					</div>
					<div className="flex flex-col gap-3">
						{slots.map((slot, i) => {
							const weapon = weaponMap.get(slot.weaponId) ?? null

							const ammo = ammoMap.get(slot.ammoId) ?? null
							const isFocused = focusedSlot?.id === slot.id

							return (
								<WeaponSlotCard
									allAmmo={allAmmo}
									ammo={ammo}
									color={COLORS[i % COLORS.length]}
									isFocused={isFocused}
									key={slot.id}
									onAmmoSelect={(v) =>
										updateSlot(slot.id, { ammoId: v })
									}
									onFocus={() =>
										slot.weaponId &&
										setFocusedSlotId(slot.id)
									}
									onRemove={() =>
										setSlots(
											slots.filter(
												(s) => s.id !== slot.id
											)
										)
									}
									onVariantChange={(v) =>
										updateSlot(slot.id, { variantIndex: v })
									}
									onWeaponSelect={(v) => {
										const w = weaponMap.get(v)
										const compatible = w
											? getCompatibleAmmoCached(
													getAmmoType(w)
												)
											: []
										updateSlot(slot.id, {
											weaponId: v,
											ammoId:
												compatible.length === 1
													? compatible[0].id
													: compatible.length > 1
														? ''
														: slot.ammoId,
										})
										setFocusedSlotId(slot.id)
									}}
									showRemove={slots.length > 1}
									slot={slot}
									weapon={weapon}
									weaponOptions={weaponOptions}
								/>
							)
						})}
						{slots.length < 8 && (
							<Button
								className="flex items-center gap-2 rounded-xl"
								onClick={() => setSlots([...slots, mkSlot()])}
								type="button"
								variant={'outline'}
							>
								<Icon
									className="text-neutral-400"
									icon="lucide:plus"
								/>
								<p className="font-semibold text-neutral-400">
									{t('ttk.page.weapon_add')}
								</p>
							</Button>
						)}
					</div>
				</div>

				<div className="flex flex-col gap-4">
					<div className="flex items-center gap-2">
						<Icon className="text-lg" icon="lucide:bar-chart-2" />
						<p
							className={`${unbounded.className} font-semibold text-lg`}
							style={{ color: focusedItemColor }}
						>
							{focusedWeapon
								? messageToString(focusedWeapon.name, locale)
								: t('ttk.page.weapon_pick')}
						</p>
					</div>
					<Card.Root>
						<Card.Content>
							{focusedWeapon && focusedSlot ? (
								<WeaponStatsPanel
									ammo={focusedAmmo}
									hitZone={hitZone}
									prime={prime}
									variantIndex={focusedSlot.variantIndex}
									weapon={focusedWeapon}
								/>
							) : (
								<p className="py-4 text-center text-neutral-500 text-sm">
									{t('ttk.page.weapon_pick')}
								</p>
							)}
						</Card.Content>
					</Card.Root>
				</div>
			</div>

			<TTKSummaryTable maxDist={maxDist} rows={summaryRows} />

			{ttkSeries.length > 0 && (
				<Card.Root>
					<Card.Header className="flex flex-row items-center gap-4">
						{HIT_ZONES.map((z) => (
							<Button
								className={`flex items-center gap-2 rounded-lg px-3 py-2 font-semibold text-sm transition-all ${hitZone === z.value && 'bg-red-500/15 text-red-400 dark:ring-red-300/60'}`}
								key={z.value}
								onClick={() => setHitZone(z.value)}
								type="button"
								variant={'outline'}
							>
								{z.label}
							</Button>
						))}
					</Card.Header>
					<Card.Content className="h-72 font-semibold">
						<TTKChart maxDist={maxDist} series={ttkSeries} />
					</Card.Content>
				</Card.Root>
			)}
		</section>
	)
}
