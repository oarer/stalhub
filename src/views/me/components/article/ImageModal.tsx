import { useState } from 'react'
import { useTranslations } from 'next-intl'
import Input from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'

interface ImageModalProps {
	open: boolean
	onOpenChange: (v: boolean) => void
	initialUrl: string
	onSave: (url: string) => void
}

export function ImageModal({
	open,
	onOpenChange,
	initialUrl,
	onSave,
}: ImageModalProps) {
	const [draft, setDraft] = useState(initialUrl)
	const t = useTranslations()

	const handleSave = () => {
		onSave(draft)
		onOpenChange(false)
	}

	const handleOpenChange = (v: boolean) => {
		if (v) setDraft(initialUrl)
		onOpenChange(v)
	}

	return (
		<Modal.Root onOpenChange={handleOpenChange} open={open}>
			<Modal.Content className="max-w-md" fullScreen={false}>
				<Modal.Header>
					<Modal.Title>
						{t('me.articleEditor.coverTitle')}
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<div className="flex flex-col gap-3">
						<Input
							autoFocus
							label="me.articleEditor.imageUrl"
							onChange={(e) => setDraft(e.target.value)}
							value={draft}
						/>
						{draft && (
							<div className="relative aspect-video w-full overflow-hidden rounded-lg">
								<img
									alt="Preview"
									className="h-full w-full object-cover"
									src={draft}
								/>
							</div>
						)}
					</div>
				</Modal.Body>
				<Modal.Footer>
					<Modal.Action
						onClick={() => {
							onSave('')
							onOpenChange(false)
						}}
						variant="danger"
					>
						{t('me.articleEditor.delete')}
					</Modal.Action>
					<Modal.Close>{t('me.articleEditor.cancel')}</Modal.Close>
					<Modal.Action onClick={handleSave}>
						{t('me.articleEditor.saveBtn')}
					</Modal.Action>
				</Modal.Footer>
			</Modal.Content>
		</Modal.Root>
	)
}
