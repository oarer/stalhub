'use client'

import { motion, useReducedMotion } from 'motion/react'
import { useTranslations } from 'next-intl'
import { mtsExtended, mtsWide } from '@/app/fonts'
import { DemoCard } from './clan-analytics/components/DemoCard'
import { FeatureList } from './clan-analytics/components/FeatureList'

export default function LandingClan() {
	const t = useTranslations('landing.clan')
	const shouldReduceMotion = useReducedMotion()

	return (
		<section
			className="relative flex scroll-mt-24 flex-col items-center gap-8 overflow-hidden py-16 md:py-24"
			id="clan"
		>
			<div className="grid w-full grid-cols-1 gap-10 px-2 lg:grid-cols-[1.2fr_1.3fr] lg:gap-16">
				<div className="flex flex-col gap-4 lg:self-start">
					<motion.h2
						animate={{ y: 0, opacity: 1 }}
						className={`${mtsWide.className} font-semibold text-[40px] leading-none sm:text-5xl`}
						initial={{ y: shouldReduceMotion ? 0 : 30, opacity: 0 }}
						transition={{ duration: 0.6, delay: 0.3 }}
					>
						{t.rich('title', {
							primary: (chunks) => (
								<span className="text-primary italic">
									{chunks}
								</span>
							),
						})}
					</motion.h2>
					<motion.p
						animate={{ y: 0, opacity: 1 }}
						className={`${mtsExtended.className} font-medium text-foreground text-md`}
						initial={{ y: shouldReduceMotion ? 0 : 30, opacity: 0 }}
						transition={{ duration: 0.6, delay: 0.5 }}
					>
						{t('subtitle')}
					</motion.p>
					<FeatureList />
				</div>
				<div className="flex w-full flex-col items-center justify-start gap-4 lg:sticky lg:top-24 lg:self-start dark:text-foreground">
					<motion.div
						animate={{ y: 0, opacity: 1 }}
						className="w-full"
						initial={{ y: shouldReduceMotion ? 0 : 30, opacity: 0 }}
						transition={{ duration: 0.6, delay: 0.7 }}
					>
						<DemoCard />
					</motion.div>
				</div>
			</div>
		</section>
	)
}
