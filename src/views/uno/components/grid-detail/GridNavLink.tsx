'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { CLink } from '@/components/ui/Link'
import { cn } from '@/lib/cn'
import type { UnoGridSummary } from '@/types/uno/uno.type'

export function GridNavLink({
	grid,
	direction,
}: {
	grid: UnoGridSummary | null
	direction: 'prev' | 'next'
}) {
	const t = useTranslations('uno')

	if (!grid) {
		return <span className="px-3 py-2">—</span>
	}

	const label =
		grid.number === null
			? grid.id.slice(0, 6)
			: t('grids.detail.numberShort', { number: grid.number })

	return (
		<CLink
			className={cn(
				'gap-1.5 px-3 py-2',
				direction === 'next' && 'flex-row-reverse'
			)}
			href={`/uno/grids/${grid.id}`}
			size="sm"
			variant="ghost"
		>
			<Icon
				className="text-sm"
				icon={
					direction === 'prev'
						? 'lucide:chevron-left'
						: 'lucide:chevron-right'
				}
			/>
			<span>{label}</span>
		</CLink>
	)
}
