'use client'

import { Icon } from '@iconify/react'
import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useState } from 'react'
import { LightBox } from '@/components/ui/LightBox'
import { cn } from '@/lib/cn'
import { articleImageUrl } from '@/types/article.type'

export type GalleryImage = string | { src: string; alt?: string }

export interface NormalizedGalleryImage {
	src: string
	alt: string
	isVideo: boolean
}

const imageVariants = {
	enter: (direction: number) => ({
		opacity: 0,
		scale: 1.03,
		x: direction * 48,
	}),
	center: {
		opacity: 1,
		scale: 1,
		x: 0,
	},
	exit: (direction: number) => ({
		opacity: 0,
		scale: 0.99,
		x: direction * -48,
	}),
}

const imageTransition = {
	duration: 0.45,
	ease: [0.32, 0.72, 0, 1] as const,
}

export function isGalleryVideo(src: string): boolean {
	return /\.(mp4|webm|mov)(\?.*)?$/i.test(src)
}

export function normalizeGalleryImages(images: GalleryImage[] = []) {
	return images.flatMap((image) => {
		const src = (typeof image === 'string' ? image : image?.src)?.trim()

		if (!src) return []

		const alt = typeof image === 'string' ? '' : (image.alt?.trim() ?? '')

		return [
			{
				src,
				alt,
				isVideo: isGalleryVideo(src),
			} satisfies NormalizedGalleryImage,
		]
	})
}

export function createGallerySnippet(images: string[]) {
	return `<Gallery images={${JSON.stringify(images)}} />\n`
}

export interface GalleryProps {
	images?: GalleryImage[]
	className?: string
	/** Превращает исходный src в финальный URL. По умолчанию — CDN статей (совместимость с wiki). */
	resolveUrl?: (src: string) => string | null
	/** Размыть контент (NSFW). Клик снимает блюр через onUnblur. */
	blur?: boolean
	onUnblur?: () => void
	initialIndex?: number
	onIndexChange?: (index: number) => void
	alt?: string
}

