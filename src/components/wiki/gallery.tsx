'use client'

import { Icon } from '@iconify/react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { montserrat } from '@/app/fonts'
import { LightBox } from '@/components/ui/LightBox'
import { cn } from '@/lib/cn'
import { articleImageUrl } from '@/types/article.type'

export type GalleryImage = string | { src: string; alt?: string }

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

export function normalizeGalleryImages(images: GalleryImage[] = []) {
	return images.flatMap((image) => {
		const src = (typeof image === 'string' ? image : image?.src)?.trim()

		if (!src) return []

		return [
			{
				src,
				alt: typeof image === 'string' ? '' : (image.alt?.trim() ?? ''),
			},
		]
	})
}

export function createGallerySnippet(images: string[]) {
	return `<Gallery images={${JSON.stringify(images)}} />\n`
}

export function Gallery({
	images = [],
	className,
}: {
	images?: GalleryImage[]
	className?: string
}) {
	const normalized = normalizeGalleryImages(images)

	const [currentIndex, setCurrentIndex] = useState(0)
	const [direction, setDirection] = useState(1)

	if (normalized.length === 0) return null

	const current = normalized[currentIndex]
	const currentSrc = articleImageUrl(current.src)

	const goTo = (index: number) => {
		if (index === currentIndex) return

		setDirection(index > currentIndex ? 1 : -1)
		setCurrentIndex(index)
	}

	const previous = () => {
		setDirection(-1)
		setCurrentIndex((index) =>
			index === 0 ? normalized.length - 1 : index - 1
		)
	}

	const next = () => {
		setDirection(1)
		setCurrentIndex((index) =>
			index === normalized.length - 1 ? 0 : index + 1
		)
	}

	return (
		<div
			className={cn(
				'not-prose my-6 w-full overflow-hidden rounded-xl border border-primary/50',
				className
			)}
		>
			<div className="group relative aspect-video overflow-hidden bg-muted">
				<LightBox.Root>
					<LightBox.Trigger asChild>
						<div className="relative h-full w-full">
							<AnimatePresence custom={direction} initial={false}>
								<motion.img
									alt={current.alt}
									animate="center"
									className="absolute inset-0 h-full w-full object-contain"
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

					<LightBox.Content alt={current.alt} src={currentSrc} />
				</LightBox.Root>

				{normalized.length > 1 && (
					<>
						<button
							aria-label="Previous image"
							className={cn(
								'absolute top-1/2 left-3 -translate-y-1/2',
								'rounded-full bg-card p-2 text-card-foreground shadow-sm backdrop-blur',
								'opacity-0 transition-all group-hover:opacity-100',
								'cursor-pointer hover:bg-primary hover:text-primary-foreground'
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
								'opacity-0 transition-all group-hover:opacity-100',
								'cursor-pointer hover:bg-primary hover:text-primary-foreground'
							)}
							onClick={next}
							type="button"
						>
							<Icon icon="lucide:move-right" />
						</button>

						<p
							className={`${montserrat.className} absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-card/50 px-3 py-1 font-semibold text-xs`}
						>
							{currentIndex + 1} / {normalized.length}
						</p>
					</>
				)}
			</div>

			{normalized.length > 1 && (
				<div className="flex gap-2 overflow-x-auto p-3">
					{normalized.map(({ src, alt }, index) => {
						const resolvedSrc = articleImageUrl(src)
						const isActive = index === currentIndex

						return (
							<button
								aria-label={alt || `Open image ${index + 1}`}
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
								<img
									alt={alt}
									className="h-full w-full object-cover"
									loading="lazy"
									src={resolvedSrc}
								/>
							</button>
						)
					})}
				</div>
			)}
		</div>
	)
}
