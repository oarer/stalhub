'use client'

import Image from 'next/image'
import { montserrat } from '@/app/fonts'
import { CLink } from '@/components/ui/Link'
import { formatDate } from '@/lib/date'
import type { EForumComment } from '@/types/eforum.type'

const MENTION_SPLIT_RE = /(@[a-zA-Z0-9_]+)/g
const MENTION_TEST_RE = /^@[a-zA-Z0-9_]+$/

function profileUrl(username: string): string {
	return `https://forum.exbo.net/u/${username}`
}

export function renderWithMentions(text: string) {
	return text.split(MENTION_SPLIT_RE).map((part, i) => {
		if (MENTION_TEST_RE.test(part)) {
			const username = part.slice(1)
			return (
				<a
					className={`${montserrat.className} font-semibold text-primary hover:underline`}
					href={profileUrl(username)}
					key={i}
					rel="noreferrer"
					target="_blank"
				>
					{part}
				</a>
			)
		}
		return part
	})
}

export default function DevTrackerCard({
	comment,
}: {
	comment: EForumComment
}) {
	return (
		<article className="flex flex-col gap-3 rounded-xl bg-card px-5 py-4 shadow-lg ring-2 ring-primary/50 md:bg-card/50 md:backdrop-blur-md">
			<header className="flex flex-wrap items-center gap-x-3 gap-y-1">
				<a
					className={`${montserrat.className} font-semibold text-primary text-sm hover:underline`}
					href={comment.author.profileUrl}
					rel="noreferrer"
					target="_blank"
				>
					{comment.author.name}
				</a>
				<span
					className={`${montserrat.className} font-semibold text-muted-foreground text-xs`}
				>
					{formatDate(comment.createdAt)}
				</span>
				{comment.link && (
					<CLink
						className="ml-auto text-muted-foreground text-xs transition-colors hover:text-primary"
						href={comment.link}
						rel="noreferrer"
						target="_blank"
					>
						Форум
					</CLink>
				)}
			</header>

			{comment.quotes.map((quote, i) => (
				<div
					className="border-primary/40 border-l-2 pl-3 text-sm"
					key={`${quote.author ?? 'unknown'}-${i}`}
				>
					{quote.author && (
						<a
							className={`${montserrat.className} font-semibold text-muted-foreground text-xs hover:text-primary`}
							href={quote.authorUrl ?? profileUrl(quote.author)}
							rel="noreferrer"
							target="_blank"
						>
							{quote.author}:
						</a>
					)}
					<p className="whitespace-pre-line font-semibold">
						{renderWithMentions(quote.text)}
					</p>
				</div>
			))}

			{comment.response.text && (
				<p className="whitespace-pre-line font-semibold text-sm">
					{renderWithMentions(comment.response.text)}
				</p>
			)}

			{comment.videos.length > 0 && (
				<div className="flex flex-col gap-1">
					{comment.videos.map((src) => (
						<a
							className="flex items-center gap-1.5 text-primary text-sm hover:underline"
							href={src}
							key={src}
							rel="noreferrer"
							target="_blank"
						>
							<span aria-hidden>🎬</span>
							<span className="truncate">{src}</span>
						</a>
					))}
				</div>
			)}

			{comment.images.length > 0 && (
				<div className="flex flex-wrap gap-2">
					{comment.images.map((src) => (
						<a
							href={src}
							key={src}
							rel="noreferrer"
							target="_blank"
						>
							<Image
								alt="Вложение с форума"
								className="h-24 w-auto rounded-lg object-cover"
								height={96}
								loading="lazy"
								src={src}
								unoptimized
								width={160}
							/>
						</a>
					))}
				</div>
			)}
		</article>
	)
}
