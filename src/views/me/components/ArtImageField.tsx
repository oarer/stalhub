'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { toast } from '@/components/ui/Toast'
import { resolveImageUrl } from '@/lib/imageUrl'
import { artService } from '@/services/art/art.service'

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']

export function ArtImageField({
	value,
	onChange,
}: {
	value: string
	onChange: (value: string) => void
}) {
	const t = useTranslations()
	const inputRef = useRef<HTMLInputElement>(null)
	const [uploading, setUploading] = useState(false)

	const previewSrc = resolveImageUrl(value)

	const handleFile = async (file?: File | null) => {
		if (!file) return
		if (!ACCEPTED_TYPES.includes(file.type)) {
			toast.error(t('me.newArt.imageInvalidType'))
			return
		}
		if (file.size > 10 * 1024 * 1024) {
			toast.error(t('me.newArt.imageTooLarge'))
			return
		}

		setUploading(true)
		try {
			const { image_url } = await artService.uploadImage(file)
			onChange(image_url)
			toast.success(t('me.newArt.imageUploaded'))
		} catch {
			toast.error(t('me.newArt.imageUploadError'))
		} finally {
			setUploading(false)
			if (inputRef.current) inputRef.current.value = ''
		}
	}

	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-center gap-2">
				<input
					accept={ACCEPTED_TYPES.join(',')}
					className="hidden"
					onChange={(e) => handleFile(e.target.files?.[0])}
					ref={inputRef}
					type="file"
				/>
				<Button
					className="gap-2"
					loading={uploading}
					onClick={() => inputRef.current?.click()}
					type="button"
					variant="secondary"
				>
					<Icon className="size-4" icon="lucide:upload" />
					<span>{t('me.newArt.upload')}</span>
				</Button>
				<Input
					className="flex-1"
					onChange={(e) => onChange(e.target.value)}
					placeholder={t('me.newArt.imagePlaceholder')}
					value={value}
				/>
			</div>
			{previewSrc && (
				<div className="relative aspect-video w-full max-w-sm overflow-hidden rounded-lg">
					<img
						alt="Preview"
						className="h-full w-full object-contain"
						src={previewSrc}
					/>
				</div>
			)}
		</div>
	)
}
