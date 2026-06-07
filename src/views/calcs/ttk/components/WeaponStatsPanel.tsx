'use client'

import { Divider } from '@/components/ui/Divider'
import { getLocale } from '@/lib/getLocale'
import type { AddStatBlock, ElementListBlock, Item } from '@/types/item.type'
import { ListBlock } from '@/views/items/components/blocks'
import { getWeaponStats, type HitZone } from '../constants/ttk'
import { getDmgPerShot, getNumericStat } from '../utils/weaponStats'

interface WeaponStatsPanelProps {
	weapon: Item
	ammo: Item | null
	hitZone: HitZone
	variantIndex: number
	prime: number
}

export function WeaponStatsPanel({
	weapon,
	ammo,
	hitZone,
	variantIndex,
	prime,
}: WeaponStatsPanelProps) {
	const dmg0 = getDmgPerShot(weapon, ammo, hitZone, 0, variantIndex)
	const rof = getNumericStat(
		weapon,
		'weapon.tooltip.weapon.info.rate_of_fire'
	)
	const locale = getLocale()

	return (
		<div className="flex flex-col gap-3 text-sm">
			<div className="grid grid-cols-2 gap-2">
				{getWeaponStats(dmg0, rof, prime).map(
					({ label, value, color, className }) => (
						<div
							className={`flex flex-col items-center rounded-lg bg-neutral-800/50 py-2 ${className}`}
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
				{weapon.infoBlocks
					.filter(
						(b): b is AddStatBlock | ElementListBlock =>
							(b.type === 'list' || b.type === 'addStat') &&
							Array.isArray(b.elements) &&
							b.elements.length > 0
					)
					.filter((_, idx) => idx !== 0 && idx !== 5 && idx !== 1)
					.map((block, idx) => (
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
}
