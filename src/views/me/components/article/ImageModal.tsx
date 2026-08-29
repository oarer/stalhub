import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { toast } from '@/components/ui/Toast'

interface ImageModalProps {
	open: boolean
	onOpenChange: (v: boolean) => void
	initialUrl: string
	onSave: (url: string) => void
	onUpload?: (file: File) => Promise<string>
}

export function ImageModal({
	open,
	onOpenChange,
	initialUrl,
	onSave,
	onUpload,
}: ImageModalProps) {
	const [draft, setDraft] = useState(initialUrl)
	const [uploading, setUploading] = useState(false)
	const fileInputRef = useRef<HTMLInputElement>(null)
	const t = useTranslations()

	const handleSave = () => {
		onSave(draft)
		onOpenChange(false)
	}

	const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file || !onUpload) return

		setUploading(true)
		try {
			const url = await onUpload(file)
			setDraft(url)
			toast.success(t('me.articleEditor.imageUploaded'))
		} catch {
			toast.error(t('me.articleEditor.imageUploadError'))
		} finally {
			setUploading(false)
			if (fileInputRef.current) fileInputRef.current.value = ''
		}
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
						{onUpload && (
							<div className="flex items-center gap-2">
								<input
									accept="image/jpeg,image/png,image/webp,image/gif"
									className="hidden"
									onChange={handleFileSelect}
									ref={fileInputRef}
									type="file"
								/>
								<Button
									disabled={uploading}
									onClick={() =>
										fileInputRef.current?.click()
									}
									size="sm"
									variant="secondary"
								>
									{uploading ? (
										<Icon
											className="size-4 animate-spin"
											icon="lucide:loader-circle"
										/>
									) : (
										<Icon
											className="size-4"
											icon="lucide:upload"
										/>
									)}
									{t('me.articleEditor.uploadFile')}
								</Button>
							</div>
						)}
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
