'use client'

import Image from 'next/image'
import { CLink } from '@/components/ui/Link'
import { formatDate } from '@/lib/date'
import type {
	EForumBlock,
	EForumComment,
	EForumQuote,
} from '@/types/eforum.type'

const MENTION_SPLIT_RE = /(@[a-zA-Z0-9_]+)/g
const MENTION_TEST_RE = /^@[a-zA-Z0-9_]+$/

function profileUrl(username: string): string {
	return `https://forum.exbo.net/u/${username}`
}

function avatarUrl(src: string | null): string | null {
	if (!src) return null
	if (src.startsWith('//')) return `https:${src}`
	if (src.startsWith('/')) return `https://forum.exbo.net${src}`
	return src
}

export function renderWithMentions(text: string) {
	return text.split(MENTION_SPLIT_RE).map((part, i) => {
		if (MENTION_TEST_RE.test(part)) {
			const username = part.slice(1)
			return (
				<a
					className={`font-mono font-semibold text-primary hover:underline`}
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

function ForumAvatar({
	src,
	username,
	size = 24,
}: {
	src: string | null
	username: string
	size?: number
}) {
	const href = avatarUrl(src)
	if (!href) {
		return (
			<span
				className="flex shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-[10px] text-primary uppercase"
				style={{ height: size, width: size }}
			>
				{username.slice(0, 2)}
			</span>
		)
	}
	return (
		<Image
			alt={`${username} avatar`}
			className="shrink-0 rounded-full object-cover"
			height={size}
			src={href}
			unoptimized
			width={size}
		/>
	)
}

function QuoteBlock({ quote }: { quote: EForumQuote }) {
	const name = quote.authorDisplayName ?? quote.author
	return (
		<div className="border-primary/40 border-l-2 pl-3 text-sm">
			{name && (
				<div className="mb-1 flex items-center gap-1.5">
					<ForumAvatar
						size={18}
						src={quote.authorAvatarUrl}
						username={name}
					/>
					<a
						className={`font-mono font-semibold text-muted-foreground text-xs hover:text-primary`}
						href={
							quote.authorUrl ??
							(quote.author ? profileUrl(quote.author) : '#')
						}
						rel="noreferrer"
						target="_blank"
					>
						{name}
						{quote.link ? ' ↗' : ''}:
					</a>
				</div>
			)}
			<p className="whitespace-pre-line font-semibold">
				{renderWithMentions(quote.text)}
			</p>
		</div>
	)
}

function blocksOf(comment: EForumComment): EForumBlock[] {
	if (comment.blocks?.length) return comment.blocks
	const legacy: EForumBlock[] = comment.quotes.map((quote) => ({
		kind: 'quote',
		html: quote.html,
		text: quote.text,
		quote,
	}))
	if (comment.response.text) {
		legacy.push({
			kind: 'text',
			html: comment.response.html,
			text: comment.response.text,
			quote: null,
		})
	}
	return legacy
}

export default function DevTrackerCard({
	comment,
}: {
	comment: EForumComment
}) {
	const blocks = blocksOf(comment)
	const title = comment.discussion.title

	return (
		<article className="flex flex-col gap-3 rounded-xl bg-card px-5 py-4 shadow-lg ring-2 ring-primary/50 md:bg-card/50 md:backdrop-blur-md">
			<header className="flex flex-wrap items-center gap-x-3 gap-y-1">
				<a
					className="flex items-center gap-2"
					href={comment.author.profileUrl}
					rel="noreferrer"
					target="_blank"
				>
					<ForumAvatar
						src={comment.author.avatarUrl}
						username={comment.author.displayName}
					/>
					<span
						className={`font-mono font-semibold text-primary text-sm hover:underline`}
					>
						{comment.author.displayName}
					</span>
				</a>
				<span
					className={`font-mono font-semibold text-muted-foreground text-xs`}
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

			{title && (
				<p className="font-semibold text-muted-foreground text-xs">
					{title}
				</p>
			)}

			{blocks.map((block, i) =>
				block.kind === 'quote' && block.quote ? (
					<QuoteBlock
						key={`q-${block.quote.postId ?? i}-${i}`}
						quote={block.quote}
					/>
				) : block.text ? (
					<p
						className="whitespace-pre-line font-semibold text-sm"
						key={`t-${i}`}
					>
						{renderWithMentions(block.text)}
					</p>
				) : null
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
