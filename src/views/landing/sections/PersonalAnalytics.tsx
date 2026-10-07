'use client'

import { Icon } from '@iconify/react'
import { motion, useReducedMotion } from 'motion/react'
import { useTranslations } from 'next-intl'
import { mtsExtended, mtsWide } from '@/app/fonts'
import { CLink } from '@/components/ui/Link'
import { PersonalDemoCard } from './personal-analytics/components/DemoCard'
import { PersonalFeatureList } from './personal-analytics/components/FeatureList'

export default function PersonalAnalytics() {
	const t = useTranslations('landing.personal')
	const shouldReduceMotion = useReducedMotion()

	return (
		<section
			className="relative flex scroll-mt-24 flex-col items-center gap-8 overflow-hidden py-16 md:py-24"
			id="personal"
		>
			<div className="grid w-full grid-cols-1 gap-10 px-2 lg:grid-cols-[1.3fr_1.2fr] lg:gap-16">
				<div className="order-2 flex w-full flex-col items-center justify-start gap-4 lg:sticky lg:top-24 lg:order-1 lg:self-start dark:text-foreground">
					<motion.div
						className="w-full"
						initial={{ y: shouldReduceMotion ? 0 : 30, opacity: 0 }}
						transition={{ duration: 0.6, delay: 0.3 }}
						viewport={{ once: true }}
						whileInView={{ y: 0, opacity: 1 }}
					>
						<PersonalDemoCard />
					</motion.div>
				</div>
				<div className="order-1 flex flex-col gap-4 lg:order-2 lg:self-start">
					<motion.h2
						className={`${mtsWide.className} font-semibold text-[40px] leading-none sm:text-5xl`}
						initial={{ y: shouldReduceMotion ? 0 : 30, opacity: 0 }}
						transition={{ duration: 0.6, delay: 0.1 }}
						viewport={{ once: true }}
						whileInView={{ y: 0, opacity: 1 }}
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
						className={`${mtsExtended.className} font-medium text-foreground text-md`}
						initial={{ y: shouldReduceMotion ? 0 : 30, opacity: 0 }}
						transition={{ duration: 0.6, delay: 0.2 }}
						viewport={{ once: true }}
						whileInView={{ y: 0, opacity: 1 }}
					>
						{t('subtitle')}
					</motion.p>
					<PersonalFeatureList />
					<motion.div
						className="flex justify-center sm:justify-end"
						initial={{ y: shouldReduceMotion ? 0 : 30, opacity: 0 }}
						transition={{ duration: 0.6, delay: 0.3 }}
						viewport={{ once: true }}
						whileInView={{ y: 0, opacity: 1 }}
					>
						<CLink
							className={`${mtsExtended.className} flex w-fit gap-2 rounded-xl font-medium`}
							href="/me/analytics"
							size="lg"
							variant="primary"
						>
							<Icon
								aria-hidden
								className="text-xl"
								icon="lucide:chart-line"
							/>
							{t('cta')}
						</CLink>
					</motion.div>
				</div>
			</div>
		</section>
	)
}
