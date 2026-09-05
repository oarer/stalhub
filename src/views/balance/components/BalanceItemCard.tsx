import { Icon } from '@iconify/react'
import { montserrat } from '@/app/fonts'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/cn'
import type {
	BalanceItemChange,
	BalanceStatChange,
} from '@/types/balance-diff.type'
import type { InfoColor } from '@/types/item.type'
import { infoColorMap } from '@/types/item.type'

const TYPE_STYLES: Record<BalanceStatChange['type'], string> = {
	added: 'text-primary bg-primary/10',
	removed: 'text-destructive bg-destructive/10',
	changed: 'bg-card',
}

function resolveItemColor(color?: string): string | undefined {
	if (!color) return undefined
	const key = color as InfoColor
	return infoColorMap[key] ?? undefined
}

export function BalanceItemCard({ item }: { item: BalanceItemChange }) {
	const itemColor = resolveItemColor(item.color)
	return (
		<Card.Root>
			<h3
				className={`${montserrat.className} font-semibold text-lg`}
				style={itemColor ? { color: itemColor } : undefined}
			>
				{item.name}
			</h3>
			<ul className="flex flex-col gap-1">
				{item.changes.map((change, index) => (
					<li
						className={cn(
							'flex flex-col gap-0.5 rounded-lg px-3 py-2 text-sm sm:flex-row sm:items-center sm:gap-2',
							TYPE_STYLES[change.type]
						)}
						key={`${change.label}-${index}`}
					>
						<span className="font-semibold">{change.label}</span>
						<span
							className={`${montserrat.className} flex items-center gap-2 tabular-nums sm:ml-auto`}
						>
							{change.type === 'removed' ? (
								<span className="font-semibold line-through opacity-80">
									{change.oldValue}
								</span>
							) : change.type === 'changed' ? (
								<>
									<span className="font-semibold text-muted-foreground line-through opacity-80">
										{change.oldValue}
									</span>
									<Icon
										className="text-lg"
										icon="lucide:move-right"
									/>
									<span className="font-semibold">
										{typeof change.newValue === 'number'
											? change.newValue.toFixed(2)
											: (change.newValue ?? '—')}
									</span>
								</>
							) : (
								<span className="font-semibold">
									+{change.newValue}
								</span>
							)}
						</span>
					</li>
				))}
			</ul>
		</Card.Root>
	)
}
