'use client'

import { Icon } from '@iconify/react'
import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from '@tanstack/react-query'
import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { toast } from '@/components/ui/Toast'
import { cn } from '@/lib/cn'
import { articleQueries } from '@/queries/article/article.queries'
import { articleService } from '@/services/article/article.service'
import { ARTICLE_STATUS_META, ArticleStatus } from '@/types/article.type'
import { ArticleCard } from './components/article/ArticleCard'

const STATUSES: ArticleStatus[] = [
	ArticleStatus.PENDING,
	ArticleStatus.REVIEW,
	ArticleStatus.DENIED,
	ArticleStatus.BANNED,
]

export default function MeArticlesView() {
	const queryClient = useQueryClient()
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
			toast.success('Статья удалена')
		},
		onError: () => {
			toast.error('Ошибка при удалении')
		},
	})

	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<h1 className="font-semibold text-xl">Статьи</h1>
					{articles?.total != null && (
						<span className="text-sm text-text-accent">
							{articles.total}
						</span>
					)}
				</div>
				<Link
					className={cn(
						'inline-flex items-center gap-1.5',
						'rounded-lg bg-sky-400 px-4 py-2 font-medium text-sm text-white shadow-md transition-all hover:brightness-120 dark:bg-sky-600/70'
					)}
					href="/me/articles/new"
				>
					<Icon className="size-4" icon="lucide:plus" />
					<p className="font-semibold">Создать</p>
				</Link>
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
					Все
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
						{ARTICLE_STATUS_META[status].label}
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
						Нет статей
					</p>
					<Link
						className={cn(
							'inline-flex items-center gap-1.5',
							'rounded-lg bg-sky-400 px-4 py-2 font-medium text-sm text-white shadow-md transition-all hover:brightness-120 dark:bg-sky-600/70'
						)}
						href="/me/articles/new"
					>
						<Icon className="size-4" icon="lucide:plus" />
						<p className="font-semibold">Создать первую статью</p>
					</Link>
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
									className="size-4 text-red-400"
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
