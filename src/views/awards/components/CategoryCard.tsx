'use client'

import { Icon } from '@iconify/react'
import { motion } from 'motion/react'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import type { AwardCategory } from '../awards.data'

interface CategoryCardProps {
	active: boolean
	category: AwardCategory
	index: number
	onVote: () => void
}

export function CategoryCard({
	active,
	category,
	index,
	onVote,
}: CategoryCardProps) {
	return (
		<motion.article
			className={cn(
				'group flex flex-col overflow-hidden rounded-2xl bg-card shadow-lg ring-2 ring-primary/25 transition-all duration-300',
				active && 'shadow-primary/10 ring-primary'
			)}
			initial={{ opacity: 0, y: 24 }}
			transition={{ duration: 0.5, delay: index * 0.08 }}
			viewport={{ once: true, amount: 0.2 }}
			whileInView={{ opacity: 1, y: 0 }}
		>
			<div className="relative aspect-[16/10] overflow-hidden bg-muted">
				<Image
					alt={category.title}
					className="object-cover transition-transform duration-700 group-hover:scale-105"
					fill
					sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
					src={category.image}
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
				<span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-background/80 px-3 py-1 font-medium text-xs backdrop-blur">
					<Icon
						className="text-primary text-sm"
						icon={
							category.kind === 'updates'
								? 'lucide:package-open'
								: 'lucide:sparkles'
						}
					/>
					{category.kind === 'updates' ? 'Обновления' : 'Номинации'}
				</span>
				{active && (
					<span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 font-semibold text-primary-foreground text-xs">
						<Icon className="text-sm" icon="lucide:check" />
						Выбрано
					</span>
				)}
			</div>

			<div className="flex flex-1 flex-col gap-4 p-5">
				<div className="flex flex-col gap-1.5">
					<h3 className="font-semibold text-xl tracking-tight">
						{category.title}
					</h3>
					<p className="text-muted-foreground text-sm">
						{category.description}
					</p>
				</div>

				<div className="mt-auto flex items-center justify-between gap-3 border-border/50 border-t pt-4">
					<span className="font-medium text-muted-foreground text-xs">
						{category.kind === 'updates'
							? `Обновлений: ${category.candidates.length}`
							: `Кандидатов: ${category.candidates.length}`}
					</span>
					<Button
						aria-pressed={active}
						className="gap-2"
						onClick={onVote}
						size="sm"
						variant={active ? 'primary' : 'bordered'}
					>
						<Icon className="text-base" icon="lucide:vote" />
						Голосовать
					</Button>
				</div>
			</div>
		</motion.article>
	)
}
