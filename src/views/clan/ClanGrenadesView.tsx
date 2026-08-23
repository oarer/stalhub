'use client'

import { Icon } from '@iconify/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { Skeleton } from '@/components/ui/Skeleton'
import { clanQueries } from '@/queries/clan/clan.queries'
import { EventCard } from './components/grenades/EventCard'

export default function ClanGrenadesView() {
	const { data: profile } = useSuspenseQuery(clanQueries.getMe())
	const clanId = profile?.clan?.id
	if (!clanId) return null

	return <ClanGrenadesContent clanId={clanId} />
}

function ClanGrenadesContent({ clanId }: { clanId: string }) {
	const t = useTranslations()
	const { data: stages, isLoading } = useSuspenseQuery(
		clanQueries.getGrenadeStages(clanId)
	)

	if (isLoading) {
		return (
			<div className="flex flex-col gap-2">
				{[...Array(5)].map((_, i) => (
					<Skeleton className="h-12 w-full" key={i} />
				))}
			</div>
		)
	}

	const events = stages?.events ?? []

	return (
		<div className="flex flex-col gap-4">
			{events.length === 0 ? (
				<div className="flex flex-col items-center gap-2 rounded-xl bg-card px-5 py-4">
					<Icon className="text-4xl" icon="lucide:bomb" />
					<h3 className="font-semibold text-lg">
						{t('clan.grenades.emptyTitle')}
					</h3>
					<p className="font-semibold text-sm text-text-accent">
						{t('clan.grenades.emptyDesc')}
					</p>
				</div>
			) : (
				events.map((event) => (
					<EventCard
						event={event}
						key={`${event.event_type}-${event.raid_date}`}
					/>
				))
			)}
		</div>
	)
}
