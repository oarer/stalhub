'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/Badge'
import Avatar from '@/components/ui/user/Avatar'
import { formatDate } from '@/lib/date'
import type { CommissionMessage } from '@/types/commission.type'
import { FileLinks } from './shared'

const eventIcon = (kind: string) =>
	kind === 'CREATED'
		? 'lucide:sparkles'
		: kind === 'REVIEW'
			? 'lucide:star'
			: kind.startsWith('ARBITRATION')
				? 'lucide:scale'
				: 'lucide:info'

export function ChatMessage({
	message,
	user,
	downloadFile,
	showAuthorBadge = true,
}: {
	message: CommissionMessage
	user: number
	downloadFile?: (file: CommissionMessage['files'][number]) => Promise<void>
	showAuthorBadge?: boolean
}) {
	const t = useTranslations('commissions')
	const eventLabel = (kind: string) =>
		t.has(`events.${kind}`)
			? t(`events.${kind}`)
			: t.has(`actions.${kind.toLowerCase()}`)
				? t(`actions.${kind.toLowerCase()}`)
				: t('case')

	if (message.kind !== 'CHAT') {
		return (
			<article className="border-border/40 bg-muted/30 mx-auto flex w-full max-w-[45%] flex-col items-center gap-1.5 rounded-xl border px-4 py-3 text-center">
				<span className="text-primary/90 flex items-center gap-1.5 text-sm font-medium">
					<Icon icon={eventIcon(message.kind)} />
					{eventLabel(message.kind)}
				</span>
				{message.content && (
					<p className="text-muted-foreground text-xs wrap-break-word whitespace-pre-wrap">
						{message.content}
					</p>
				)}
				{message.files.length > 0 && (
					<FileLinks download={downloadFile} files={message.files} />
				)}
				<time
					className="text-muted-foreground/60 text-[10px]"
					dateTime={message.created_at}
				>
					{formatDate(message.created_at)}
				</time>
			</article>
		)
	}
	if (message.author.id === user) {
		return (
			<article className="flex justify-end">
				<div className="flex max-w-[85%] flex-col items-end gap-1">
					<div className="bg-primary text-primary-foreground flex flex-col gap-0.5 rounded-2xl rounded-br-md px-3.5 py-2.5">
						<p className="text-sm leading-snug wrap-break-word whitespace-pre-wrap">
							{message.content}
						</p>
						{message.files.length > 0 && (
							<FileLinks
								download={downloadFile}
								files={message.files}
							/>
						)}
						<time
							className="text-primary-foreground/60 self-end text-[10px]"
							dateTime={message.created_at}
						>
							{formatDate(message.created_at)}
						</time>
					</div>
				</div>
			</article>
		)
	}
	return (
		<article className="flex items-start gap-2">
			<Avatar
				height={28}
				id={message.author.id}
				username={message.author.username}
				width={28}
			/>
			<div className="flex max-w-[85%] flex-col items-start gap-2">
				<div className="flex items-center gap-2">
					<span className="text-muted-foreground px-1 text-xs">
						{message.author.name || message.author.username}
					</span>
					{showAuthorBadge && message.author && (
						<Badge
							className="text-[11px] font-medium"
							variant={'nsfw'}
						>
							{t('artist')}
						</Badge>
					)}
				</div>
				<div className="bg-muted flex flex-col gap-0.5 rounded-2xl rounded-bl-md px-3.5 py-2.5">
					<p className="text-sm leading-snug wrap-break-word whitespace-pre-wrap">
						{message.content}
					</p>
					{message.files.length > 0 && (
						<FileLinks
							download={downloadFile}
							files={message.files}
						/>
					)}
					<time
						className="text-muted-foreground/60 self-end text-[10px]"
						dateTime={message.created_at}
					>
						{formatDate(message.created_at)}
					</time>
				</div>
			</div>
		</article>
	)
}
