'use client'

import { Icon } from '@iconify/react'
import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { unbounded } from '@/app/fonts'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { balanceDiffQueries } from '@/queries/balance/balance.queries'
import type { BalanceItemCategory } from '@/types/balance-diff.type'
import { BalanceItemCard } from '@/views/balance/components/BalanceItemCard'

const CATEGORY_ICONS: Record<BalanceItemCategory, string> = {
	weapon: 'lucide:crosshair',
	armor: 'lucide:shield',
	artefact: 'lucide:gem',
	attachment: 'lucide:wrench',
	bag: 'lucide:backpack',
	boost: 'lucide:flask-conical',
	bullet: 'lucide:circle-dot',
	grenade: 'lucide:bomb',
}

const CATEGORY_ORDER: BalanceItemCategory[] = [
	'weapon',
	'armor',
	'artefact',
	'attachment',
	'bag',
	'boost',
	'bullet',
	'grenade',
]

export default function BalanceView() {
	const t = useTranslations()
	const [archiveTs, setArchiveTs] = useState<string | null>(null)

	const { data, isPending } = useQuery(balanceDiffQueries.latest())
	const { data: archived, isPending: isArchivedPending } = useQuery({
		...balanceDiffQueries.archived(archiveTs ?? ''),
		enabled: archiveTs != null,
	})

	const active = archiveTs != null ? archived : data
	const items = active?.items ?? []
	const total = items.length

	const grouped = CATEGORY_ORDER.map((category) => ({
		category,
		items: items.filter((item) => item.category === category),
	})).filter((group) => group.items.length > 0)

	return (
		<section className="mx-auto max-w-380 space-y-8 px-4 pt-32 pb-12 sm:px-6">
			<h1
				className={`${unbounded.className} font-semibold text-2xl sm:text-3xl`}
			>
				{t('balance.title')}
			</h1>

			{archiveTs != null && (
				<Button onClick={() => setArchiveTs(null)} size="sm">
					{t('balance.backToLatest')}
				</Button>
			)}

			{isPending || (archiveTs != null && isArchivedPending) ? (
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<Skeleton className="h-32 w-full" />
					<Skeleton className="h-32 w-full" />
				</div>
			) : total === 0 ? (
				<div className="flex flex-col items-center gap-2 rounded-xl bg-card px-5 py-12 shadow-lg ring-2 ring-primary/50 md:bg-card/50 md:backdrop-blur-md">
					<Icon
						className="text-4xl text-muted-foreground"
						icon="lucide:check-check"
					/>
					<p className="font-semibold text-muted-foreground">
						{t('balance.empty')}
					</p>
				</div>
			) : (
				<div className="space-y-8">
					{grouped.map((group) => (
						<div
							className="flex flex-col gap-3"
							key={group.category}
						>
							<div className="flex items-center gap-2">
								<Icon
									className="text-primary text-xl"
									icon={CATEGORY_ICONS[group.category]}
								/>
								<h2 className="font-semibold text-xl">
									{t(`balance.categories.${group.category}`)}
								</h2>
								<Badge className="ml-2" variant="secondary">
									{group.items.length}
								</Badge>
							</div>
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
								{group.items.map((item) => (
									<BalanceItemCard
										item={item}
										key={item.path}
									/>
								))}
							</div>
						</div>
					))}
				</div>
			)}
		</section>
	)
}
