'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { cn } from '@/lib/cn'
import { resolveImageUrl } from '@/lib/imageUrl'

interface AwardImageUploadProps {
	value?: string | null
	uploading?: boolean
	onFile: (file: File) => void
	className?: string
	previewClassName?: string
}

export default function AwardImageUpload({
	value,
	uploading = false,
	onFile,
	className,
	previewClassName,
}: AwardImageUploadProps) {
	const t = useTranslations('admin.awards')
	const [dragging, setDragging] = useState(false)
	const preview = resolveImageUrl(value)

	const pick = (files: FileList | null) => {
		const file = files?.[0]
		if (file && !uploading) onFile(file)
	}

	return (
		<label
			className={cn(
				'group border-primary/35 bg-muted/20 focus-within:ring-primary/50 hover:border-primary/70 hover:bg-primary/5 relative flex min-h-40 cursor-pointer flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border-2 border-dashed p-4 text-center transition-colors focus-within:ring-2',
				dragging && 'border-primary bg-primary/10',
				uploading && 'cursor-progress',
				className
			)}
			onDragEnter={(event) => {
				event.preventDefault()
				if (!uploading) setDragging(true)
			}}
			onDragLeave={(event) => {
				event.preventDefault()
				setDragging(false)
			}}
			onDragOver={(event) => {
				event.preventDefault()
				if (!uploading) setDragging(true)
			}}
			onDrop={(event) => {
				event.preventDefault()
				setDragging(false)
				pick(event.dataTransfer.files)
			}}
		>
			<input
				accept="image/png,image/jpeg,image/webp,image/gif"
				className="sr-only"
				disabled={uploading}
				onChange={(event) => {
					pick(event.target.files)
					event.target.value = ''
				}}
				type="file"
			/>
			{preview ? (
				<>
					<img
						alt=""
						className={cn(
							'h-40 w-full rounded-xl object-cover',
							previewClassName
						)}
						src={preview}
					/>
					<span className="bg-background/80 absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 p-2 text-sm font-medium backdrop-blur-sm">
						<Icon icon="lucide:refresh-cw" />
						{t('replaceImage')}
					</span>
				</>
			) : (
				<>
					<span className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-2xl">
						<Icon className="text-2xl" icon="lucide:image-up" />
					</span>
					<span className="flex flex-col gap-1">
						<span className="text-sm font-semibold">
							{t('uploadImage')}
						</span>
						<span className="text-muted-foreground text-xs">
							{t('dropImage')} · {t('imageHint')}
						</span>
					</span>
				</>
			)}
			{uploading && (
				<span className="bg-background/80 absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 backdrop-blur-sm">
					<Icon
						className="text-primary animate-spin text-2xl"
						icon="lucide:loader-circle"
					/>
					<span className="text-sm font-medium">
						{t('uploadingImage')}
					</span>
				</span>
			)}
		</label>
	)
}
