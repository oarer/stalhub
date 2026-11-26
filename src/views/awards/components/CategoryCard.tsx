'use client'

import { Icon } from '@iconify/react'
import { motion } from 'motion/react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { resolveImageUrl } from '@/lib/imageUrl'
import type { AwardCategory } from '@/types/awards.type'

interface CategoryCardProps {
	active: boolean
	category: AwardCategory
	className?: string
	onCardClick: () => void
	onVote: () => void
	variant?: 'featured' | 'compact'
}

const kindIcon: Record<AwardCategory['kind'], string> = {
	nominees: 'lucide:sparkles',
	updates: 'lucide:package-open',
	clan: 'lucide:users',
	player: 'lucide:medal',
}

export function CategoryCard({
	active,
	category,
	className,
	onCardClick,
	onVote,
	variant = 'featured',
}: CategoryCardProps) {
	const t = useTranslations('awards')
	const compact = variant === 'compact'
	const image = resolveImageUrl(
		category.image_url ?? category.nominees[0]?.avatar_url
	)

	return (
		<motion.article
			animate={{ opacity: 1 }}
			className={cn('flex cursor-pointer flex-col gap-2.5', className)}
			initial={{ opacity: 0 }}
			onClick={onCardClick}
			transition={{ duration: 0.35 }}
		>
			<div className="bg-muted relative aspect-square overflow-hidden rounded-xl transition-shadow duration-300">
				{image ? (
					<Image
						alt={category.title}
						className="object-cover transition-transform duration-700"
						fill
						sizes={
							compact
								? '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw'
								: '(max-width: 768px) 100vw, 33vw'
						}
						src={image}
					/>
				) : (
					<div className="from-primary/25 via-card to-primary/10 flex h-full items-center justify-center bg-linear-to-br">
						<Icon
							className={cn(
								'text-primary/70',
								compact ? 'text-4xl' : 'text-5xl'
							)}
							icon={kindIcon[category.kind]}
						/>
					</div>
				)}
			</div>

			<h3
				className={cn(
					'line-clamp-2 text-center text-lg font-semibold tracking-tight sm:text-xl'
				)}
			>
				{category.title}
			</h3>

			<Button
				aria-pressed={active}
				className="w-full gap-2"
				onClick={(event) => {
					event.stopPropagation()
					onVote()
				}}
				size="sm"
				variant={active ? 'primary' : 'secondary'}
			>
				{active ? (
					<>
						<Icon className="text-sm" icon="lucide:check" />
						{t('selected')}
					</>
				) : (
					t('select')
				)}
			</Button>
		</motion.article>
	)
}
