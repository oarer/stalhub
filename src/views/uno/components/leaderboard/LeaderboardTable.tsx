'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { mtsWide } from '@/app/fonts'
import { Table } from '@/components/ui/Table'
import { cn } from '@/lib/cn'
import { allianceColors } from '@/types/player.type'
import type { UnoClanSummary } from '@/types/uno/uno.type'
import { useUnoLocale } from '../../hooks/useUnoLocale'
import { formatUnoValue, normalizeUnoFaction } from '../../utils/uno.utils'
import { UnoFaction } from '../UnoFaction'

export function LeaderboardTable({ clans }: { clans: UnoClanSummary[] }) {
	const t = useTranslations('uno')
	const locale = useUnoLocale()
	const router = useRouter()

	return (
		<div className="overflow-hidden rounded-2xl border-2 border-primary/25 bg-card/50 shadow-xl backdrop-blur-md">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head className="px-5">
							{t('table.rank')}
						</Table.Head>
						<Table.Head className="px-5">
							{t('table.clan')}
						</Table.Head>
						<Table.Head className="hidden px-5 text-right sm:table-cell">
							{t('table.rating')}
						</Table.Head>
						<Table.Head className="hidden px-5 sm:table-cell">
							{t('table.faction')}
						</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{clans.map((clan, index) => {
						const href = `/uno/clans/${encodeURIComponent(clan.id)}`
						const faction = normalizeUnoFaction(clan.faction)
						const factionColor = faction
							? allianceColors[faction]
							: undefined
						return (
							<Table.Row
								className="cursor-pointer hover:bg-primary/5"
								key={clan.id}
								onClick={() => router.push(href)}
							>
								<Table.Cell className="px-5">
									<span
										className={`${mtsWide.className} font-semibold text-primary sm:text-lg`}
									>
										{clan.position ?? index + 1}
									</span>
								</Table.Cell>
								<Table.Cell className="px-5">
									<Link
										className="block min-w-0"
										href={href}
										onClick={(event) =>
											event.stopPropagation()
										}
									>
										<p
											className={cn(
												'block truncate',
												factionColor
											)}
										>
											{clan.tag && (
												<span className="shrink-0 font-semibold">
													[{clan.tag}]{' '}
												</span>
											)}
											{clan.name}
										</p>
									</Link>
								</Table.Cell>
								<Table.Cell className="hidden px-5 text-right font-mono font-semibold sm:table-cell">
									{formatUnoValue(clan.rating, locale)}
								</Table.Cell>
								<Table.Cell className="hidden px-5 sm:table-cell">
									<UnoFaction
										faction={clan.faction}
										labelClassName={factionColor}
										size={18}
									/>
								</Table.Cell>
							</Table.Row>
						)
					})}
				</Table.Body>
			</Table.Root>
		</div>
	)
}
