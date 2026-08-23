'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { toast } from '@/components/ui/Toast'
import { isVideoUrl, resolveImageUrl } from '@/lib/imageUrl'
import { artService } from '@/services/art/art.service'

const ACCEPTED_IMAGE_TYPES = [
	'image/png',
	'image/jpeg',
	'image/webp',
	'image/gif',
]
const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm']
const ACCEPTED_TYPES = [...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_VIDEO_TYPES]

const IMAGE_MAX_SIZE = 10 * 1024 * 1024
const VIDEO_MAX_SIZE = 100 * 1024 * 1024

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
	const [progress, setProgress] = useState(0)

	const previewSrc = resolveImageUrl(value)
	const isVideo = previewSrc ? isVideoUrl(previewSrc) : false

	const handleFile = async (file?: File | null) => {
		if (!file) return

		const isVideoFile = ACCEPTED_VIDEO_TYPES.includes(file.type)

		if (!ACCEPTED_TYPES.includes(file.type)) {
			toast.error(t('me.newArt.imageInvalidType'))
			return
		}

		const maxSize = isVideoFile ? VIDEO_MAX_SIZE : IMAGE_MAX_SIZE
		if (file.size > maxSize) {
			toast.error(t('me.newArt.workTooLarge'))
			return
		}

		setUploading(true)
		setProgress(0)
		try {
			const { image_url } = await artService.uploadMedia(
				file,
				setProgress
			)
			onChange(image_url)
			toast.success(t('me.newArt.workUploaded'))
		} catch {
			toast.error(t('me.newArt.imageUploadError'))
		} finally {
			setUploading(false)
			setProgress(0)
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
				<div className="grid w-full grid-cols-[50%_50%] gap-2">
					<Button
						className="w-full gap-2"
						disabled={uploading}
						onClick={() => inputRef.current?.click()}
						type="button"
						variant="secondary"
					>
						<Icon className="size-4" icon="lucide:upload" />
						<span className="font-semibold text-lg">
							{t('me.newArt.upload')}
						</span>
					</Button>
					<Input
						containerClass="w-full"
						label={t('me.newArt.workPlaceholder')}
						onChange={(e) => onChange(e.target.value)}
						value={value}
					/>
				</div>
			</div>

			{uploading && (
				<div className="flex flex-col gap-1">
					<div className="flex justify-between text-muted-foreground text-xs">
						<span>{t('me.newArt.uploading')}</span>
						<span>{progress}%</span>
					</div>
					<div className="h-1.5 w-full overflow-hidden rounded-full bg-accent">
						<div
							className="h-full rounded-full bg-linear-to-r from-muted/50 to-primary transition-all duration-200"
							style={{ width: `${progress}%` }}
						/>
					</div>
				</div>
			)}

			{previewSrc && !uploading && (
				<div className="relative aspect-video w-full max-w-sm overflow-hidden rounded-lg">
					{isVideo ? (
						<video
							className="h-full w-full object-contain"
							controls
							src={previewSrc}
						/>
					) : (
						<img
							alt="Preview"
							className="h-full w-full object-contain"
							src={previewSrc}
						/>
					)}
				</div>
			)}
		</div>
	)
}
