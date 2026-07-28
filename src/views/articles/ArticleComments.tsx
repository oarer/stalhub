'use client'

import { Icon } from '@iconify/react'
import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from '@tanstack/react-query'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useRef, useState } from 'react'
import { montserrat } from '@/app/fonts'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { toast } from '@/components/ui/Toast'
import { formatDate } from '@/lib/date'
import { articleCommentQueries } from '@/queries/article/comment.queries'
import { articleCommentService } from '@/services/article/comment.service'
import { useAuthStore } from '@/stores/useAuth.store'
import type { ArticleComment } from '@/types/article.type'

interface ArticleCommentsProps {
	articleId: string
}

function renderContent(text: string) {
	const mentionRegex = /(@\S+)/g
	const parts = text.split(mentionRegex)
	return parts.map((part, i) => {
		if (part.match(mentionRegex)) {
			return (
				<span
					className={`${montserrat.className} font-semibold text-sky-400`}
					key={i}
				>
					{part}
				</span>
			)
		}
		return part
	})
}

export default function ArticleComments({ articleId }: ArticleCommentsProps) {
	const t = useTranslations()
	const queryClient = useQueryClient()
	const user = useAuthStore((s) => s.user)
	const isAdmin = user?.roles?.some(
		(r) => r.name === 'admin' || r.name === 'ADMIN'
	)
	const textareaRef = useRef<HTMLTextAreaElement>(null)

	const { data } = useSuspenseQuery(
		articleCommentQueries.list(articleId, { take: 50 })
	)

	const [content, setContent] = useState('')

	const createMutation = useMutation({
		mutationFn: () =>
			articleCommentService.create(articleId, {
				content: content.trim(),
			}),
		onSuccess: () => {
			toast.success(t('articles.comments.toast.added'))
			queryClient.invalidateQueries({
				queryKey: ['article', articleId, 'comments'],
			})
			setContent('')
		},
		onError: () => toast.error(t('articles.comments.toast.addError')),
	})

	const deleteMutation = useMutation({
		mutationFn: (commentId: number) =>
			articleCommentService.delete(articleId, commentId),
		onSuccess: () => {
			toast.success(t('articles.comments.toast.deleted'))
			queryClient.invalidateQueries({
				queryKey: ['article', articleId, 'comments'],
			})
		},
		onError: () => toast.error(t('articles.comments.toast.deleteError')),
	})

	const comments = data?.data ?? []

	const topLevel = comments
	const repliesMap = new Map<number, ArticleComment[]>()
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
				{t('articles.comments.title', { count: data.total })}
			</h3>

			{user && (
				<div className="flex flex-col gap-2">
					<div className="flex gap-2">
						<textarea
							className="min-h-10 flex-1 resize-none rounded-lg border-2 border-border-secondary bg-background px-3 py-2 font-semibold text-sm outline-none transition-colors focus:border-sky-400/50"
							onChange={(e) => setContent(e.target.value)}
							onKeyDown={(e) => {
								if (
									e.key === 'Enter' &&
									(e.ctrlKey || e.metaKey)
								)
									handleSubmit()
							}}
							placeholder={t('articles.comments.placeholder')}
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
						articleId={articleId}
						comment={comment}
						currentUserId={user?.id}
						key={comment.id}
						onDelete={(id) => deleteMutation.mutate(id)}
						onReply={handleReply}
						replies={repliesMap.get(comment.id) ?? []}
					/>
				))}

				{topLevel.length === 0 && (
					<p className="py-4 text-center text-neutral-400 text-sm">
						{t('articles.comments.empty')}
					</p>
				)}
			</div>
		</div>
	)
}

function CommentItem({
	admin,
	articleId,
	comment,
	currentUserId,
	onDelete,
	onReply,
	replies,
}: {
	admin: boolean
	articleId: string
	comment: ArticleComment
	currentUserId?: string
	onDelete: (id: number) => void
	onReply: (username: string) => void
	replies: ArticleComment[]
}) {
	const t = useTranslations()
	const canDelete = admin || String(comment.author.id) === currentUserId

	return (
		<div className="flex flex-col gap-2">
			<div className="rounded-lg bg-background px-3 py-2">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Image
							alt={comment.author.username}
							className="rounded-full"
							height={42}
							src={`${process.env.NEXT_PUBLIC_API}/api/v1/users/avatar/${comment.author.id}`}
							unoptimized
							width={42}
						/>
						<span
							className={`${montserrat.className} font-semibold text-xs`}
						>
							{comment.author.username}
						</span>
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
								{t('articles.comments.reply')}
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
											{t('articles.comments.deleteTitle')}
										</Modal.Title>
									</Modal.Header>
									<Modal.Footer>
										<Modal.Close>
											{t('articles.comments.cancel')}
										</Modal.Close>
										<Modal.Action
											closeOnClick
											onClick={() => onDelete(comment.id)}
											variant="danger"
										>
											{t(
												'articles.comments.deleteConfirm'
											)}
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
				<div className="ml-6 flex flex-col gap-2 border-border-secondary border-l-2 pl-3">
					{replies.map((reply) => (
						<CommentItem
							admin={admin}
							articleId={articleId}
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
