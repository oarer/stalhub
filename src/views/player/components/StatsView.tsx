'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import { montserrat } from '@/app/fonts'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import { getLocale } from '@/lib/getLocale'
import type { Stat, StatCategory } from '@/types/player.type'
import { messageToString } from '@/utils/itemUtils'
import { StatsSection } from './Stats.helper'
import {
	enrichPlayerStats,
	filterPlayerStats,
	groupPlayerStats,
	type PlayerStat,
} from './Stats.utils'

const CATEGORY_ORDER: StatCategory[] = [
	'SURVIVAL',
	'COMBAT',
	'EXPLORATION',
	'ECONOMY',
	'SESSION_MODES',
	'HIDEOUT',
	'NONE',
]

const CATEGORY_ICONS: Record<StatCategory, string> = {
	SURVIVAL: 'lucide:heart-pulse',
	COMBAT: 'lucide:crosshair',
	EXPLORATION: 'lucide:map',
	ECONOMY: 'lucide:coins',
	SESSION_MODES: 'lucide:gamepad-2',
	HIDEOUT: 'lucide:warehouse',
	NONE: 'lucide:circle-help',
}

export default function StatsView({ data }: { data: Stat[] }) {
	const t = useTranslations()
	const locale = getLocale()
	const [query, setQuery] = useState('')
	const [category, setCategory] = useState<StatCategory | undefined>()
	const stats = useMemo(() => enrichPlayerStats(data ?? []), [data])
	const getName = (stat: PlayerStat) =>
		messageToString(stat.meta?.name, locale) || stat.id
	const visibleStats = filterPlayerStats(stats, {
		query,
		category,
		getName,
	})
	const grouped = groupPlayerStats(visibleStats)
	const allGrouped = useMemo(() => groupPlayerStats(stats), [stats])
	const availableCategories = CATEGORY_ORDER.filter(
		(item) => (allGrouped[item]?.length ?? 0) > 0
	)
	const hasFilters = Boolean(query.trim() || category)

	return (
		<Card.Root>
			<Card.Header className="gap-1">
				<div className="flex items-center gap-2">
					<Icon
						className="text-xl"
						icon="lucide:chart-no-axes-column"
					/>
					<h2 className="font-semibold text-xl">
						{t('player.stats.title')}
					</h2>
					<Badge
						className={`${montserrat.className} text-xs`}
						variant={'secondary'}
					>
						{t('player.stats.shown', {
							shown: visibleStats.length,
							total: stats.length,
						})}
					</Badge>
				</div>
				<p className="font-semibold text-muted-foreground text-sm">
					{t('player.stats.description')}
				</p>
			</Card.Header>

			<Card.Content className="space-y-5">
				<div className="space-y-3 rounded-xl bg-muted/25 p-3">
					<div className="relative">
						<Icon
							aria-hidden="true"
							className="pointer-events-none absolute top-1/2 left-3 z-10 -translate-y-1/2 text-muted-foreground"
							icon="lucide:search"
						/>
						<Input
							aria-label={t('player.stats.search')}
							className="pl-9"
							onChange={(event) => setQuery(event.target.value)}
							placeholder={t('player.stats.search')}
							value={query}
						/>
					</div>
					<div
						aria-label={t('player.stats.category_filter')}
						className="flex flex-wrap gap-2"
						role="group"
					>
						<Button
							aria-pressed={!category}
							className="h-8 gap-2 px-3 font-semibold"
							onClick={() => setCategory(undefined)}
							size="sm"
							variant={!category ? 'primary' : 'outline'}
						>
							{t('player.stats.all')}
							<span className={montserrat.className}>
								{stats.length}
							</span>
						</Button>
						{availableCategories.map((item) => (
							<Button
								aria-pressed={category === item}
								className="h-8 gap-2 px-3 font-semibold"
								key={item}
								onClick={() => setCategory(item)}
								size="sm"
								variant={
									category === item ? 'primary' : 'outline'
								}
							>
								<Icon icon={CATEGORY_ICONS[item]} />
								{t(`player.category.${item}`)}
								<span className={montserrat.className}>
									{allGrouped[item]?.length ?? 0}
								</span>
							</Button>
						))}
					</div>
				</div>

				{visibleStats.length > 0 ? (
					<div className="space-y-7">
						{CATEGORY_ORDER.map((item) => (
							<StatsSection
								icon={CATEGORY_ICONS[item]}
								key={item}
								stats={grouped[item] ?? []}
								title={item}
							/>
						))}
					</div>
				) : (
					<div className="flex flex-col items-center gap-3 py-10 text-center">
						<Icon
							className="text-4xl text-muted-foreground"
							icon="lucide:search-x"
						/>
						<div>
							<p>{t('player.stats.empty')}</p>
							<p className="text-muted-foreground text-sm">
								{t('player.stats.empty_hint')}
							</p>
						</div>
						{hasFilters && (
							<Button
								onClick={() => {
									setQuery('')
									setCategory(undefined)
								}}
								variant="outline"
							>
								{t('player.stats.reset')}
							</Button>
						)}
					</div>
				)}
			</Card.Content>
		</Card.Root>
	)
}
