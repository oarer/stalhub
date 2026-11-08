'use client'

import { useTranslations } from 'next-intl'
import { useMemo } from 'react'
import { Badge } from '@/components/ui/Badge'
import type { UnoGridGroup } from '@/types/uno/uno.type'
import { UnoRank } from '../UnoRank'
import { groupRanks } from './grid-detail.utils'

export function RankBlock({ group }: { group: UnoGridGroup }) {
	const t = useTranslations('uno')
	const ranks = useMemo(() => groupRanks(group), [group])

	return (
		<div className="flex flex-wrap items-center gap-2">
			<span className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
				{t('grids.detail.rank')}:
			</span>
			{ranks.length > 0 ? (
				ranks.map((rank) => (
					<Badge
						className="justify-center px-2"
						key={rank}
						variant="primary"
					>
						<UnoRank rank={rank} />
					</Badge>
				))
			) : (
				<Badge className="justify-center px-2" variant="primary">
					{t('unknown')}
				</Badge>
			)}
		</div>
	)
}
