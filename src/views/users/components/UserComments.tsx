'use client'

import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { CommentThread } from '@/components/comments/CommentThread'
import { toast } from '@/components/ui/Toast'
import { getQueryClient } from '@/providers/QueryProvider'
import { userCommentQueries } from '@/queries/user/comment.queries'
import { userCommentService } from '@/services/user/comment.service'

interface UserCommentsProps {
	userId: number
}

export default function UserComments({ userId }: UserCommentsProps) {
	const t = useTranslations()
	const queryClient = getQueryClient()

	const { data } = useSuspenseQuery(
		userCommentQueries.list(userId, { take: 50 })
	)

	const createMutation = useMutation({
		mutationFn: (content: string) =>
			userCommentService.create(userId, { content }),
		onSuccess: () => {
			toast.success(t('users.comments.toast.added'))
			queryClient.invalidateQueries({
				queryKey: ['user', userId, 'comments'],
			})
		},
		onError: () => toast.error(t('users.comments.toast.addError')),
	})

	const deleteMutation = useMutation({
		mutationFn: (commentId: number) =>
			userCommentService.delete(userId, commentId),
		onSuccess: () => {
			toast.success(t('users.comments.toast.deleted'))
			queryClient.invalidateQueries({
				queryKey: ['user', userId, 'comments'],
			})
		},
		onError: () => toast.error(t('users.comments.toast.deleteError')),
	})

	return (
		<CommentThread
			comments={data?.data ?? []}
			isCreating={createMutation.isPending}
			onCreate={(content) => createMutation.mutateAsync(content)}
			onDelete={(id) => deleteMutation.mutate(id)}
			totalCount={data.total_count}
			translationNamespace="users"
		/>
	)
}
