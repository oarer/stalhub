'use client'

import { motion, useReducedMotion } from 'motion/react'
import { useTranslations } from 'next-intl'
import { unbounded } from '@/app/fonts'
import { type RoadmapItem, RoadmapItems } from '@/constants/roadmap.const'
import { cn } from '@/lib/cn'

const rise = (shouldReduceMotion: boolean | null) => ({
	initial: { opacity: 0, y: shouldReduceMotion ? 0 : 24 },
	whileInView: { opacity: 1, y: 0 },
	viewport: { once: true, amount: 0.4 },
	transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
})

function RoadmapContent({
	item,
	align,
}: {
	item: RoadmapItem
	align: 'left' | 'right'
}) {
	const t = useTranslations()
	const shouldReduceMotion = useReducedMotion()

	return (
		<motion.div
			className={cn(
				'flex flex-col gap-2',
				align === 'right' ? 'text-right' : 'text-left'
			)}
			{...rise(shouldReduceMotion)}
		>
			<time
				className={cn(
					'font-bold text-xs',
					item.status === 'planned'
						? 'text-neutral-200'
						: 'text-foreground'
				)}
				dateTime={item.date}
			>
				{item.date}
			</time>

			<h3
				className={cn(
					unbounded.className,
					'font-bold text-[16px] uppercase tracking-widest dark:text-white'
				)}
			>
				{t(item.title)}
			</h3>

			{item.description && (
				<p className="font-semibold text-[13px] text-text-accent leading-relaxed">
					{t(item.description)}
				</p>
			)}
		</motion.div>
	)
}

function TimelineDot({ status }: { status: RoadmapItem['status'] }) {
	const shouldReduceMotion = useReducedMotion()

	return (
		<motion.span
			className={cn(
				'z-10 size-4 rounded-full border-2 border-primary bg-card',
				status === 'in-progress' &&
					'border-primary bg-primary shadow-[0_0_16px_4px_var(--primary)]'
			)}
			initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0 }}
			transition={{
				duration: 0.4,
				type: 'spring',
				stiffness: 300,
				damping: 20,
			}}
			viewport={{ once: true, amount: 'some' }}
			whileInView={{ opacity: 1, scale: 1 }}
		/>
	)
}

export default function Roadmap() {
	return (
		<div className="mx-auto max-w-220 px-4 py-12 md:px-6 md:py-20">
			<ol className="relative space-y-2">
				<span
					aria-hidden="true"
					className="absolute top-0 bottom-0 left-1.75 w-px bg-primary/60 md:hidden"
				/>

				<span
					aria-hidden="true"
					className="absolute top-0 bottom-0 left-1/2 hidden w-px -translate-x-1/2 bg-primary/60 md:block"
				/>

				{RoadmapItems.map((item, i) => {
					const isLeft = i % 2 === 0

					return (
						<li className="relative min-h-30" key={item.date}>
							<div className="flex gap-4 md:hidden">
								<div className="relative flex w-4 shrink-0 justify-center">
									<TimelineDot status={item.status} />
								</div>

								<div className="flex-1 pb-8">
									<RoadmapContent align="left" item={item} />
								</div>
							</div>

							<div className="hidden md:grid md:grid-cols-[1fr_3rem_1fr] md:items-center">
								<div className="px-6 pr-4">
									{isLeft && (
										<RoadmapContent
											align="right"
											item={item}
										/>
									)}
								</div>

								<div className="flex justify-center">
									<TimelineDot status={item.status} />
								</div>

								<div className="px-6 pl-4">
									{!isLeft && (
										<RoadmapContent
											align="left"
											item={item}
										/>
									)}
								</div>
							</div>
						</li>
					)
				})}
			</ol>
		</div>
	)
}
