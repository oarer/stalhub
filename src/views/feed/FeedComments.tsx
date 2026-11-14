'use client'

import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { CommentThread } from '@/components/comments/CommentThread'
import { toast } from '@/components/ui/Toast'
import { getQueryClient } from '@/providers/QueryProvider'
import { feedCommentQueries } from '@/queries/feed/comment.queries'
import {
	type FeedCommentTarget,
	feedCommentService,
} from '@/services/feed/comment.service'

interface FeedCommentsProps {
	target: FeedCommentTarget
	id: string
}

export function FeedComments({ target, id }: FeedCommentsProps) {
	const t = useTranslations()
	const queryClient = getQueryClient()
	const queryKey = ['feed', target, id, 'comments']
	const { data } = useSuspenseQuery(feedCommentQueries.list(target, id))

	const createMutation = useMutation({
		mutationFn: (content: string) =>
			feedCommentService.create(target, id, { content }),
		onSuccess: () => {
			toast.success(t('feed.comments.toast.added'))
			queryClient.invalidateQueries({ queryKey })
		},
		onError: () => toast.error(t('feed.comments.toast.addError')),
	})

	const deleteMutation = useMutation({
		mutationFn: (commentId: number) =>
			feedCommentService.delete(target, id, commentId),
		onSuccess: () => {
			toast.success(t('feed.comments.toast.deleted'))
			queryClient.invalidateQueries({ queryKey })
		},
		onError: () => toast.error(t('feed.comments.toast.deleteError')),
	})

	return (
		<CommentThread
			comments={data.data}
			isCreating={createMutation.isPending}
			onCreate={(content) => createMutation.mutateAsync(content)}
			onDelete={(commentId) => deleteMutation.mutate(commentId)}
			totalCount={data.total_count}
			translationNamespace="feed"
		/>
	)
}
