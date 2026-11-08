'use client'

import { Icon } from '@iconify/react'
import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import { CLink } from '@/components/ui/Link'
import { useDebounce } from '@/hooks/useDebounce'
import { unoQueries } from '@/queries/uno/uno.queries'
import { LeaderboardFilters } from './components/leaderboard/LeaderboardFilters'
import { LeaderboardStats } from './components/leaderboard/LeaderboardStats'
import { LeaderboardTable } from './components/leaderboard/LeaderboardTable'
import { LEADERBOARD_LIMIT } from './components/leaderboard/leaderboard.const'
import { getSortValue } from './components/leaderboard/leaderboard.utils'
import { UnoEmpty } from './components/UnoEmpty'
import { UnoFeedback } from './components/UnoFeedback'
import { UnoPageHeader } from './components/UnoPageHeader'

export default function UnoLeaderboardView() {
	const t = useTranslations('uno')
	const [search, setSearch] = useState('')
	const [faction, setFaction] = useState('all')
	const [sort, setSort] = useState('rating')
	const debouncedSearch = useDebounce(search, 300)
	const searchTerm = debouncedSearch.trim()
	const query = useQuery(
		unoQueries.leaderboard({
			limit: LEADERBOARD_LIMIT,
			q: searchTerm || undefined,
		})
	)

	const entries = query.data?.items ?? []
	const factions = useMemo(
		() =>
			[
				...new Set(
					entries
						.map((entry) => entry.faction)
						.filter((item): item is string => Boolean(item))
				),
			].sort(),
		[entries]
	)
	const filtered = useMemo(
		() =>
			entries
				.filter((clan) => faction === 'all' || clan.faction === faction)
				.sort(
					(left, right) =>
						getSortValue(left, sort) - getSortValue(right, sort)
				),
		[entries, faction, sort]
	)

	return (
		<section className="mx-auto max-w-380 space-y-8 px-4 pt-32 pb-12 sm:px-6">
			<UnoPageHeader
				actions={
					<>
						<CLink
							className="gap-2"
							href="/uno/calendar"
							size="sm"
							variant="outline"
						>
							<Icon icon="lucide:calendar-days" />
							{t('nav.calendar')}
						</CLink>
						<CLink
							className="gap-2"
							href="/uno/grids"
							size="sm"
							variant="outline"
						>
							<Icon icon="lucide:layout-grid" />
							{t('nav.grids')}
						</CLink>
						<CLink
							className="gap-2"
							href="/uno/seasons"
							size="sm"
							variant="outline"
						>
							<Icon icon="lucide:trophy" />
							{t('nav.seasons')}
						</CLink>
					</>
				}
				description={t('description')}
				title={t('title')}
			/>

			<LeaderboardStats
				observedAt={query.data?.observedAt}
				total={query.data?.total ?? entries.length}
				visible={filtered.length}
			/>

			<LeaderboardFilters
				faction={faction}
				factions={factions}
				onFactionChange={setFaction}
				onSearchChange={setSearch}
				onSortChange={setSort}
				search={search}
				sort={sort}
			/>

			<UnoFeedback
				isError={query.isError}
				isLoading={query.isPending}
				onRetry={() => void query.refetch()}
			>
				{filtered.length === 0 ? (
					<UnoEmpty>
						{searchTerm || faction !== 'all'
							? t('empty.filtered')
							: t('empty.description')}
					</UnoEmpty>
				) : (
					<LeaderboardTable clans={filtered} />
				)}
			</UnoFeedback>
		</section>
	)
}
