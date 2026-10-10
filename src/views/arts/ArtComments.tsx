'use client'

import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { CommentThread } from '@/components/comments/CommentThread'
import { toast } from '@/components/ui/Toast'
import { getQueryClient } from '@/providers/QueryProvider'
import { artCommentQueries } from '@/queries/art/comment.queries'
import { artCommentService } from '@/services/art/comment.service'

interface ArtCommentsProps {
	artId: string
}

export default function ArtComments({ artId }: ArtCommentsProps) {
	const t = useTranslations()
	const queryClient = getQueryClient()

	const { data } = useSuspenseQuery(artCommentQueries.list(artId))

	const createMutation = useMutation({
		mutationFn: (content: string) =>
			artCommentService.create(artId, { content }),
		onSuccess: () => {
			toast.success(t('arts.comments.toast.added'))
			queryClient.invalidateQueries({
				queryKey: ['art', artId, 'comments'],
			})
			queryClient.invalidateQueries({ queryKey: ['art', artId] })
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

	return (
		<CommentThread
			comments={data?.data ?? []}
			isCreating={createMutation.isPending}
			onCreate={(content) => createMutation.mutateAsync(content)}
			onDelete={(id) => deleteMutation.mutate(id)}
			totalCount={data.total_count}
			translationNamespace="arts"
		/>
	)
}
