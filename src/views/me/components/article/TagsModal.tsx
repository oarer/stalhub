import { useTranslations } from 'next-intl'
import { useState } from 'react'
import Input from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'

interface TagsModalProps {
	open: boolean
	onOpenChange: (v: boolean) => void
	initialTags: string
	onSave: (tags: string) => void
}

export function TagsModal({
	open,
	onOpenChange,
	initialTags,
	onSave,
}: TagsModalProps) {
	const [draft, setDraft] = useState(initialTags)
	const t = useTranslations()

	const handleSave = () => {
		onSave(draft)
		onOpenChange(false)
	}

	const handleOpenChange = (v: boolean) => {
		if (v) setDraft(initialTags)
		onOpenChange(v)
	}

	return (
		<Modal.Root onOpenChange={handleOpenChange} open={open}>
			<Modal.Content className="max-w-md" fullScreen={false}>
				<Modal.Header>
					<Modal.Title>{t('me.articleEditor.tagsTitle')}</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Input
						autoFocus
						label="me.articleEditor.tagsLabel"
						onChange={(e) => setDraft(e.target.value)}
						value={draft}
					/>
				</Modal.Body>
				<Modal.Footer>
					<Modal.Close>{t('me.articleEditor.cancel')}</Modal.Close>
					<Modal.Action onClick={handleSave}>
						{t('me.articleEditor.saveBtn')}
					</Modal.Action>
				</Modal.Footer>
			</Modal.Content>
		</Modal.Root>
	)
}
