'use client'

import { Icon } from '@iconify/react'
import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import { mtsExtended } from '@/app/fonts'
import { Button } from '@/components/ui/Button'
import { Combobox } from '@/components/ui/Combobox'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatDate } from '@/lib/date'
import { devTrackerQueries } from '@/queries/eforum/eforum.queries'
import DevTrackerCard from '@/views/eforum/components/EForumCard'

const PAGE_SIZE = 20
const ALL_AUTHORS = '__all__'

export default function EForumFeed() {
	const t = useTranslations()
	const [author, setAuthor] = useState<string>(ALL_AUTHORS)
	const [limit, setLimit] = useState(PAGE_SIZE)

	const { data: authorsData } = useQuery(devTrackerQueries.authors())
	const { data, isPending, isFetching, refetch } = useQuery(
		devTrackerQueries.feed({
			...(author !== ALL_AUTHORS ? { author } : {}),
			limit,
		})
	)

	const options = useMemo(
		() => [
			{ value: ALL_AUTHORS, label: t('devTracker.allAuthors') },
			...(authorsData?.authors ?? []).map((a) => ({
				value: a.name,
				label: a.name,
			})),
		],
		[authorsData, t]
	)

	const items = data?.items ?? []

	return (
		<section className="mx-auto max-w-380 space-y-6 px-4 pt-32 pb-12 sm:px-6">
			<div className="flex flex-wrap items-center gap-3">
				<h1
					className={`${mtsExtended.className} font-semibold text-[28px] leading-none`}
				>
					{t('devTracker.title')}
				</h1>
				<Button
					className="ml-auto gap-2 font-medium"
					loading={isFetching}
					onClick={() => refetch()}
					size="sm"
					variant="outline"
				>
					<Icon icon="lucide:refresh-cw" />
					{t('devTracker.refresh')}
				</Button>
			</div>

			<div className="flex flex-wrap items-center gap-3">
				<Combobox
					className="w-64"
					onValueChange={(value) => {
						setAuthor(value)
						setLimit(PAGE_SIZE)
					}}
					options={options}
					placeholder={t('devTracker.allAuthors')}
					value={author}
				/>
				{data?.updatedAt && (
					<span
						className={`font-medium font-mono text-muted-foreground text-xs`}
					>
						{t('devTracker.updated')}: {formatDate(data.updatedAt)}
					</span>
				)}
			</div>

			{isPending ? (
				<div className="space-y-4">
					{[0, 1, 2].map((i) => (
						<Skeleton className="h-44 w-full" key={i} />
					))}
				</div>
			) : items.length === 0 ? (
				<p className="rounded-xl bg-card px-5 py-8 text-center font-medium text-muted-foreground text-sm">
					{t('devTracker.empty')}
				</p>
			) : (
				<div className="space-y-4">
					{items.map((comment) => (
						<DevTrackerCard comment={comment} key={comment.id} />
					))}
				</div>
			)}

			{data?.hasMore && (
				<div className="flex justify-center">
					<Button
						className={`font-mono`}
						loading={isFetching}
						onClick={() => setLimit((v) => v + PAGE_SIZE)}
						variant="outline"
					>
						{t('devTracker.showMore')} ({data.total - items.length})
					</Button>
				</div>
			)}
		</section>
	)
}
