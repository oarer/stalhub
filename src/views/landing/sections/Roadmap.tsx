'use client'

import { motion, useReducedMotion } from 'motion/react'
import { useTranslations } from 'next-intl'
import { mtsExtended, mtsWide } from '@/app/fonts'
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
					mtsExtended.className,
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
					mtsExtended.className,
					'font-bold text-[16px] uppercase tracking-widest dark:text-white'
				)}
			>
				{t(item.title)}
			</h3>

			{item.description && (
				<p
					className={`${mtsExtended.className} w-full max-w-xl font-medium text-muted-foreground text-xs`}
				>
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
					'border-primary bg-primary shadow-[0_0_16px_4px_var(--primary)]',
				status === 'done' && 'border-primary/40 bg-muted'
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
	const t = useTranslations('landing.roadmap')
	const shouldReduceMotion = useReducedMotion()

	return (
		<section
			className="relative flex scroll-mt-24 flex-col py-16 md:py-24"
			id="roadmap"
		>
			<motion.div
				className="mb-10 flex flex-col gap-4 text-center"
				initial={{ y: shouldReduceMotion ? 0 : 24, opacity: 0 }}
				transition={{ duration: 0.5 }}
				viewport={{ once: true }}
				whileInView={{ y: 0, opacity: 1 }}
			>
				<h2
					className={`${mtsWide.className} font-semibold text-[40px] leading-none sm:text-5xl`}
				>
					{t.rich('title', {
						primary: (chunks) => (
							<span className="text-primary italic">
								{chunks}
							</span>
						),
					})}
				</h2>
				<p
					className={`${mtsExtended.className} mx-auto max-w-md font-medium text-foreground text-md`}
				>
					{t('description')}
				</p>
			</motion.div>
			<div className="mx-auto w-full max-w-220 px-4 md:px-6">
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
										<RoadmapContent
											align="left"
											item={item}
										/>
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
		</section>
	)
}
