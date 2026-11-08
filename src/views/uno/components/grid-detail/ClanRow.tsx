'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/cn'
import type { UnoGridClan } from '@/types/uno/uno.type'
import { useUnoLocale } from '../../hooks/useUnoLocale'
import { formatUnoValue } from '../../utils/uno.utils'
import { UnoFaction } from '../UnoFaction'
import { clanColor } from './grid-detail.utils'

export function ClanRow({
	clan,
	onHover,
	onLeave,
}: {
	clan: UnoGridClan
	onHover?: (clanId: string) => void
	onLeave?: () => void
}) {
	const t = useTranslations('uno')
	const locale = useUnoLocale()

	return (
		<div
			className="flex items-center justify-between gap-2 px-3 py-1.5"
			data-clan-id={clan.id}
			onMouseEnter={() => onHover?.(clan.id)}
			onMouseLeave={onLeave}
		>
			<span className="flex min-w-0 items-center gap-2">
				{clan.faction && (
					<UnoFaction
						faction={clan.faction}
						showLabel={false}
						size={16}
					/>
				)}
				<Link
					className={cn(
						'truncate font-medium text-[13px] hover:opacity-80',
						clanColor(clan.faction)
					)}
					href={`/uno/clans/${clan.id}`}
				>
					{clan.name ?? t('unknown')}
				</Link>
			</span>
			<span className="shrink-0 font-mono font-semibold text-[11px] text-muted-foreground">
				{formatUnoValue(clan.score, locale)}
			</span>
		</div>
	)
}
