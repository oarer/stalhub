'use client'

import { Icon } from '@iconify/react'
import { AnimatePresence, motion } from 'motion/react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { cn } from '@/lib/cn'
import type { AwardResults } from '@/types/awards.type'
import { useResultsPresentation } from '../hooks/useResultsPresentation'
import { ResultsCategorySelect } from './results/ResultsCategorySelect'
import { ResultsSlide } from './results/ResultsSlide'

export default function ResultsPresentation({
	open,
	onOpenChange,
	results,
	initialSlug,
	pageTitle,
	mode = 'modal',
}: {
	open: boolean
	onOpenChange: (open: boolean) => void
	results: AwardResults
	initialSlug?: string
	pageTitle?: string
	mode?: 'modal' | 'page'
}) {
	const t = useTranslations('awards')
	const {
		isLast,
		next,
		previous,
		slide,
		slideIndex,
		slides,
		startCategory,
		startOverall,
		started,
	} = useResultsPresentation({
		initialSlug,
		mode,
		onOpenChange,
		open,
		results,
	})

	const content = (
		<div
			className={cn(
				'flex flex-col gap-4',
				mode === 'page' ? 'min-h-dvh flex-1 p-4 sm:p-6' : 'h-full pt-14'
			)}
		>
			<div
				className={cn(
					'flex items-center justify-between gap-4',
					mode === 'modal' && 'pr-12'
				)}
			>
				<div className="flex min-w-0 items-center gap-2">
					{mode === 'page' && (
						<Button
							className="gap-2"
							onClick={() => onOpenChange(false)}
							size="sm"
							variant="ghost"
						>
							<Icon icon="lucide:arrow-left" />
							{t('results.back')}
						</Button>
					)}
					<span className="text-muted-foreground truncate text-xs font-semibold tracking-[0.2em] uppercase">
						{pageTitle ?? t('results.ceremony')}
					</span>
				</div>
				<div className="flex items-center gap-3">
					{started && (
						<span className="text-muted-foreground text-xs">
							{t('results.progress', {
								current: slideIndex + 1,
								total: slides.length,
							})}
						</span>
					)}
				</div>
			</div>

			<div className="min-h-0 flex-1 overflow-y-auto pb-2">
				<AnimatePresence initial={false} mode="wait">
					<motion.div
						animate={{ opacity: 1, scale: 1, y: 0 }}
						className="flex min-h-full items-center justify-center py-4"
						exit={{ opacity: 0, scale: 0.98, y: -16 }}
						initial={{ opacity: 0, scale: 0.97, y: 20 }}
						key={started ? `slide-${slideIndex}` : 'select'}
						transition={{
							duration: 0.35,
							ease: [0.22, 1, 0.36, 1],
						}}
					>
						{started && slide ? (
							<ResultsSlide
								categories={results.categories}
								slide={slide}
							/>
						) : (
							<ResultsCategorySelect
								categories={results.categories}
								onStartCategory={startCategory}
								onStartOverall={startOverall}
							/>
						)}
					</motion.div>
				</AnimatePresence>
			</div>

			{started && (
				<div className="border-border/60 flex items-center justify-between gap-3 border-t pt-3">
					<Button
						className="gap-2"
						onClick={previous}
						variant="ghost"
					>
						<Icon icon="lucide:arrow-left" />
						{t('results.back')}
					</Button>
					<Button className="gap-2" onClick={next}>
						{isLast ? t('results.finish') : t('results.next')}
						<Icon
							icon={
								isLast ? 'lucide:check' : 'lucide:arrow-right'
							}
						/>
					</Button>
				</div>
			)}
		</div>
	)

	if (mode === 'page') {
		return (
			<div className="relative flex min-h-dvh flex-col">
				<div className="bg-primary/15 pointer-events-none absolute inset-x-0 top-0 mx-auto h-96 max-w-4xl rounded-full blur-[140px]" />
				<div className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col">
					{content}
				</div>
			</div>
		)
	}

	return (
		<Modal.Root onOpenChange={onOpenChange} open={open}>
			<Modal.Content className="overflow-hidden" fullScreen>
				{content}
			</Modal.Content>
		</Modal.Root>
	)
}
