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
					<Modal.Title>Теги</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Input
						autoFocus
						label="Теги через запятую"
						onChange={(e) => setDraft(e.target.value)}
						value={draft}
					/>
				</Modal.Body>
				<Modal.Footer>
					<Modal.Close>Отмена</Modal.Close>
					<Modal.Action onClick={handleSave}>
						Сохранить
					</Modal.Action>
				</Modal.Footer>
			</Modal.Content>
		</Modal.Root>
	)
}
