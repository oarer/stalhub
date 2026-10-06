'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { toast } from '@/components/ui/Toast'
import { cn } from '@/lib/cn'
import { isVideoUrl, resolveImageUrl } from '@/lib/imageUrl'
import { artService } from '@/services/art/art.service'
import { ART_IMAGES_MAX_COUNT } from '@/types/art.type'

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

export function ArtImagesField({
	value,
	onChange,
}: {
	value: string[]
	onChange: (value: string[]) => void
}) {
	const t = useTranslations()
	const inputRef = useRef<HTMLInputElement>(null)
	const [uploading, setUploading] = useState(false)
	const [progress, setProgress] = useState(0)
	const [urlDraft, setUrlDraft] = useState('')

	const addUrls = (urls: string[]) => {
		const cleaned = urls
			.map((u) => u.trim())
			.filter((u) => u && !value.includes(u))
		if (cleaned.length === 0) return
		const merged = [...value, ...cleaned].slice(0, ART_IMAGES_MAX_COUNT)
		onChange(merged)
	}

	const handleFiles = async (files: File[] | FileList | null) => {
		if (!files || files.length === 0) return
		const list = Array.from(files)
		const free = ART_IMAGES_MAX_COUNT - value.length
		if (free <= 0) {
			toast.error(
				t('me.newArt.maxImages', { count: ART_IMAGES_MAX_COUNT })
			)
			return
		}
		const sliced = list.slice(0, free)
		if (list.length > free) {
			toast.error(
				t('me.newArt.maxImages', { count: ART_IMAGES_MAX_COUNT })
			)
		}

		setUploading(true)
		setProgress(0)
		try {
			const uploaded: string[] = []
			for (let i = 0; i < sliced.length; i++) {
				const file = sliced[i]
				const isVideoFile = ACCEPTED_VIDEO_TYPES.includes(file.type)
				if (!ACCEPTED_TYPES.includes(file.type)) {
					toast.error(t('me.newArt.imageInvalidType'))
					continue
				}
				const maxSize = isVideoFile ? VIDEO_MAX_SIZE : IMAGE_MAX_SIZE
				if (file.size > maxSize) {
					toast.error(t('me.newArt.workTooLarge'))
					continue
				}
				try {
					const { image_url } = await artService.uploadMedia(
						file,
						(p) => {
							const overall = Math.round(
								((i + p / 100) / sliced.length) * 100
							)
							setProgress(overall)
						}
					)
					uploaded.push(image_url)
				} catch {
					toast.error(t('me.newArt.imageUploadError'))
				}
			}
			if (uploaded.length > 0) {
				addUrls(uploaded)
				toast.success(t('me.newArt.workUploaded'))
			}
		} finally {
			setUploading(false)
			setProgress(0)
			if (inputRef.current) inputRef.current.value = ''
		}
	}

	const move = (index: number, delta: -1 | 1) => {
		const next = index + delta
		if (next < 0 || next >= value.length) return
		const copy = [...value]
		const [item] = copy.splice(index, 1)
		copy.splice(next, 0, item)
		onChange(copy)
	}

	const makeCover = (index: number) => {
		if (index === 0) return
		const copy = [...value]
		const [item] = copy.splice(index, 1)
		copy.unshift(item)
		onChange(copy)
	}

	const remove = (index: number) => {
		onChange(value.filter((_, i) => i !== index))
	}

	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-center gap-2">
				<input
					accept={ACCEPTED_TYPES.join(',')}
					className="hidden"
					multiple
					onChange={(e) => handleFiles(e.target.files)}
					ref={inputRef}
					type="file"
				/>
				<div className="grid w-full grid-cols-[50%_50%] gap-2">
					<Button
						className="w-full gap-2"
						disabled={
							uploading || value.length >= ART_IMAGES_MAX_COUNT
						}
						onClick={() => inputRef.current?.click()}
						type="button"
						variant="secondary"
					>
						<Icon className="size-4" icon="lucide:upload" />
						<span className="font-semibold text-[13px]">
							{t('me.newArt.upload')} ({value.length}/
							{ART_IMAGES_MAX_COUNT})
						</span>
					</Button>
					<div className="flex gap-1.5">
						<Input
							containerClass="w-full"
							label={t('me.newArt.workPlaceholder')}
							onChange={(e) => setUrlDraft(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === 'Enter' && urlDraft.trim()) {
									addUrls([urlDraft])
									setUrlDraft('')
								}
							}}
							value={urlDraft}
						/>
						<Button
							className="shrink-0 p-2.5"
							disabled={
								!urlDraft.trim() ||
								value.length >= ART_IMAGES_MAX_COUNT
							}
							onClick={() => {
								addUrls([urlDraft])
								setUrlDraft('')
							}}
							type="button"
							variant="secondary"
						>
							<Icon className="size-4" icon="lucide:plus" />
						</Button>
					</div>
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

			{value.length > 0 && (
				<div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
					{value.map((url, index) => {
						const previewSrc = resolveImageUrl(url)
						const isVideo = previewSrc
							? isVideoUrl(previewSrc)
							: false
						return (
							<div
								className={cn(
									'group relative aspect-square overflow-hidden rounded-lg ring-2',
									index === 0
										? 'ring-primary'
										: 'ring-primary/30'
								)}
								key={`${url}-${index}`}
							>
								{isVideo ? (
									<video
										className="h-full w-full object-cover"
										muted
										playsInline
										preload="metadata"
										src={previewSrc ?? ''}
									/>
								) : (
									<img
										alt={`Preview ${index + 1}`}
										className="h-full w-full object-cover"
										src={previewSrc ?? ''}
									/>
								)}
								{index === 0 && (
									<span className="absolute top-1.5 left-1.5 rounded-md bg-primary px-1.5 py-0.5 font-semibold text-[11px] text-primary-foreground">
										{t('me.newArt.cover')}
									</span>
								)}
								<div className="absolute inset-x-1.5 bottom-1.5 flex justify-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
									<button
										aria-label="Move left"
										className="rounded-md bg-card/90 p-1.5 backdrop-blur transition-colors hover:bg-primary hover:text-primary-foreground disabled:opacity-40"
										disabled={index === 0}
										onClick={() => move(index, -1)}
										type="button"
									>
										<Icon
											className="size-3.5"
											icon="lucide:chevron-left"
										/>
									</button>
									<button
										aria-label="Make cover"
										className="rounded-md bg-card/90 p-1.5 backdrop-blur transition-colors hover:bg-primary hover:text-primary-foreground disabled:opacity-40"
										disabled={index === 0}
										onClick={() => makeCover(index)}
										type="button"
									>
										<Icon
											className="size-3.5"
											icon="lucide:star"
										/>
									</button>
									<button
										aria-label="Move right"
										className="rounded-md bg-card/90 p-1.5 backdrop-blur transition-colors hover:bg-primary hover:text-primary-foreground disabled:opacity-40"
										disabled={index === value.length - 1}
										onClick={() => move(index, 1)}
										type="button"
									>
										<Icon
											className="size-3.5"
											icon="lucide:chevron-right"
										/>
									</button>
									<button
										aria-label="Remove"
										className="rounded-md bg-card/90 p-1.5 backdrop-blur transition-colors hover:bg-red-500 hover:text-white"
										onClick={() => remove(index)}
										type="button"
									>
										<Icon
											className="size-3.5"
											icon="lucide:trash-2"
										/>
									</button>
								</div>
							</div>
						)
					})}
				</div>
			)}
		</div>
	)
}
