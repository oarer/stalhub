'use client'

import { Icon } from '@iconify/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { buildApiQueries } from '@/queries/build-api/build-api.queries'
import { itemsQueries } from '@/queries/calcs/items.queries'
import { BuildCard } from '@/views/me/components/BuildCard'

export default function BuildsPublicView() {
	const [page, setPage] = useState(1)
	const take = 20
	const t = useTranslations()

	const { data } = useSuspenseQuery(buildApiQueries.list({ take, page }))
	const { data: artifacts } = useSuspenseQuery(
		itemsQueries.get({ type: 'artefact' })
	)
	const { data: armorItems } = useSuspenseQuery(
		itemsQueries.get({ type: 'armor' })
	)
	const { data: containers } = useSuspenseQuery(
		itemsQueries.get({ type: 'containers' })
	)

	const builds = data?.data ?? []
	const totalPages = data ? Math.ceil(data.total / take) : 1

	return (
		<section className="mx-auto max-w-380 space-y-6 px-4 pt-32 pb-12 sm:px-6">
			<div className="flex items-center justify-between">
				<h1 className="font-semibold text-2xl">
					{t('buildsPublic.title')}
				</h1>
				<span className="text-neutral-400 text-sm">
					{t('buildsPublic.total', { count: data?.total ?? 0 })}
				</span>
			</div>

			{builds.length === 0 ? (
				<p className="font-semibold text-sm text-text-accent">
					{t('me.builds.noBuilds')}
				</p>
			) : (
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
					{builds.map((build) => (
						<BuildCard
							armorItems={armorItems}
							artifacts={artifacts}
							build={build}
							containers={containers}
							key={build.id}
						/>
					))}
				</div>
			)}

			{totalPages > 1 && (
				<div className="flex items-center justify-center gap-2">
					<Button
						disabled={page <= 1}
						onClick={() => setPage((p) => p - 1)}
						size="sm"
						variant="outline"
					>
						<Icon icon="lucide:chevron-left" />
					</Button>
					<span className="text-neutral-400 text-sm">
						{page} / {totalPages}
					</span>
					<Button
						disabled={page >= totalPages}
						onClick={() => setPage((p) => p + 1)}
						size="sm"
						variant="outline"
					>
						<Icon icon="lucide:chevron-right" />
					</Button>
				</div>
			)}
		</section>
	)
}
