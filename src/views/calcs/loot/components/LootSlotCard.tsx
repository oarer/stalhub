'use client'

import { montserrat } from '@/app/fonts'
import type { CatalogItem, CatalogSlot } from '@/types/loot.type'
import { getArtifactColor } from '@/utils/artUtils'
import { formattedPct, pickName, sortedByPct } from './utils'

interface LootSlotCardProps {
	label: string
	slot: CatalogSlot
}

export function LootSlotCard({ label, slot }: LootSlotCardProps) {
	const items = sortedByPct(slot)

	return (
		<div className="rounded-lg bg-accent/40 p-2">
			<div className="flex items-center justify-between text-sm">
				<span className="font-semibold">{label}</span>
				<span className={`${montserrat.className} font-semibold`}>
					{slot.length} всего
				</span>
			</div>
			<div className="max-h-[60dvh] overflow-y-auto">
				<table className="w-full border-collapse text-sm">
					<tbody>
						{items.map((item, index) => (
							<LootItemRow item={item} key={index} />
						))}
					</tbody>
				</table>
			</div>
		</div>
	)
}

function LootItemRow({ item }: { item: CatalogItem }) {
	const name = pickName(item.names)
	const id = item.stack?.id ?? 'miss'
	const qualityColor =
		item.stack?.qlt !== undefined
			? getArtifactColor(item.stack.qlt)
			: undefined

	return (
		<tr className="border-primary/50 border-t">
			<td
				className="whitespace-nowrap py-1 pr-3 font-semibold"
				style={qualityColor ? { color: qualityColor } : undefined}
			>
				{name || String(id)}
			</td>
			<td
				className={`${montserrat.className} whitespace-nowrap py-1 pr-3 text-right font-semibold`}
			>
				{formattedPct(item.pct)}
			</td>
			{item.stack?.stackSize !== undefined &&
				item.stack.stackSize > 1 && (
					<td
						className={`${montserrat.className} whitespace-nowrap py-1 text-right font-semibold opacity-60`}
					>
						x{item.stack.stackSize}
					</td>
				)}
		</tr>
	)
}

export type { CatalogItem }
