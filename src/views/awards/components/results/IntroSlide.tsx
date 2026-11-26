'use client'

import { Icon } from '@iconify/react'
import { motion } from 'motion/react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { mtsExtended } from '@/app/fonts'
import { resolveImageUrl } from '@/lib/imageUrl'
import type { AwardResultsCategory } from '@/types/awards.type'

export function IntroSlide({ category }: { category: AwardResultsCategory }) {
	const t = useTranslations('awards')
	const image = resolveImageUrl(
		category.image_url ?? category.nominees[0]?.avatar_url
	)

	return (
		<div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 text-center">
			<motion.div
				animate={{ opacity: 1, rotate: 0, scale: 1 }}
				className="bg-muted ring-primary/40 relative flex size-32 items-center justify-center overflow-hidden rounded-3xl ring-2 sm:size-40"
				initial={{ opacity: 0, rotate: -8, scale: 0.7 }}
				transition={{
					damping: 16,
					stiffness: 180,
					type: 'spring',
				}}
			>
				{image ? (
					<Image
						alt=""
						className="object-cover"
						fill
						sizes="160px"
						src={image}
					/>
				) : (
					<Icon
						className="text-primary text-5xl"
						icon="lucide:trophy"
					/>
				)}
			</motion.div>
			<motion.div
				animate={{ opacity: 1, y: 0 }}
				className="flex flex-col gap-2"
				initial={{ opacity: 0, y: 20 }}
				transition={{ delay: 0.15, duration: 0.4 }}
			>
				<span className="text-primary text-xs font-semibold tracking-[0.24em] uppercase">
					{t('results.ceremony')}
				</span>
				<h2
					className={`${mtsExtended.className} text-3xl font-semibold tracking-tight sm:text-4xl`}
				>
					{category.title}
				</h2>
				{category.description &&
					category.description !== category.title && (
						<p className="text-muted-foreground text-balance">
							{category.description}
						</p>
					)}
			</motion.div>
		</div>
	)
}
