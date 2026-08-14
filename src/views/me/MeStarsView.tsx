'use client'

import { Icon } from '@iconify/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { formatDate } from '@/lib/date'
import { userQueries } from '@/queries/user/user.queries'

export default function MeStarsView() {
	const t = useTranslations()
	const { data: stars } = useSuspenseQuery(userQueries.getStars({ take: 50 }))

	return (
		<div className="flex flex-col gap-4">
			<h1 className="font-semibold text-xl">{t('me.stars.title')}</h1>

			{stars?.data.length === 0 ? (
				<p className="font-semibold text-sm text-text-accent">
					{t('me.stars.empty')}
				</p>
			) : (
				<div className="flex flex-col gap-2">
					{stars?.data.map((item) => (
						<Link
							className="flex items-center gap-3 rounded-lg border border-border-secondary bg-background p-3 transition-colors hover:bg-accent"
							href={
								item.type === 'build'
									? `/builds/${item.item_id}`
									: `/articles/${item.item_id}`
							}
							key={item.id}
						>
							<div
								className={`flex size-8 items-center justify-center rounded-lg ${
									item.type === 'build'
										? 'bg-purple-500/10 text-purple-400'
										: 'bg-sky-500/10 text-sky-400'
								}`}
							>
								<Icon
									className="size-4"
									icon={
										item.type === 'build'
											? 'lucide:box'
											: 'lucide:book-open'
									}
								/>
							</div>
							<div className="min-w-0 flex-1">
								<p className="truncate font-semibold text-sm">
									{item.title}
								</p>
								<p className="text-text-accent text-xs">
									{item.type === 'build'
										? t('me.stars.build')
										: t('me.stars.article')}{' '}
									· {formatDate(item.created_at, 'date')}
								</p>
							</div>
							<Icon
								className="size-4 text-yellow-400"
								icon="lucide:star"
							/>
						</Link>
					))}
				</div>
			)}
		</div>
	)
}
