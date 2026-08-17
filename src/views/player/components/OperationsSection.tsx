'use client'

import { Icon } from '@iconify/react'
import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { playerQueries } from '@/queries/player/player.queries'
import type { Regions } from '@/types/api.type'
import OperationSessionCard from '@/views/operations/components/OperationSessionCard'

export default function OperationsSection({
	region,
	character,
}: {
	region: Regions
	character: string
}) {
	const t = useTranslations()
	const { data, isLoading, isError } = useQuery(
		playerQueries.getOperations({ region, character })
	)

	return (
		<Card.Root>
			<Card.Header>
				<div className="flex items-center gap-2">
					<Icon className="text-xl" icon="lucide:siren" />
					<h1 className="font-semibold text-xl">
						{t('player.operations.title')}
					</h1>
					{data && data.total > 0 && (
						<span className="rounded-full bg-accent px-2 py-0.5 font-semibold text-xs">
							{data.total}
						</span>
					)}
				</div>
			</Card.Header>
			<Card.Content className="space-y-3">
				{isLoading && (
					<>
						<Skeleton className="h-24 w-full" />
						<Skeleton className="h-24 w-full" />
					</>
				)}
				{!isLoading && isError && (
					<p className="font-semibold text-text-accent">
						{t('player.operations.error')}
					</p>
				)}
				{!isLoading && data && data.sessions.length === 0 && (
					<p className="font-semibold text-text-accent">
						{t('player.operations.empty')}
					</p>
				)}
				{!isLoading &&
					data?.sessions.map((session) => (
						<OperationSessionCard key={session.id} session={session} />
					))}
			</Card.Content>
		</Card.Root>
	)
}
