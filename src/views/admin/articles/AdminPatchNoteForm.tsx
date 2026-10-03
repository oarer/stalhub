'use client'

import { useMutation } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { toast } from '@/components/ui/Toast'
import { getQueryClient } from '@/providers/QueryProvider'
import { articleService } from '@/services/article/article.service'
import { ArticleType } from '@/types/article.type'

export function AdminPatchNoteForm({
	open,
	onOpenChange,
}: {
	open: boolean
	onOpenChange: (open: boolean) => void
}) {
	const t = useTranslations()
	const queryClient = getQueryClient()
	const [title, setTitle] = useState('')
	const [content, setContent] = useState('')
	const [imageUrl, setImageUrl] = useState('')
	const [tags, setTags] = useState('')

	useEffect(() => {
		if (open) {
			setTitle('')
			setContent('')
			setImageUrl('')
			setTags('')
		}
	}, [open])

	const createMutation = useMutation({
		mutationFn: () =>
			articleService.create({
				title: title.trim(),
				content,
				type: ArticleType.STALHUB,
				image_url: imageUrl.trim() || null,
				tags: tags
					.split(',')
					.map((s) => s.trim())
					.filter(Boolean),
			}),
		onSuccess: () => {
			toast.success(t('patchNotes.toast.created'))
			queryClient.invalidateQueries({ queryKey: ['articles'] })
			onOpenChange(false)
		},
		onError: () => toast.error(t('patchNotes.toast.createError')),
	})

	const canSubmit = title.trim() !== '' && content.trim() !== ''

	return (
		<Modal.Root onOpenChange={onOpenChange} open={open}>
			<Modal.Content fullScreen={false}>
				<Modal.Header>
					<Modal.Title>{t('patchNotes.createTitle')}</Modal.Title>
					<Modal.Description>
						{t('patchNotes.createDescription')}
					</Modal.Description>
				</Modal.Header>
				<Modal.Body>
					<div className="flex max-h-105 flex-col gap-4 overflow-y-auto pr-1">
						<Input
							autoFocus
							label="patchNotes.form.title"
							onChange={(e) => setTitle(e.target.value)}
							value={title}
						/>
						<Input
							label="patchNotes.form.image"
							onChange={(e) => setImageUrl(e.target.value)}
							value={imageUrl}
						/>
						<Input
							label="patchNotes.form.tags"
							onChange={(e) => setTags(e.target.value)}
							value={tags}
						/>
						<div className="flex flex-col gap-2">
							<span className="font-semibold text-md text-text-accent">
								{t('patchNotes.form.content')}
							</span>
							<textarea
								className="min-h-48 w-full resize-y rounded-lg border border-border bg-card p-2 font-mono text-sm outline-none transition-colors focus:border-primary"
								onChange={(e) => setContent(e.target.value)}
								placeholder={t('patchNotes.form.contentPlaceholder')}
								value={content}
							/>
						</div>
					</div>
				</Modal.Body>
				<Modal.Footer>
					<Modal.Close>{t('clan.common.cancel')}</Modal.Close>
					<Button
						disabled={!canSubmit}
						loading={createMutation.isPending}
						onClick={() => createMutation.mutate()}
						variant="primary"
					>
						{t('patchNotes.form.create')}
					</Button>
				</Modal.Footer>
			</Modal.Content>
		</Modal.Root>
	)
}