export function Gallery({
	images = [],
	className,
	resolveUrl = articleImageUrl,
	blur = false,
	onUnblur,
	initialIndex = 0,
	onIndexChange,
	alt = '',
}: GalleryProps) {
	const normalized = normalizeGalleryImages(images)

	const [currentIndex, setCurrentIndex] = useState(initialIndex)
	const [direction, setDirection] = useState(1)

	const safeIndex = Math.min(
		Math.max(normalized.length > 0 ? currentIndex : 0, 0),
		Math.max(normalized.length - 1, 0)
	)

	const goTo = useCallback(
		(index: number) => {
			if (index === safeIndex) return
			setDirection(index > safeIndex ? 1 : -1)
			setCurrentIndex(index)
			onIndexChange?.(index)
		},
		[safeIndex, onIndexChange]
	)

	const previous = useCallback(() => {
		if (normalized.length === 0) return
		const next = safeIndex === 0 ? normalized.length - 1 : safeIndex - 1
		setDirection(-1)
		setCurrentIndex(next)
		onIndexChange?.(next)
	}, [safeIndex, normalized.length, onIndexChange])

	const next = useCallback(() => {
		if (normalized.length === 0) return
		const next = safeIndex === normalized.length - 1 ? 0 : safeIndex + 1
		setDirection(1)
		setCurrentIndex(next)
		onIndexChange?.(next)
	}, [safeIndex, normalized.length, onIndexChange])

	useEffect(() => {
		setCurrentIndex(
			Math.min(
				Math.max(initialIndex, 0),
				Math.max(normalized.length - 1, 0)
			)
		)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [normalized.length, initialIndex])

	useEffect(() => {
		if (normalized.length <= 1) return
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'ArrowLeft') previous()
			if (e.key === 'ArrowRight') next()
		}
		window.addEventListener('keydown', onKey)
		return () => window.removeEventListener('keydown', onKey)
	}, [normalized.length, previous, next])

	if (normalized.length === 0) return null

	const current = normalized[safeIndex]
	const currentSrc = resolveUrl(current.src) ?? current.src

	const handleUnblur = () => {
		if (blur) onUnblur?.()
	}

	return (
		<div
			className={cn(
				'not-prose my-6 w-full overflow-hidden rounded-xl border border-primary/50',
				className
			)}
		>
			<div className="group relative aspect-video overflow-hidden bg-muted">
				{current.isVideo ? (
					<video
						className={cn(
							'h-full w-full object-contain',
							blur && 'cursor-pointer blur-xl'
						)}
						controls={!blur}
						key={current.src}
						onClick={handleUnblur}
						preload="metadata"
						src={currentSrc}
					/>
				) : (
					<LightBox.Root>
						<LightBox.Trigger asChild>
							<div
								className="relative h-full w-full"
								onClick={handleUnblur}
							>
								<AnimatePresence
									custom={direction}
									initial={false}
								>
									<motion.img
										alt={current.alt || alt}
										animate="center"
										className={cn(
											'absolute inset-0 h-full w-full object-contain',
											blur && 'blur-xl'
										)}
										custom={direction}
										exit="exit"
										initial="enter"
										key={current.src}
										src={currentSrc}
										transition={imageTransition}
										variants={imageVariants}
									/>
								</AnimatePresence>
							</div>
						</LightBox.Trigger>

						<LightBox.Content
							alt={current.alt || alt}
							src={currentSrc}
						/>
					</LightBox.Root>
				)}

				{normalized.length > 1 && (
					<>
						<button
							aria-label="Previous image"
							className={cn(
								'absolute top-1/2 left-3 -translate-y-1/2',
								'rounded-full bg-card p-2 text-card-foreground shadow-sm backdrop-blur',
								'transition-all hover:bg-primary hover:text-primary-foreground',
								'cursor-pointer md:opacity-0 md:group-hover:opacity-100'
							)}
							onClick={previous}
							type="button"
						>
							<Icon icon="lucide:move-left" />
						</button>

						<button
							aria-label="Next image"
							className={cn(
								'absolute top-1/2 right-3 -translate-y-1/2',
								'rounded-full bg-card p-2 text-card-foreground shadow-sm backdrop-blur',
								'transition-all hover:bg-primary hover:text-primary-foreground',
								'cursor-pointer md:opacity-0 md:group-hover:opacity-100'
							)}
							onClick={next}
							type="button"
						>
							<Icon icon="lucide:move-right" />
						</button>

						<p
							className={`absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-card/50 px-3 py-1 font-mono font-semibold text-xs`}
						>
							{safeIndex + 1} / {normalized.length}
						</p>
					</>
				)}
			</div>

			{normalized.length > 1 && (
				<div className="flex gap-2 overflow-x-auto p-3">
					{normalized.map(
						({ src, alt: thumbAlt, isVideo }, index) => {
							const resolvedSrc = resolveUrl(src) ?? src
							const isActive = index === safeIndex

							return (
								<button
									aria-label={
										thumbAlt || `Open image ${index + 1}`
									}
									className={cn(
										'relative h-16 w-24 shrink-0 overflow-hidden rounded-md border-2 transition',
										isActive
											? 'border-primary opacity-100'
											: 'border-transparent opacity-60 hover:opacity-100'
									)}
									key={`${src}-${index}`}
									onClick={() => goTo(index)}
									type="button"
								>
									{isVideo ? (
										<>
											<video
												className={cn(
													'h-full w-full object-cover',
													blur && 'blur-md'
												)}
												muted
												playsInline
												preload="metadata"
												src={resolvedSrc}
											/>
											<span className="absolute inset-0 flex items-center justify-center">
												<Icon
													className="size-5 text-white drop-shadow"
													icon="lucide:play"
												/>
											</span>
										</>
									) : (
										<img
											alt={thumbAlt}
											className={cn(
												'h-full w-full object-cover',
												blur && 'blur-md'
											)}
											loading="lazy"
											src={resolvedSrc}
										/>
									)}
								</button>
							)
						}
					)}
				</div>
			)}
		</div>
	)
}
