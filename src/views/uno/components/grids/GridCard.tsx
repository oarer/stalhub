'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { formatDate } from '@/lib/date'
import type { UnoGridSummary } from '@/types/uno/uno.type'
import { useUnoLocale } from '../../hooks/useUnoLocale'
import { UNO_MODE_KEYS } from '../../utils/uno.const'
import { formatUnoValue } from '../../utils/uno.utils'

export function GridCard({ grid }: { grid: UnoGridSummary }) {
	const t = useTranslations('uno')
	const locale = useUnoLocale()

	return (
		<Card.Link
			className="group hover:ring-primary transition-all duration-200"
			href={`/uno/grids/${grid.id}`}
		>
			<div className="flex items-start justify-between gap-3">
				<h2 className="group-hover:text-primary mt-1 text-lg font-semibold transition-colors">
					{grid.mode
						? t(UNO_MODE_KEYS[grid.mode] ?? 'unknown')
						: t('unknown')}
				</h2>
				<div className="flex items-center gap-2">
					{grid.status && (
						<Badge variant="secondary">{grid.status}</Badge>
					)}
					<Icon
						className="text-muted-foreground group-hover:text-primary transition-colors"
						icon="lucide:arrow-up-right"
					/>
				</div>
			</div>
			<div className="mt-5 grid grid-cols-2 gap-3 text-sm">
				<div>
					<p className="text-muted-foreground text-xs">
						{t('grids.date')}
					</p>
					<p className="mt-1 font-medium">{grid.date ?? '—'}</p>
				</div>
				<div>
					<p className="text-muted-foreground text-xs">
						{t('grids.time')}
					</p>
					<p className="mt-1 font-mono font-semibold">
						{formatDate(grid.time)}
					</p>
				</div>
				<div>
					<p className="text-muted-foreground text-xs">
						{t('grids.number')}
					</p>
					<p className="mt-1 font-mono font-semibold">
						{formatUnoValue(grid.number, locale)}
					</p>
				</div>
				<div>
					<p className="text-muted-foreground text-xs">
						{t('grids.groups')}
					</p>
					<p className="mt-1 font-mono font-semibold">
						{formatUnoValue(grid.groupsCount, locale)}
					</p>
				</div>
			</div>
			{grid.metadata.length > 0 && (
				<div className="border-primary/15 mt-4 flex flex-wrap gap-2 border-t pt-3">
					{grid.metadata.slice(0, 3).map((item) => (
						<Badge key={item.key} variant="secondary">
							{item.label}:{' '}
							{formatUnoValue(
								item.value === null ? null : String(item.value),
								locale
							)}
						</Badge>
					))}
				</div>
			)}
		</Card.Link>
	)
}
