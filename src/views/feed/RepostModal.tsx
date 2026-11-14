'use client'

import { useMutation } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Textarea } from '@/components/ui/Textarea'
import { toast } from '@/components/ui/Toast'
import { getQueryClient } from '@/providers/QueryProvider'
import { postService } from '@/services/post/post.service'
import type { Post } from '@/types/post.type'

export function RepostModal({
	post,
	trigger,
}: {
	post: Pick<Post, 'external_id'>
	trigger: React.ReactNode
}) {
	const t = useTranslations()
	const queryClient = getQueryClient()
	const [open, setOpen] = useState(false)
	const [content, setContent] = useState('')
	const mutation = useMutation({
		mutationFn: () => postService.repost(post.external_id, content),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['feed'] })
			setOpen(false)
			setContent('')
			toast.success(t('post.repost.toast'))
		},
		onError: () => toast.error(t('post.repost.error')),
	})
	return (
		<Modal.Root onOpenChange={setOpen} open={open}>
			<Modal.Trigger asChild>{trigger}</Modal.Trigger>
			<Modal.Content fullScreen={false}>
				<Modal.Header>
					<Modal.Title>{t('post.repost.title')}</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Textarea
						className="min-h-28 w-full"
						onChange={(event) => setContent(event.target.value)}
						placeholder={t('post.repost.placeholder')}
						value={content}
					/>
				</Modal.Body>
				<Modal.Footer>
					<Modal.Close>{t('post.cancel')}</Modal.Close>
					<Modal.Action
						disabled={mutation.isPending}
						onClick={async () => {
							await mutation.mutateAsync()
						}}
					>
						{t('post.repost.action')}
					</Modal.Action>
				</Modal.Footer>
			</Modal.Content>
		</Modal.Root>
	)
}
