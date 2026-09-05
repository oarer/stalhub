import type { CatalogTablePayload } from '@/types/loot.type'
import { LootSlotCard } from './LootSlotCard'
import { slotLabel } from './utils'

interface LootTableProps {
	payload: CatalogTablePayload
}

export function LootTable({ payload }: LootTableProps) {
	const { slots } = payload

	if (slots.length === 0) {
		return <p className="opacity-60">Пусто</p>
	}

	return (
		<div className="grid max-h-[60dvh] gap-3 overflow-y-auto">
			{slots.map((slot, index) => (
				<LootSlotCard
					key={index}
					label={slotLabel(slot, index)}
					slot={slot}
				/>
			))}
		</div>
	)
}

export type { CatalogTablePayload }
