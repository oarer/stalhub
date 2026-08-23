'use client'

import { Icon } from '@iconify/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { montserrat } from '@/app/fonts'
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
							className="flex items-center gap-3 rounded-lg border-2 border-primary/50 bg-card p-3 transition-colors hover:bg-accent"
							href={
								item.type === 'build'
									? `/builds/${item.id}`
									: item.type === 'art'
										? `/arts/${item.id}`
										: `/articles/${item.id}`
							}
							key={item.type + item.id}
						>
							<div
								className={`flex size-8 items-center justify-center rounded-lg ${
									item.type === 'build'
										? 'bg-purple-500/10 text-purple-400'
										: item.type === 'art'
											? 'bg-pink-500/10 text-pink-400'
											: 'bg-primary/10 text-primary'
								}`}
							>
								<Icon
									className="size-4"
									icon={
										item.type === 'build'
											? 'lucide:box'
											: item.type === 'art'
												? 'lucide:image'
												: 'lucide:book-open'
									}
								/>
							</div>
							<div className="min-w-0 flex-1">
								<p className="truncate font-semibold text-sm">
									{item.title}
								</p>
								<p
									className={`${montserrat.className} font-semibold text-muted-foreground text-xs`}
								>
									{item.type === 'build'
										? t('me.stars.build')
										: item.type === 'art'
											? t('me.stars.art')
											: t('me.stars.article')}{' '}
									· {formatDate(item.created_at, 'date')}
								</p>
							</div>
							<Icon
								className="size-4 text-warning"
								icon="lucide:star"
							/>
						</Link>
					))}
				</div>
			)}
		</div>
	)
}
