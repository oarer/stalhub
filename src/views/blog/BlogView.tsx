'use client'

import { Icon } from '@iconify/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { mtsExtended } from '@/app/fonts'
import BlogCover from '@/components/blog/BlogCover'
import { Button } from '@/components/ui/Button'
import { formatDate } from '@/lib/date'
import { articleQueries } from '@/queries/article/article.queries'

export default function BlogView() {
	const t = useTranslations()
	const [page, setPage] = useState(1)
	const take = 20

	const { data } = useSuspenseQuery(articleQueries.blogPosts({ take, page }))

	const articles = data?.data ?? []
	const totalPages = data ? Math.ceil(data.total_count / take) : 1

	return (
		<section className="mx-auto flex max-w-380 flex-col gap-8 px-4 pt-32 pb-12 md:px-8 xl:pt-36">
			<div className="flex flex-col gap-2">
				<h1
					className={`${mtsExtended.className} font-semibold text-[28px] leading-none`}
				>
					{t('blog.title')}
				</h1>
				<p className="font-medium text-muted-foreground text-sm">
					{t('blog.subtitle', { count: data?.total_count ?? 0 })}
				</p>
			</div>

			{articles.length === 0 ? (
				<div className="flex flex-col items-center gap-3 py-16">
					<Icon
						className="size-10 text-foreground"
						icon="lucide:scroll-text"
					/>
					<p className="font-medium text-foreground text-sm">
						{t('blog.empty')}
					</p>
				</div>
			) : (
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
					{articles.map((article) => (
						<Link
							className="group flex flex-col gap-3"
							href={`/blog/${article.id}`}
							key={article.id}
						>
							<div className="overflow-hidden rounded-lg border-2 border-primary/50 transition-colors group-hover:border-primary">
								{article.image_url ? (
									<div className="relative aspect-1200/630 w-full">
										<Image
											alt={article.title}
											className="object-cover"
											fill
											sizes="(max-width: 768px) 100vw, 600px"
											src={article.image_url}
										/>
									</div>
								) : (
									<BlogCover
										content={article.content}
										icon={
											article.cover_config?.icon ?? null
										}
										mode={
											article.cover_config?.mode ?? null
										}
										panel={
											article.cover_config?.panel ?? null
										}
										seed={article.id}
										tags={article.tags}
										title={article.title}
									/>
								)}
							</div>

							<div className="flex flex-col gap-2 px-1">
								<div className="flex items-center gap-2">
									<span className="rounded-md bg-primary/15 px-1.5 py-0.5 font-mono font-semibold text-[11px] text-primary uppercase">
										stalhub
									</span>
									<h2 className="font-medium text-lg transition-colors group-hover:text-primary">
										{article.title}
									</h2>
								</div>

								<div className="flex items-center gap-3 font-medium text-foreground text-xs">
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
												className="rounded-md bg-border-secondary px-1.5 py-0.5 font-medium text-foreground text-xs"
												key={tag}
											>
												{tag}
											</span>
										))}
									</div>
								)}
							</div>
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
					<span className="font-mono text-foreground text-sm">
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
