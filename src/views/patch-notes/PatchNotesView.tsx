'use client'

import { Icon } from '@iconify/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { mtsExtended } from '@/app/fonts'
import { Button } from '@/components/ui/Button'
import { formatDate } from '@/lib/date'
import { articleQueries } from '@/queries/article/article.queries'

export default function PatchNotesView() {
	const t = useTranslations()
	const [page, setPage] = useState(1)
	const take = 20

	const { data } = useSuspenseQuery(articleQueries.patchNotes({ take, page }))

	const articles = data?.data ?? []
	const totalPages = data ? Math.ceil(data.total_count / take) : 1

	return (
		<section className="mx-auto flex max-w-380 flex-col gap-8 px-4 pt-32 pb-12 md:px-8 xl:pt-36">
			<div className='flex flex-col gap-2'>
				<h1
					className={`${mtsExtended.className} font-medium text-[28px] leading-none`}
				>
					{t('patchNotes.title')}
				</h1>
				<p className="font-medium text-muted-foreground text-sm">
					{t('patchNotes.subtitle', { count: data?.total_count ?? 0 })}
				</p>
			</div>

			{articles.length === 0 ? (
				<div className="flex flex-col items-center gap-3 py-16">
					<Icon
						className="size-10 text-text-accent"
						icon="lucide:scroll-text"
					/>
					<p className="font-medium text-sm text-text-accent">
						{t('patchNotes.empty')}
					</p>
				</div>
			) : (
				<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
					{articles.map((article) => (
						<Link
							className="group flex flex-col gap-3 rounded-lg border-2 border-primary/50 bg-card p-4 transition-colors hover:bg-accent/70"
							href={`/patch-notes/${article.id}`}
							key={article.id}
						>
							<h2 className="font-medium text-lg transition-colors group-hover:text-primary">
								{article.title}
							</h2>

							<div className="flex items-center gap-3 font-medium text-text-accent text-xs">
								<div className="flex items-center gap-1">
									<Icon icon="lucide:calendar" />
									{formatDate(article.created_at, 'date')}
								</div>
								<div className="flex items-center gap-1">
									<Icon icon="lucide:eye" />
									{article.views}
								</div>
								{article.stars_count > 0 && (
									<div className="flex items-center gap-1">
										<Icon icon="lucide:star" />
										{article.stars_count}
									</div>
								)}
							</div>

							{article.tags.length > 0 && (
								<div className="flex flex-wrap gap-1">
									{article.tags.slice(0, 5).map((tag) => (
										<span
											className="rounded-md bg-border-secondary px-1.5 py-0.5 font-medium text-text-accent text-xs"
											key={tag}
										>
											{tag}
										</span>
									))}
								</div>
							)}
						</Link>
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
					<span className="font-mono text-sm text-text-accent">
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
