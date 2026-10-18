'use client'

import { Icon } from '@iconify/react'
import { motion, useReducedMotion } from 'motion/react'
import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { mtsExtended, mtsWide } from '@/app/fonts'
import { cn } from '@/lib/cn'
import { SZ_REPORT_CARDS, type SzReportCard } from './sz-report/config'

const rise = (shouldReduceMotion: boolean | null, delay = 0) => ({
	initial: { opacity: 0, y: shouldReduceMotion ? 0 : 24 },
	whileInView: { opacity: 1, y: 0 },
	viewport: { once: true, amount: 0.2 },
	transition: {
		duration: 0.5,
		delay,
		ease: [0.22, 1, 0.36, 1] as const,
	},
})

function ChannelCard({
	card,
	index,
	shouldReduceMotion,
}: {
	card: SzReportCard
	index: number
	shouldReduceMotion: boolean | null
}) {
	const t = useTranslations('landing.sz_report')

	return (
		<motion.a
			className="group flex h-full w-[85vw] shrink-0 snap-start flex-col overflow-hidden rounded-xl border border-border/60 bg-card/60 transition-colors duration-300 hover:border-primary/40 sm:w-auto sm:shrink sm:snap-none"
			href={card.href}
			rel="noopener noreferrer"
			target="_blank"
			{...rise(shouldReduceMotion, index * 0.1)}
		>
			<div className="relative aspect-square w-full overflow-hidden">
				<Image
					alt=""
					className="object-cover transition-transform duration-500 group-hover:scale-105"
					fill
					sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
					src={card.image}
				/>
			</div>
			<div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
				<div className={cn('flex items-center gap-3', card.accent)}>
					<span aria-hidden="true" className="h-px w-6 bg-current" />
					<span
						className={`${mtsExtended.className} font-bold text-xs uppercase tracking-widest`}
					>
						{t(`cards.${card.id}.label`)}
					</span>
				</div>
				<h3
					className={`${mtsWide.className} font-bold text-xl sm:text-2xl`}
				>
					{t(`cards.${card.id}.title`)}
				</h3>
				<p
					className={`${mtsExtended.className} font-medium text-muted-foreground text-sm leading-relaxed`}
				>
					{t(`cards.${card.id}.desc`)}
				</p>
				<div
					className={cn(
						'mt-auto flex items-center justify-between pt-4',
						card.accent
					)}
				>
					<span
						className={`${mtsExtended.className} flex items-center gap-2 font-bold text-xs uppercase tracking-widest`}
					>
						<Icon
							aria-hidden="true"
							className="text-base"
							icon="lucide:send"
						/>
						{t('subscribe')}
					</span>
					<Icon
						aria-hidden="true"
						className="text-lg transition-transform duration-300 group-hover:translate-x-1"
						icon="lucide:arrow-right"
					/>
				</div>
			</div>
		</motion.a>
	)
}

export default function SZReport() {
	const t = useTranslations('landing.sz_report')
	const shouldReduceMotion = useReducedMotion()
	const scrollRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const el = scrollRef.current
		if (!el) return
		const mql = window.matchMedia('(max-width: 639px)')
		let paused = false
		let timer: number | null = null

		const tick = () => {
			if (!mql.matches || paused) return
			const card = el.firstElementChild as HTMLElement | null
			const step = card ? card.offsetWidth + 16 : el.clientWidth
			const max = el.scrollWidth - el.clientWidth
			if (el.scrollLeft >= max - 4) {
				el.scrollTo({ left: 0, behavior: 'smooth' })
			} else {
				el.scrollBy({ left: step, behavior: 'smooth' })
			}
		}

		const start = () => {
			if (timer) window.clearInterval(timer)
			timer = window.setInterval(tick, 3000)
		}
		start()

		const pauseFn = () => {
			paused = true
		}
		const resumeFn = () => {
			paused = false
		}
		el.addEventListener('pointerdown', pauseFn)
		el.addEventListener('touchstart', pauseFn, { passive: true })
		window.addEventListener('pointerup', resumeFn)
		window.addEventListener('touchend', resumeFn)
		mql.addEventListener('change', start)

		return () => {
			if (timer) window.clearInterval(timer)
			el.removeEventListener('pointerdown', pauseFn)
			el.removeEventListener('touchstart', pauseFn)
			window.removeEventListener('pointerup', resumeFn)
			window.removeEventListener('touchend', resumeFn)
			mql.removeEventListener('change', start)
		}
	}, [])

	return (
		<section
			className="relative flex scroll-mt-24 flex-col items-center gap-8 overflow-hidden py-16 md:py-24"
			id="szreport"
		>
			<motion.h2
				className={`${mtsWide.className} text-center font-bold text-[40px] leading-none sm:text-5xl`}
				{...rise(shouldReduceMotion)}
			>
				{t.rich('title', {
					pi: (chunks) => (
						<span className="text-primary italic">{chunks}</span>
					),
				})}
			</motion.h2>
			<div
				className="no-scrollbar flex w-full snap-x snap-mandatory gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:pb-0 xl:grid-cols-4"
				ref={scrollRef}
			>
				{SZ_REPORT_CARDS.map((card, index) => (
					<ChannelCard
						card={card}
						index={index}
						key={card.id}
						shouldReduceMotion={shouldReduceMotion}
					/>
				))}
			</div>
		</section>
	)
}
