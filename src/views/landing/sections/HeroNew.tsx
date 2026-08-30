'use client'

import { Icon } from '@iconify/react'
import { motion, useReducedMotion } from 'motion/react'
import { useTranslations } from 'next-intl'
import { unbounded } from '@/app/fonts'
import { CLink } from '@/components/ui/Link'

export default function HeroNew() {
	const t = useTranslations()
	const shouldReduceMotion = useReducedMotion()

	return (
		<section
			className="relative flex min-h-120 flex-col items-center justify-between overflow-hidden px-4 py-8 text-center xl:min-h-140"
			id="hero"
		>
			<motion.h1
				animate={{ y: 0, opacity: 1 }}
				className={`${unbounded.className} max-w-300 font-semibold text-[44px] leading-none sm:text-5xl md:text-6xl lg:text-8xl`}
				initial={{ y: shouldReduceMotion ? 0 : 30, opacity: 0 }}
				transition={{ duration: 0.6, delay: 0.3 }}
			>
				{t.rich('landing.hero.title', {
				brand: () => (
					<span className="text-primary">
						{t('landing.hero.title_accent')}
					</span>
				),
			})}
			</motion.h1>
			<motion.p
				animate={{ y: 0, opacity: 1 }}
				className="max-w-65 font-bold text-xl lg:max-w-3xl lg:text-2xl xl:text-3xl"
				initial={{ y: shouldReduceMotion ? 0 : 30, opacity: 0 }}
				transition={{ duration: 0.6, delay: 0.5 }}
			>
				{t('landing.hero.subtitle')}
			</motion.p>
			<div className="flex flex-col items-center justify-center gap-4 sm:flex-row dark:text-foreground">
				<motion.div
					animate={{ y: 0, opacity: 1 }}
					initial={{ y: shouldReduceMotion ? 0 : 30, opacity: 0 }}
					transition={{ duration: 0.6, delay: 0.7 }}
				>
					<CLink
						className="gap-2 px-8"
						href="/calcs"
						size="lg"
						variant="primary"
					>
						<Icon className="text-xl" icon="lucide:rocket" />
						{t('landing.start')}
					</CLink>
				</motion.div>

				<motion.div
					animate={{ y: 0, opacity: 1 }}
					className="hidden sm:block"
					initial={{ y: shouldReduceMotion ? 0 : 30, opacity: 0 }}
					transition={{ duration: 0.6, delay: 0.95 }}
				>
					<CLink
						className="gap-2 px-8"
						href="#tools"
						size="lg"
						variant="secondary"
					>
						{t('landing.more_details')}
						<Icon className="text-xl" icon="lucide:chevron-right" />
					</CLink>
				</motion.div>
			</div>
		</section>
	)
}
