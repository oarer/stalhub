'use client'

import { Icon } from '@iconify/react'
import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useRef, useState } from 'react'
import { montserrat } from '@/app/fonts'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { toast } from '@/components/ui/Toast'
import HoverUserCard from '@/components/ui/user/HoverUserCard'
import { formatDate } from '@/lib/date'
import { getQueryClient } from '@/providers/QueryProvider'
import { artCommentQueries } from '@/queries/art/comment.queries'
import { artCommentService } from '@/services/art/comment.service'
import { useAuthStore } from '@/stores/useAuth.store'
import type { ArtComment } from '@/types/art.type'

interface ArtCommentsProps {
	artId: string
}

function renderContent(text: string) {
	const mentionRegex = /(@\S+)/g
	const parts = text.split(mentionRegex)
	return parts.map((part, i) => {
		if (part.match(mentionRegex)) {
			return (
				<HoverUserCard key={i} username={part.slice(1)}>
					<span
						className={`${montserrat.className} font-semibold text-primary`}
					>
						{part}
					</span>
				</HoverUserCard>
			)
		}
		return part
	})
}

export default function ArtComments({ artId }: ArtCommentsProps) {
	const t = useTranslations()
	const queryClient = getQueryClient()
	const user = useAuthStore((s) => s.user)
	const isAdmin = user?.roles?.some(
		(r) => r.name === 'admin' || r.name === 'ADMIN'
	)
	const textareaRef = useRef<HTMLTextAreaElement>(null)

	const { data } = useSuspenseQuery(artCommentQueries.list(artId))

	const [content, setContent] = useState('')

	const createMutation = useMutation({
		mutationFn: () =>
			artCommentService.create(artId, {
				content: content.trim(),
			}),
		onSuccess: () => {
			toast.success(t('arts.comments.toast.added'))
			queryClient.invalidateQueries({
				queryKey: ['art', artId, 'comments'],
			})
			queryClient.invalidateQueries({ queryKey: ['art', artId] })
			setContent('')
		},
		onError: () => toast.error(t('arts.comments.toast.addError')),
	})

	const deleteMutation = useMutation({
		mutationFn: (commentId: number) =>
			artCommentService.delete(artId, commentId),
		onSuccess: () => {
			toast.success(t('arts.comments.toast.deleted'))
			queryClient.invalidateQueries({
				queryKey: ['art', artId, 'comments'],
			})
		},
		onError: () => toast.error(t('arts.comments.toast.deleteError')),
	})

	const comments = data?.data ?? []

	const topLevel = comments
	const repliesMap = new Map<number, ArtComment[]>()
	for (const c of comments) {
		if (c.replies && c.replies.length > 0) {
			repliesMap.set(c.id, c.replies)
		}
	}

	const handleSubmit = () => {
		if (!content.trim()) return
		createMutation.mutate()
	}

	const handleReply = (username: string) => {
		const mention = `@${username} `
		setContent(mention)
		textareaRef.current?.focus()
	}

	return (
		<div className="flex flex-col gap-4">
			<h3 className="font-semibold text-lg">
				{t('arts.comments.title', { count: data.total_count })}
			</h3>

			{user && (
				<div className="flex flex-col gap-2">
					<div className="flex gap-2">
						<textarea
							className="min-h-10 flex-1 resize-none rounded-lg border-2 border-primary/50 bg-card px-3 py-2 font-semibold text-sm outline-none transition-colors focus:border-primary"
							onChange={(e) => setContent(e.target.value)}
							onKeyDown={(e) => {
								if (
									e.key === 'Enter' &&
									(e.ctrlKey || e.metaKey)
								)
									handleSubmit()
							}}
							placeholder={t('arts.comments.placeholder')}
							ref={textareaRef}
							rows={2}
							value={content}
						/>
						<Button
							disabled={
								!content.trim() || createMutation.isPending
							}
							loading={createMutation.isPending}
							onClick={handleSubmit}
							size="lg"
						>
							<Icon className="text-xl" icon="lucide:send" />
						</Button>
					</div>
				</div>
			)}

			<div className="flex flex-col gap-3">
				{topLevel.map((comment) => (
					<CommentItem
						admin={!!isAdmin}
						artId={artId}
						comment={comment}
						currentUserId={user ? String(user.id) : undefined}
						key={comment.id}
						onDelete={(id) => deleteMutation.mutate(id)}
						onReply={handleReply}
						replies={repliesMap.get(comment.id) ?? []}
					/>
				))}

				{topLevel.length === 0 && (
					<p className="py-4 text-center font-semibold text-sm text-text-accent">
						{t('arts.comments.empty')}
					</p>
				)}
			</div>
		</div>
	)
}

function CommentItem({
	admin,
	artId,
	comment,
	currentUserId,
	onDelete,
	onReply,
	replies,
}: {
	admin: boolean
	artId: string
	comment: ArtComment
	currentUserId?: string
	onDelete: (id: number) => void
	onReply: (username: string) => void
	replies: ArtComment[]
}) {
	const t = useTranslations()
	const canDelete = admin || String(comment.author.id) === currentUserId

	return (
		<div className="flex flex-col gap-2">
			<div className="rounded-lg bg-card px-3 py-2">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Image
							alt={comment.author.name}
							className="rounded-full"
							height={42}
							src={`${process.env.NEXT_PUBLIC_API}/api/v1/users/avatar/${comment.author.id}`}
							unoptimized
							width={42}
						/>
						<HoverUserCard id={comment.author.id}>
							<span
								className={`${montserrat.className} font-semibold text-xs`}
							>
								{comment.author.name}
							</span>
						</HoverUserCard>
						<span
							className={`${montserrat.className} font-semibold text-text-accent text-xs`}
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
								{t('arts.comments.reply')}
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
											{t('arts.comments.deleteTitle')}
										</Modal.Title>
									</Modal.Header>
									<Modal.Footer>
										<Modal.Close>
											{t('arts.comments.cancel')}
										</Modal.Close>
										<Modal.Action
											closeOnClick
											onClick={() => onDelete(comment.id)}
											variant="danger"
										>
											{t('arts.comments.deleteConfirm')}
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
							artId={artId}
							comment={reply}
							currentUserId={currentUserId}
							key={reply.id}
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
