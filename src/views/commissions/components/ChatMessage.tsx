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
}: {
	message: CommissionMessage
	user: number
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
			<article className="mx-auto flex w-full max-w-[45%] flex-col items-center gap-1.5 rounded-xl border border-border/40 bg-muted/30 px-4 py-3 text-center">
				<span className="flex items-center gap-1.5 font-medium text-primary/90 text-sm">
					<Icon icon={eventIcon(message.kind)} />
					{eventLabel(message.kind)}
				</span>
				{message.content && (
					<p className="wrap-break-word whitespace-pre-wrap text-muted-foreground text-xs">
						{message.content}
					</p>
				)}
				{message.files.length > 0 && (
					<FileLinks files={message.files} />
				)}
				<time
					className="text-[10px] text-muted-foreground/60"
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
					<div className="flex flex-col gap-0.5 rounded-2xl rounded-br-md bg-primary px-3.5 py-2.5 text-primary-foreground">
						<p className="wrap-break-word whitespace-pre-wrap text-sm leading-snug">
							{message.content}
						</p>
						{message.files.length > 0 && (
							<FileLinks files={message.files} />
						)}
						<time
							className="self-end text-[10px] text-primary-foreground/60"
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
					<span className="px-1 text-muted-foreground text-xs">
						{message.author.name || message.author.username}
					</span>
					{message.author && (
						<Badge
							className="font-medium text-[11px]"
							variant={'nsfw'}
						>
							{t('artist')}
						</Badge>
					)}
				</div>
				<div className="flex flex-col gap-0.5 rounded-2xl rounded-bl-md bg-muted px-3.5 py-2.5">
					<p className="wrap-break-word whitespace-pre-wrap text-sm leading-snug">
						{message.content}
					</p>
					{message.files.length > 0 && (
						<FileLinks files={message.files} />
					)}
					<time
						className="self-end text-[10px] text-muted-foreground/60"
						dateTime={message.created_at}
					>
						{formatDate(message.created_at)}
					</time>
				</div>
			</div>
		</article>
	)
}
