'use client'

import { Icon } from '@iconify/react'
import Link from 'next/link'
import { montserrat } from '@/app/fonts'
import { Badge } from '@/components/ui/Badge'
import {
	MAX_VISIBLE_TAGS,
	STATUS_VARIANT,
} from '@/constants/article-editor.const'
import { formatDate } from '@/lib/date'
import { ARTICLE_STATUS_META, type Article } from '@/types/article.type'

interface ArticleCardProps {
	article: Article
}

export function ArticleCard({ article }: ArticleCardProps) {
	const statusMeta = ARTICLE_STATUS_META[article.status]

	return (
		<Link
			className="group/card flex flex-col gap-2 rounded-lg bg-background p-3.5 transition-all hover:bg-accent hover:shadow-sm"
			href={`/me/articles/${article.id}/edit`}
		>
			<div className="flex items-center gap-2">
				<h3 className="truncate font-semibold text-sm">
					{article.title}
				</h3>
				<Badge variant={STATUS_VARIANT[article.status]}>
					{statusMeta.label}
				</Badge>
			</div>

			<div className="flex items-center gap-2 text-text-accent text-xs">
				{article.stars && (
					<div className="flex items-center gap-2">
						<Icon icon="lucide:star" />
						{article.stars}
					</div>
				)}
				<p className={`${montserrat.className} font-semibold`}>
					<span>{article.author.username} · </span>
					{article.updated_at && (
						<span>{formatDate(article.updated_at, 'date')}</span>
					)}
				</p>
			</div>

			{article.tags.length > 0 && (
				<div className="flex flex-wrap gap-1">
					{article.tags.slice(0, MAX_VISIBLE_TAGS).map((tag) => (
						<span
							className="rounded-md bg-border-secondary px-1.5 py-0.5 text-text-accent text-xs"
							key={tag}
						>
							{tag}
						</span>
					))}
					{article.tags.length > MAX_VISIBLE_TAGS && (
						<span className="text-text-accent text-xs">
							+{article.tags.length - MAX_VISIBLE_TAGS}
						</span>
					)}
				</div>
			)}
		</Link>
	)
}
