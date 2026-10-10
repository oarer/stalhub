'use client'

import { Icon } from '@iconify/react'
import { motion, useReducedMotion } from 'motion/react'
import { useTranslations } from 'next-intl'
import { mtsExtended, mtsWide } from '@/app/fonts'
import { CLink } from '@/components/ui/Link'
import FloatingIcons from './FloatingIcons'

export default function LandingFooter() {
	const t = useTranslations()
	const shouldReduceMotion = useReducedMotion()

	return (
		<section
			className="flex min-h-screen flex-col items-center justify-center gap-6 text-center"
			id="contribute"
		>
			<div className="relative flex flex-col items-center gap-6 text-center">
				<FloatingIcons />
				<motion.h1
					animate={{ y: 0, opacity: 1 }}
					className={`${mtsWide.className} max-w-300 pt-10 font-semibold text-[40px] leading-none sm:text-5xl md:pt-12 md:text-6xl`}
					initial={{ y: shouldReduceMotion ? 0 : 30, opacity: 0 }}
					transition={{ duration: 0.6, delay: 0.3 }}
				>
					{t.rich('landing.footer.title', {
						primary: (chunks) => (
							<span className="text-primary italic">
								{chunks}
							</span>
						),
					})}
				</motion.h1>
				<motion.p
					animate={{ y: 0, opacity: 1 }}
					className={`${mtsExtended.className} max-w-lg font-medium text-foreground text-lg`}
					initial={{ y: shouldReduceMotion ? 0 : 30, opacity: 0 }}
					transition={{ duration: 0.6, delay: 0.5 }}
				>
					{t('landing.footer.subtitle')}
				</motion.p>
				<div className="flex flex-col items-center justify-center gap-4 sm:flex-row dark:text-foreground">
					<motion.div
						animate={{ y: 0, opacity: 1 }}
						initial={{ y: shouldReduceMotion ? 0 : 30, opacity: 0 }}
						transition={{ duration: 0.6, delay: 0.7 }}
					>
						<CLink
							className={`${mtsExtended.className} gap-2 px-12 py-2`}
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
							className={`${mtsExtended.className} gap-2 px-12 py-2`}
							external
							href="https://github.com/oarer/stalhub"
							size="lg"
							variant="secondary"
						>
							<Icon className="text-xl" icon="lucide:github" />
							{t('landing.footer.github')}
						</CLink>
					</motion.div>
				</div>
			</div>
		</section>
	)
}
