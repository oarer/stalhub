'use client'

import HoverUserCard from '@/components/ui/user/HoverUserCard'
import Username from '@/components/ui/user/Username'
import { relativeDate } from '@/lib/relativeDate'
import type { Author } from '@/types/common.type'
import { EditedMark } from './EditedMark'

export function FeedRowHeader({
	author,
	fallbackName,
	sourceUrl,
	createdAt,
	editedBy,
}: {
	author?: Author | null
	fallbackName?: string | null
	sourceUrl?: string | null
	createdAt: string
	editedBy?: { id: number; username: string } | null
}) {
	const displayName =
		author?.name?.trim() || author?.username || fallbackName || 'Stalhub'
	const hasValidId = author?.id != null && author.id > 0

	return (
		<div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 text-sm">
			{hasValidId ? (
				<HoverUserCard id={author.id ?? 0}>
					<Username user={author.id != null ? author : undefined} />
				</HoverUserCard>
			) : sourceUrl ? (
				<a
					className="truncate font-semibold transition-colors hover:text-primary hover:underline"
					href={sourceUrl}
					rel="noopener noreferrer"
					target="_blank"
				>
					{displayName}
				</a>
			) : (
				<span className="truncate font-semibold">{displayName}</span>
			)}
			<span className="text-foreground">·</span>
			<time
				className="shrink-0 text-foreground"
				dateTime={createdAt}
				title={new Date(createdAt).toLocaleString()}
			>
				{relativeDate(createdAt)}
			</time>
			{editedBy && <EditedMark editedBy={editedBy} />}
		</div>
	)
}
