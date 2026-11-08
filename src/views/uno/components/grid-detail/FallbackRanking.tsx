'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Card } from '@/components/ui/Card'
import { Table } from '@/components/ui/Table'
import { cn } from '@/lib/cn'
import type { UnoGridClan } from '@/types/uno/uno.type'
import { useUnoLocale } from '../../hooks/useUnoLocale'
import { formatUnoValue } from '../../utils/uno.utils'
import { UnoFaction } from '../UnoFaction'
import { clanColor } from './grid-detail.utils'

export function FallbackRanking({ clans }: { clans: UnoGridClan[] }) {
	const t = useTranslations('uno')
	const locale = useUnoLocale()

	if (clans.length === 0) {
		return (
			<p className="p-4 text-muted-foreground text-sm">
				{t('grids.detail.noClans')}
			</p>
		)
	}

	return (
		<div className="p-4">
			<div className="mb-3 text-center text-[11px] text-muted-foreground uppercase tracking-[0.2em]">
				{t('grids.detail.result')}
			</div>
			<Card.Root>
				<Table.Root>
					<Table.Body>
						{clans.map((clan, index) => (
							<Table.Row key={clan.id}>
								<Table.Cell className="w-8 px-3 py-2">
									{index + 1}
								</Table.Cell>
								<Table.Cell className="px-3 py-2">
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
								</Table.Cell>
								<Table.Cell className="px-3 py-2 text-right">
									{formatUnoValue(clan.score, locale)}
								</Table.Cell>
							</Table.Row>
						))}
					</Table.Body>
				</Table.Root>
			</Card.Root>
		</div>
	)
}
