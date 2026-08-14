'use client'

import { Icon } from '@iconify/react'
import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { toast } from '@/components/ui/Toast'
import { cn } from '@/lib/cn'
import { getQueryClient } from '@/providers/QueryProvider'
import { articleQueries } from '@/queries/article/article.queries'
import { articleService } from '@/services/article/article.service'
import { ArticleStatus } from '@/types/article.type'
import { ArticleCard } from './components/article/ArticleCard'
import { CreateArticleButton } from './components/CreateArticleButton'

const STATUSES: ArticleStatus[] = [
	ArticleStatus.PENDING,
	ArticleStatus.REVIEW,
	ArticleStatus.DENIED,
	ArticleStatus.BANNED,
	ArticleStatus.APPROVED,
]

export default function MeArticlesView() {
	const queryClient = getQueryClient()
	const t = useTranslations()
	const [filter, setFilter] = useState<ArticleStatus | 'ALL'>('ALL')

	const { data: articles } = useSuspenseQuery(
		articleQueries.list({ take: 50 })
	)

	const filteredArticles =
		filter === 'ALL'
			? articles?.data
			: articles?.data.filter((a) => a.status === filter)

	const deleteMutation = useMutation({
		mutationFn: (id: string) => articleService.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['articles'] })
			toast.success(t('me.articles.toastDeleted'))
		},
		onError: () => {
			toast.error(t('me.articles.toastDeleteError'))
		},
	})

	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<h1 className="font-semibold text-xl">
						{t('me.articles.title')}
					</h1>
					{articles?.total != null && (
						<span className="text-sm text-text-accent">
							{articles.total}
						</span>
					)}
				</div>
				<CreateArticleButton />
			</div>

			<div className="flex flex-wrap gap-1.5">
				<Button
					className={cn(
						filter === 'ALL' && 'bg-accent text-text',
						'font-semibold'
					)}
					onClick={() => setFilter('ALL')}
					size={'sm'}
					variant={'ghost'}
				>
					{t('me.articles.all')}
				</Button>
				{STATUSES.map((status) => (
					<Button
						className={cn(
							filter === status && 'bg-accent text-text',
							'font-semibold'
						)}
						key={status}
						onClick={() => setFilter(status)}
						size={'sm'}
						variant={'ghost'}
					>
						{t(`articles.status.${status}`)}
					</Button>
				))}
			</div>

			{!filteredArticles || filteredArticles.length === 0 ? (
				<div className="flex flex-col items-center gap-3 py-16">
					<Icon
						className="size-10 text-text-accent"
						icon="lucide:file-text"
					/>
					<p className="font-semibold text-sm text-text-accent">
						{t('me.articles.noArticles')}
					</p>
					<CreateArticleButton label={t('me.articles.createFirst')} />
				</div>
			) : (
				<div className="grid grid-cols-1 gap-2">
					{filteredArticles.map((article) => (
						<div className="group relative" key={article.id}>
							<ArticleCard article={article} />
							<Button
								className="absolute top-2 right-2 z-10 flex p-1.5 ring-transparent"
								onClick={(e) => {
									e.preventDefault()
									deleteMutation.mutate(article.id)
								}}
								variant={'danger'}
							>
								<Icon
									className="size-4"
									icon="lucide:trash-2"
								/>
							</Button>
						</div>
					))}
				</div>
			)}
		</div>
	)
}
