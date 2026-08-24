'use client'

import { Icon } from '@iconify/react'
import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { MDXRemote } from 'next-mdx-remote'
import { useEffect, useState } from 'react'
import { montserrat, unbounded } from '@/app/fonts'
import { Button } from '@/components/ui/Button'
import HoverUserCard from '@/components/ui/user/HoverUserCard'
import { useMDXComponents } from '@/components/wiki/mdx-components'
import { compileMdx } from '@/lib/actions/mdx'
import { formatDate } from '@/lib/date'
import { getQueryClient } from '@/providers/QueryProvider'
import { articleQueries } from '@/queries/article/article.queries'
import { articleService } from '@/services/article/article.service'
import { useAuthStore } from '@/stores/useAuth.store'
import { ArticleType } from '@/types/article.type'
import ArticleComments from './ArticleComments'

const EMPTY_SCOPE = {}
const EMPTY_FRONTMATTER = {}

interface ArticleViewProps {
	articleId: string
}

export default function ArticleView({ articleId }: ArticleViewProps) {
	const t = useTranslations()
	const { data: article } = useSuspenseQuery(articleQueries.get(articleId))
	const components = useMDXComponents()
	const [compiledSource, setCompiledSource] = useState<string | null>(null)
	const [compileError, setCompileError] = useState(false)
	const queryClient = getQueryClient()
	const user = useAuthStore((s) => s.user)

	const starMutation = useMutation({
		mutationFn: () => articleService.star(articleId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['article', articleId] })
		},
	})

	const unstarMutation = useMutation({
		mutationFn: () => articleService.unstar(articleId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['article', articleId] })
		},
	})

	useEffect(() => {
		if (!article?.content) return

		compileMdx(article.content)
			.then((result) => {
				setCompiledSource(result.compiledSource)
				setCompileError(false)
			})
			.catch(() => {
				setCompileError(true)
			})
	}, [article?.content])

	return (
		<section className="mx-auto flex max-w-380 flex-col gap-8 px-4 pt-32 pb-12 md:px-8 xl:pt-36">
			<header className="flex flex-col gap-4 border-primary border-b pb-6">
				<Link
					className="font-semibold text-sm text-text-accent transition-colors hover:text-primary"
					href="/articles"
				>
					{t('articles.allArticles')}
				</Link>

				<h1 className={`${unbounded.className} font-bold text-3xl`}>
					{article.title}
				</h1>

				{article.image_url && (
					<div className="relative aspect-video w-full overflow-hidden rounded-lg">
						<Image
							alt={article.title}
							className="object-cover"
							fill
							sizes="(max-width: 768px) 100vw, 768px"
							src={article.image_url}
						/>
					</div>
				)}

				<div className="flex flex-wrap items-center gap-4 font-semibold text-sm">
					<div className="flex items-center gap-2">
						<Image
							alt={article.author.username}
							className="rounded-full"
							height={42}
							src={`${process.env.NEXT_PUBLIC_API}/api/v1/users/avatar/${article.author.id}`}
							unoptimized
							width={42}
						/>
						<HoverUserCard id={article.author.id}>
							<span
								className={`${montserrat.className} font-semibold text-xs`}
							>
								{article.author.username}
							</span>
						</HoverUserCard>
					</div>

					<div className="flex items-center gap-1 text-text-accent">
						<Icon icon="lucide:calendar" />
						<span
							className={`${montserrat.className} font-semibold text-xs`}
						>
							{formatDate(article.created_at, 'datetime')}
						</span>
					</div>

					{user && (
						<Button
							className={`p-2 ${
								article.is_starred
									? 'text-yellow-400'
									: 'text-text-accent hover:text-yellow-400'
							}`}
							onClick={() =>
								article.is_starred
									? unstarMutation.mutate()
									: starMutation.mutate()
							}
							variant={'ghost'}
						>
							<Icon
								className={
									article.is_starred ? 'fill-yellow-400' : ''
								}
								icon="lucide:star"
							/>
							<span>{article.stars_count}</span>
						</Button>
					)}

					{!user && article.stars_count > 0 && (
						<div className="flex items-center gap-1 text-text-accent">
							<Icon icon="lucide:star" />
							<span>{article.stars_count}</span>
						</div>
					)}
				</div>

				{article.tags.length > 0 && (
					<div className="flex flex-wrap gap-1.5">
						{article.tags.map((tag) => (
							<span
								className="rounded-md bg-border-secondary px-2 py-0.5 font-semibold text-text-accent text-xs"
								key={tag}
							>
								{tag}
							</span>
						))}
					</div>
				)}
			</header>

			{article.type === ArticleType.QUEST && (
				<section className="grid gap-4 rounded-xl border-2 border-primary/20 bg-card p-5 md:grid-cols-2">
					<div className="flex flex-col gap-2">
						<h2 className="font-bold text-xl">
							{article.quest_name ?? t('articles.quest.details')}
						</h2>
						<span className="text-text-accent">
							{t(
								`articles.quest.${article.quest_type === 'SIDE' ? 'side' : 'story'}`
							)}
						</span>
						{article.reward_text && <p>{article.reward_text}</p>}
						{article.reward_money != null && (
							<p className="font-semibold">
								{t('articles.quest.money')}:{' '}
								{article.reward_money.toLocaleString()}
							</p>
						)}
					</div>
				</section>
			)}

			<div className="min-h-50">
				{compiledSource ? (
					<div className="prose prose-neutral dark:prose-invert max-w-none contain-content">
						<MDXRemote
							compiledSource={compiledSource}
							components={components}
							frontmatter={EMPTY_FRONTMATTER}
							scope={EMPTY_SCOPE}
						/>
					</div>
				) : compileError ? (
					<div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-red-400 text-sm">
						<Icon className="size-4" icon="lucide:alert-triangle" />
						<span className="font-semibold">
							{t('articles.loadError')}
						</span>
					</div>
				) : (
					<div className="flex items-center justify-center gap-2 py-16">
						<Icon
							className="size-5 animate-spin text-text-accent"
							icon="lucide:loader-circle"
						/>
						<span className="font-semibold text-sm text-text-accent">
							{t('articles.loading')}
						</span>
					</div>
				)}
			</div>

			<div className="border-primary border-t pt-6">
				<ArticleComments articleId={articleId} />
			</div>
		</section>
	)
}
