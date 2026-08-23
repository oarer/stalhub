'use client'

import { Icon } from '@iconify/react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { montserrat } from '@/app/fonts'
import { Badge } from '@/components/ui/Badge'
import {
	MAX_VISIBLE_TAGS,
	STATUS_VARIANT,
} from '@/constants/article-editor.const'
import { formatDate } from '@/lib/date'
import type { Article } from '@/types/article.type'
import type { PublicUserArticle } from '@/types/user.type'

interface ArticleCardProps {
	article: Article | PublicUserArticle
}

export function ArticleCard({ article }: ArticleCardProps) {
	const t = useTranslations()
	const isOwn = 'status' in article
	const tags = Array.isArray(article.tags)
		? article.tags
		: article.tags
				.split(',')
				.map((t) => t.trim())
				.filter(Boolean)
	const author = 'author' in article ? article.author : null
	const date =
		'updated_at' in article ? article.updated_at : article.created_at

	return (
		<Link
			className="group/card flex flex-col gap-2 rounded-lg bg-card p-3.5 transition-all hover:bg-accent hover:shadow-sm"
			href={
				isOwn
					? `/me/articles/${article.id}/edit`
					: `/articles/${article.id}`
			}
		>
			<div className="flex items-center gap-2">
				<h3 className="truncate font-semibold text-sm">
					{article.title}
				</h3>
				{isOwn && (
					<Badge variant={STATUS_VARIANT[article.status]}>
						{t(`articles.status.${article.status}`)}
					</Badge>
				)}
			</div>

			<div className="flex items-center gap-2 text-text-accent text-xs">
				{article.stars_count > 0 && (
					<div className="flex items-center gap-2">
						<Icon icon="lucide:star" />
						{article.stars_count}
					</div>
				)}
				<p className={`${montserrat.className} font-semibold`}>
					{author && <span>{author.username} · </span>}
					{date && <span>{formatDate(date, 'date')}</span>}
				</p>
			</div>

			{tags.length > 0 && (
				<div className="flex flex-wrap gap-1">
					{tags.slice(0, MAX_VISIBLE_TAGS).map((tag) => (
						<span
							className="rounded-md bg-border-secondary px-1.5 py-0.5 font-semibold text-text-accent text-xs"
							key={tag}
						>
							{tag}
						</span>
					))}
					{tags.length > MAX_VISIBLE_TAGS && (
						<span className="font-semibold text-text-accent text-xs">
							+{tags.length - MAX_VISIBLE_TAGS}
						</span>
					)}
				</div>
			)}
		</Link>
	)
}
