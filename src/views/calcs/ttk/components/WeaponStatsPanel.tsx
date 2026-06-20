'use client'

import { memo, useMemo } from 'react'
import { Divider } from '@/components/ui/Divider'
import { getLocale } from '@/lib/getLocale'
import type { AddStatBlock, ElementListBlock, Item } from '@/types/item.type'
import { ListBlock } from '@/views/items/components/blocks'
import { CUSTOM_ROF_MAP, getWeaponStats, type HitZone } from '../constants/ttk'
import { getDmgPerShot, getNumericStat } from '../utils/weaponStats'

interface WeaponStatsPanelProps {
	weapon: Item
	ammo: Item | null
	hitZone: HitZone
	variantIndex: number
	prime: number
}

const WeaponStatsPanel = memo(function Wsp({
	weapon,
	ammo,
	hitZone,
	variantIndex,
	prime,
}: WeaponStatsPanelProps) {
	const dmg0 = useMemo(
		() => getDmgPerShot(weapon, ammo, hitZone, 0, variantIndex),
		[weapon, ammo, hitZone, variantIndex]
	)
	const rof = useMemo(
		() => CUSTOM_ROF_MAP[weapon.id] ?? getNumericStat(weapon, 'weapon.tooltip.weapon.info.rate_of_fire'),
		[weapon]
	)
	const locale = getLocale()

	const statsList = useMemo(
		() => getWeaponStats(dmg0, rof, prime),
		[dmg0, rof, prime]
	)

	const filteredBlocks = useMemo(
		() =>
			weapon.infoBlocks
				.filter(
					(b): b is AddStatBlock | ElementListBlock =>
						(b.type === 'list' || b.type === 'addStat') &&
						Array.isArray(b.elements) &&
						b.elements.length > 0
				)
				.filter((_, idx) => idx !== 0 && idx !== 5 && idx !== 1),
		[weapon]
	)

	return (
		<div className="flex flex-col gap-3 text-sm">
			<div className="grid grid-cols-2 gap-2">
				{statsList.map(
					({ label, value, color, className }) => (
						<div
							className={`flex flex-col items-center rounded-lg bg-neutral-800/50 py-2 ${className ?? ''}`}
							key={label}
						>
							<span className="text-neutral-500 text-xs">
								{label}
							</span>
							<span className={`font-bold text-lg ${color}`}>
								{value}
							</span>
						</div>
					)
				)}
			</div>
			<Divider />
			<div className="mask-y-from-95% mask-y-to-100% flex max-h-58 flex-col gap-2 overflow-y-auto">
				{filteredBlocks.map((block, idx) => (
					<ListBlock
						block={block}
						key={idx}
						locale={locale}
						numericVariants={variantIndex}
						withCard={false}
					/>
				))}
			</div>
		</div>
	)
})

export { WeaponStatsPanel }
