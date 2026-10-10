'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import Avatar from '@/components/ui/user/Avatar'
import HoverUserCard from '@/components/ui/user/HoverUserCard'
import Username from '@/components/ui/user/Username'
import { formatDate } from '@/lib/date'
import { useAuthStore } from '@/stores/useAuth.store'
import type { UserBadge } from '@/types/user.type'
import { CommentForm } from './CommentForm'

export interface ThreadCommentAuthor {
	id: number
	name: string
	username: string
	badges: UserBadge[]
}

export interface ThreadComment {
	id: number
	content: string
	created_at: string
	author: ThreadCommentAuthor
	replies?: ThreadComment[]
}

function renderContent(text: string) {
	const mentionRegex = /(@\S+)/g
	const parts = text.split(mentionRegex)
	return parts.map((part, i) => {
		if (part.match(mentionRegex)) {
			return (
				<HoverUserCard key={i} username={part.slice(1)}>
					<Username
						className={`font-mono font-semibold text-primary`}
					>
						{part}
					</Username>
				</HoverUserCard>
			)
		}
		return part
	})
}

interface CommentThreadProps {
	comments: ThreadComment[]
	totalCount: number
	isCreating: boolean
	translationNamespace: string
	onCreate: (content: string) => void | Promise<unknown>
	onDelete: (id: number) => void
}

export function CommentThread({
	comments,
	totalCount,
	isCreating,
	translationNamespace: ns,
	onCreate,
	onDelete,
}: CommentThreadProps) {
	const t = useTranslations()
	const user = useAuthStore((s) => s.user)
	const isAdmin = user?.roles?.some(
		(r) => r.name === 'admin' || r.name === 'ADMIN'
	)
	const textareaRef = useRef<HTMLTextAreaElement>(null)

	const [content, setContent] = useState('')

	const repliesMap = new Map<number, ThreadComment[]>()
	for (const c of comments) {
		if (c.replies && c.replies.length > 0) {
			repliesMap.set(c.id, c.replies)
		}
	}

	const handleSubmit = () => {
		const text = content.trim()
		if (!text) return
		void Promise.resolve(onCreate(text)).then(
			() => setContent(''),
			() => {
				// error toast is handled by the caller, keep the text
			}
		)
	}

	const handleReply = (username: string) => {
		const mention = `@${username} `
		setContent(mention)
		textareaRef.current?.focus()
	}

	return (
		<div className="flex flex-col gap-4">
			<h3 className="font-semibold text-lg">
				{t(`${ns}.comments.title`, { count: totalCount })}
			</h3>

			{user && (
				<CommentForm
					inputRef={textareaRef}
					isPending={isCreating}
					onChange={setContent}
					onSubmit={handleSubmit}
					placeholder={t(`${ns}.comments.placeholder`)}
					value={content}
				/>
			)}

			<div className="flex flex-col gap-3">
				{comments.map((comment) => (
					<CommentItem
						admin={!!isAdmin}
						comment={comment}
						currentUserId={user ? String(user.id) : undefined}
						key={comment.id}
						ns={ns}
						onDelete={onDelete}
						onReply={handleReply}
						replies={repliesMap.get(comment.id) ?? []}
					/>
				))}

				{comments.length === 0 && (
					<p className="py-4 text-center font-semibold text-foreground text-sm">
						{t(`${ns}.comments.empty`)}
					</p>
				)}
			</div>
		</div>
	)
}

function CommentItem({
	admin,
	comment,
	currentUserId,
	ns,
	onDelete,
	onReply,
	replies,
}: {
	admin: boolean
	comment: ThreadComment
	currentUserId?: string
	ns: string
	onDelete: (id: number) => void
	onReply: (username: string) => void
	replies: ThreadComment[]
}) {
	const t = useTranslations()
	const canDelete = admin || String(comment.author.id) === currentUserId

	return (
		<div className="flex flex-col gap-2">
			<div className="rounded-lg bg-card px-3 py-2">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Avatar
							height={42}
							id={comment.author.id}
							username={comment.author.username}
							width={42}
						/>
						<HoverUserCard id={comment.author.id}>
							<Username
								className={`font-mono font-semibold text-xs`}
								user={comment.author}
								withRemoteBadges
							/>
						</HoverUserCard>
						<span
							className={`font-mono font-semibold text-foreground text-xs`}
						>
							{formatDate(comment.created_at)}
						</span>
					</div>
					<div className="flex items-center gap-1">
						<Button
							className="gap-2"
							onClick={() => onReply(comment.author.username)}
							size="sm"
							variant={'ghost'}
						>
							<Icon className="size-4" icon="lucide:reply" />
							<p className="hidden md:block">
								{t(`${ns}.comments.reply`)}
							</p>
						</Button>
						{canDelete && (
							<Modal.Root>
								<Modal.Trigger variant="ghost">
									<Icon
										className="size-3.5 text-red-400"
										icon="lucide:trash-2"
									/>
								</Modal.Trigger>
								<Modal.Content fullScreen={false}>
									<Modal.Header>
										<Modal.Title>
											{t(`${ns}.comments.deleteTitle`)}
										</Modal.Title>
									</Modal.Header>
									<Modal.Footer>
										<Modal.Close>
											{t(`${ns}.comments.cancel`)}
										</Modal.Close>
										<Modal.Action
											closeOnClick
											onClick={() => onDelete(comment.id)}
											variant="danger"
										>
											{t(`${ns}.comments.deleteConfirm`)}
										</Modal.Action>
									</Modal.Footer>
								</Modal.Content>
							</Modal.Root>
						)}
					</div>
				</div>
				<p className="mt-2 whitespace-pre-wrap font-semibold text-sm">
					{renderContent(comment.content)}
				</p>
			</div>

			{replies.length > 0 && (
				<div className="ml-6 flex flex-col gap-2 border-primary border-l-2 pl-3">
					{replies.map((reply) => (
						<CommentItem
							admin={admin}
							comment={reply}
							currentUserId={currentUserId}
							key={reply.id}
							ns={ns}
							onDelete={onDelete}
							onReply={onReply}
							replies={[]}
						/>
					))}
				</div>
			)}
		</div>
	)
}
