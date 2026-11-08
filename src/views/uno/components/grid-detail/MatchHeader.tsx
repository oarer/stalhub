'use client'

import { useTranslations } from 'next-intl'
import { cn } from '@/lib/cn'
import type { MatchRecord } from './grid-detail.types'

export function MatchHeader({
	wins,
	losses,
	accent = false,
}: MatchRecord & { accent?: boolean }) {
	const t = useTranslations('uno')
	return (
		<div
			className={cn(
				'grid grid-cols-[1fr_auto_1fr] items-center gap-2 border-b px-3 py-1.5',
				accent
					? 'border-success/40 bg-success/10'
					: 'border-border-secondary/60'
			)}
		>
			<span
				className={cn(
					'text-[9px] uppercase tracking-[0.16em]',
					accent ? 'text-success/80' : 'text-muted-foreground'
				)}
			>
				{t('grids.detail.wins')}
			</span>
			<span
				className={cn(
					'font-mono font-semibold text-[11px]',
					accent ? 'text-success' : 'text-foreground'
				)}
			>
				{wins}-{losses}
			</span>
			<span
				className={cn(
					'text-right text-[9px] uppercase tracking-[0.16em]',
					accent ? 'text-success/80' : 'text-muted-foreground'
				)}
			>
				{t('grids.detail.losses')}
			</span>
		</div>
	)
}
