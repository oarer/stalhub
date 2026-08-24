import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { useRef, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { createGallerySnippet } from '@/components/wiki/gallery'
import {
	createQuestMapSnippet,
	type QuestMapMarker,
} from '@/components/wiki/quest-map'
import {
	MDX_COMPONENT_SNIPPET,
	MDX_COMPONENTS,
} from '@/constants/article-editor.const'
import { cn } from '@/lib/cn'
import { articleService } from '@/services/article/article.service'
import { applyEdit } from './editor-utils'
import { QuestMapModal } from './QuestMapModal'

interface ComponentsModalProps {
	articleId: string
	open: boolean
	onOpenChange: (v: boolean) => void
	textareaRef: React.RefObject<HTMLTextAreaElement | null>
	setContent: (v: string) => void
}

export function ComponentsModal({
	articleId,
	open,
	onOpenChange,
	textareaRef,
	setContent,
}: ComponentsModalProps) {
	const t = useTranslations()
	const galleryInputRef = useRef<HTMLInputElement>(null)
	const [isUploadingGallery, setIsUploadingGallery] = useState(false)
	const [questMapOpen, setQuestMapOpen] = useState(false)

	const insertSnippet = (
		snippet: string,
		selectionOffset = snippet.length
	) => {
		const ta = textareaRef.current
		if (!ta) return
		const start = ta.selectionStart
		const next = ta.value.slice(0, start) + snippet + ta.value.slice(start)
		applyEdit(ta, setContent, {
			next,
			newStart: start + selectionOffset,
			newEnd: start + selectionOffset,
		})
	}

	const handleInsert = (type: string) => {
		const ta = textareaRef.current
		if (!ta) return
		const snippet = MDX_COMPONENT_SNIPPET(
			type,
			t('me.articleEditor.hotkeys.heading'),
			t('me.articleEditor.mdxContent')
		)
		const start = ta.selectionStart
		const next = ta.value.slice(0, start) + snippet + ta.value.slice(start)
		applyEdit(ta, setContent, {
			next,
			newStart: start + type.length + 4,
			newEnd: start + type.length + 13,
		})
		onOpenChange(false)
	}

	const handleQuestMapInsert = (
		mapId: string,
		mapName: string,
		markers: QuestMapMarker[]
	) => {
		insertSnippet(createQuestMapSnippet(mapId, mapName, markers))
		onOpenChange(false)
	}

	const handleGalleryFiles = async (files: File[]) => {
		if (files.length === 0) return
		setIsUploadingGallery(true)
		try {
			const results = await Promise.allSettled(
				files.map((file) => articleService.uploadImage(articleId, file))
			)
			const urls = results.flatMap((result) =>
				result.status === 'fulfilled' ? [result.value] : []
			)
			if (urls.length > 0) insertSnippet(createGallerySnippet(urls))
			onOpenChange(false)
		} finally {
			setIsUploadingGallery(false)
			if (galleryInputRef.current) galleryInputRef.current.value = ''
		}
	}

	return (
		<>
			<Modal.Root onOpenChange={onOpenChange} open={open}>
				<Modal.Content className="max-w-lg" fullScreen={false}>
					<Modal.Header>
						<Modal.Title>
							{t('me.articleEditor.components')}
						</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<div className="grid grid-cols-2 gap-2">
							<button
								className="flex cursor-pointer items-center gap-3 rounded-lg border-2 border-primary/30 p-3 text-left transition-colors hover:bg-primary/10"
								onClick={() => setQuestMapOpen(true)}
								type="button"
							>
								<Icon
									className="size-5 shrink-0"
									icon="lucide:map-pinned"
								/>
								<p className="font-semibold text-sm">
									Quest map
								</p>
							</button>
							<button
								className="flex cursor-pointer items-center gap-3 rounded-lg border-2 border-primary/30 p-3 text-left transition-colors hover:bg-primary/10"
								disabled={isUploadingGallery}
								onClick={() => galleryInputRef.current?.click()}
								type="button"
							>
								<Icon
									className="size-5 shrink-0"
									icon="lucide:images"
								/>
								<p className="font-semibold text-sm">Gallery</p>
							</button>
							<input
								accept="image/jpeg,image/png,image/webp,image/gif"
								className="hidden"
								multiple
								onChange={(event) =>
									handleGalleryFiles(
										Array.from(event.target.files ?? [])
									)
								}
								ref={galleryInputRef}
								type="file"
							/>
							{MDX_COMPONENTS.map((item) => (
								<button
									className={cn(
										'flex cursor-pointer items-center gap-3 rounded-lg border-2 p-3 text-left transition-colors',
										item.color
									)}
									key={item.type}
									onClick={() => handleInsert(item.type)}
									type="button"
								>
									<Icon
										className="size-5 shrink-0"
										icon={item.icon}
									/>
									<p className="font-semibold text-sm capitalize">
										{item.type}
									</p>
								</button>
							))}
						</div>
					</Modal.Body>
				</Modal.Content>
			</Modal.Root>
			<QuestMapModal
				onInsert={handleQuestMapInsert}
				onOpenChange={setQuestMapOpen}
				open={questMapOpen}
			/>
		</>
	)
}
