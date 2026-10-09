'use client'

import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { CommentThread } from '@/components/comments/CommentThread'
import { toast } from '@/components/ui/Toast'
import { getQueryClient } from '@/providers/QueryProvider'
import { articleCommentQueries } from '@/queries/article/comment.queries'
import { articleCommentService } from '@/services/article/comment.service'

interface ArticleCommentsProps {
	articleId: string
}

export default function ArticleComments({ articleId }: ArticleCommentsProps) {
	const t = useTranslations()
	const queryClient = getQueryClient()

	const { data } = useSuspenseQuery(
		articleCommentQueries.list(articleId, { take: 50 })
	)

	const createMutation = useMutation({
		mutationFn: (content: string) =>
			articleCommentService.create(articleId, { content }),
		onSuccess: () => {
			toast.success(t('articles.comments.toast.added'))
			queryClient.invalidateQueries({
				queryKey: ['article', articleId, 'comments'],
			})
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

	return (
		<CommentThread
			comments={data?.data ?? []}
			isCreating={createMutation.isPending}
			onCreate={(content) => createMutation.mutateAsync(content)}
			onDelete={(id) => deleteMutation.mutate(id)}
			totalCount={data.total_count}
			translationNamespace="articles"
		/>
	)
}
