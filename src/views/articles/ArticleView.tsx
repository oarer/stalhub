'use client'

import { Icon } from '@iconify/react'
import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { motion } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { MDXRemote } from 'next-mdx-remote'
import { useEffect, useRef, useState } from 'react'
import { mtsExtended } from '@/app/fonts'
import { ArticleTocAbsolute, ArticleTocMobile, MIN_HEADINGS, useArticleToc } from '@/components/articles/ArticleToc'
import BlogCover from '@/components/blog/BlogCover'
import { Button } from '@/components/ui/Button'
import Avatar from '@/components/ui/user/Avatar'
import HoverUserCard from '@/components/ui/user/HoverUserCard'
import Username from '@/components/ui/user/Username'
import { useMDXComponents } from '@/components/wiki/mdx-components'
import { compileMdx } from '@/lib/actions/mdx'
import { formatDate } from '@/lib/date'
import { getQueryClient } from '@/providers/QueryProvider'
import { articleQueries } from '@/queries/article/article.queries'
import { articleService } from '@/services/article/article.service'
import { useAuthStore } from '@/stores/useAuth.store'
import { ArticleType, FACTION_META, type Faction } from '@/types/article.type'
import ArticleComments from './ArticleComments'

const EMPTY_SCOPE = {}
const EMPTY_FRONTMATTER = {}

interface ArticleViewProps {
	articleId: string
	backHref?: string
	backLabelKey?: string
}

export default function ArticleView({
	articleId,
	backHref = '/articles',
	backLabelKey = 'articles.allArticles',
}: ArticleViewProps) {
	const t = useTranslations()
	const { data: article } = useSuspenseQuery(articleQueries.get(articleId))
	const components = useMDXComponents()
	const [compiledSource, setCompiledSource] = useState<string | null>(null)
	const [compileError, setCompileError] = useState(false)
	const contentRef = useRef<HTMLDivElement | null>(null)
	const { activeId, headings } = useArticleToc(contentRef, compiledSource)
	const [tocOpen, setTocOpen] = useState(true)
	const showToc = headings.length >= MIN_HEADINGS
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
			<header className="flex flex-col gap-4 pb-6">
				<Link
					className="font-medium text-foreground text-sm transition-colors hover:text-primary"
					href={backHref}
				>
					{t(backLabelKey)}
				</Link>

				<h1
					className={`${mtsExtended.className} font-semibold text-3xl text-primary`}
				>
					{article.title}
				</h1>

				{article.image_url ? (
					<div className="relative aspect-video w-full overflow-hidden rounded-lg">
						<Image
							alt={article.title}
							className="object-cover"
							fill
							sizes="(max-width: 768px) 100vw, 768px"
							src={article.image_url}
						/>
					</div>
				) : (
					<BlogCover
						content={article.content}
						icon={article.cover_config?.icon ?? null}
						mode={article.cover_config?.mode ?? null}
						panel={article.cover_config?.panel ?? null}
						seed={article.id}
						tags={article.tags}
						title={article.title}
					/>
				)}

				<div className="flex flex-wrap items-center gap-4 font-medium text-sm">
					<div className="flex items-center gap-2">
						<Avatar
							height={42}
							id={article.author.id}
							username={article.author.username}
							width={42}
						/>
						<HoverUserCard id={article.author.id}>
							<Username
								className={`font-medium font-mono text-xs`}
								user={article.author}
							/>
						</HoverUserCard>
					</div>

					<div className="flex items-center gap-1 text-foreground">
						<Icon icon="lucide:eye" />
						<span className={`font-medium font-mono text-xs`}>
							{article.views}
						</span>
					</div>

					<div className="flex items-center gap-1 text-foreground">
						<Icon icon="lucide:calendar" />
						<span className={`font-medium font-mono text-xs`}>
							{formatDate(article.created_at, 'datetime')}
						</span>
					</div>

					{article.faction && (
						<span
							className={`rounded-md px-2 py-0.5 font-medium text-xs ${FACTION_META[article.faction as Faction]?.color ?? ''}`}
						>
							{FACTION_META[article.faction as Faction]?.label ??
								article.faction}
						</span>
					)}

					{user && (
						<Button
							className={`gap-1 p-2 ${
								article.is_starred
									? 'text-yellow-400'
									: 'text-foreground hover:text-yellow-400'
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
							<span className="font-mono font-semibold">
								{article.stars_count}
							</span>
						</Button>
					)}

					{!user && article.stars_count > 0 && (
						<div className="flex items-center gap-1 text-foreground">
							<Icon icon="lucide:star" />
							<span>{article.stars_count}</span>
						</div>
					)}
				</div>

				{article.tags.length > 0 && (
					<div className="flex flex-wrap gap-1.5">
						{article.tags.map((tag) => (
							<span
								className="rounded-md bg-border-secondary px-2 py-0.5 font-medium text-foreground text-xs"
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
						<h2 className="font-semibold text-xl">
							{article.quest_name ?? t('articles.quest.details')}
						</h2>
						<span className="text-foreground">
							{t(
								`articles.quest.${article.quest_type === 'SIDE' ? 'side' : 'story'}`
							)}
						</span>
						{article.reward_text && <p>{article.reward_text}</p>}
						{article.reward_money != null && (
							<p className="font-medium">
								{t('articles.quest.money')}:{' '}
								{article.reward_money.toLocaleString()}
							</p>
						)}
					</div>
				</section>
			)}

			<div className="relative flex min-w-0 items-start gap-8">
				<div className="flex min-w-0 flex-1 flex-col gap-4">
					<ArticleTocMobile activeId={activeId} headings={headings} />
					<div className="min-h-50" ref={contentRef}>
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
								<span className="font-medium">
									{t('articles.loadError')}
								</span>
							</div>
						) : (
							<div className="flex items-center justify-center gap-2 py-16">
								<Icon
									className="size-5 animate-spin text-foreground"
									icon="lucide:loader-circle"
								/>
								<span className="font-medium text-foreground text-sm">
									{t('articles.loading')}
								</span>
							</div>
						)}
					</div>
				</div>
				{/* Spacer reserves room for the absolute TOC panel and
					animates its width on open/close. */}
				<motion.div
					animate={{ width: showToc && tocOpen ? 288 : 0 }}
					aria-hidden
					className="hidden shrink-0 overflow-hidden xl:block"
					initial={false}
					transition={{ duration: 0.3, ease: 'easeOut' }}
				/>
				<ArticleTocAbsolute
					activeId={activeId}
					headings={headings}
					onToggle={() => setTocOpen((v) => !v)}
					open={tocOpen}
				/>
			</div>

			<div className="border-primary border-t pt-6">
				<ArticleComments articleId={articleId} />
			</div>
		</section>
	)
}
