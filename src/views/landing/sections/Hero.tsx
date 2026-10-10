'use client'

import { Icon } from '@iconify/react'
import { motion } from 'motion/react'
import { useTranslations } from 'next-intl'
import { mtsExtended, mtsWide } from '@/app/fonts'
import { CLink } from '@/components/ui/Link'
import SwapText from '@/components/ui/SwapText'
import { featuresHero } from '@/constants/landing.const'
import LogoDrawAnimation from './components/LogoDraw'

export default function Hero() {
	const t = useTranslations()
	const swapTexts = [
		t('landing.swap.tools'),
		t('landing.swap.calcs'),
		t('landing.swap.analytics'),
	]

	return (
		<section
			className="relative min-h-screen scroll-mt-24 overflow-hidden py-16 md:py-24"
			id="hero"
		>
			<div className="mx-auto grid w-full items-center gap-10 lg:grid-cols-[1.15fr_0.95fr] lg:gap-12">
				<div className="flex min-w-0 flex-col items-center gap-4 text-center lg:items-start lg:text-left">
					<div className="flex flex-col gap-2">
						<motion.h1
							animate={{ y: 0, opacity: 1 }}
							className={`${mtsWide.className} flex w-full min-w-0 flex-col items-center gap-1 text-balance font-bold text-4xl leading-[1.1] tracking-tight sm:text-5xl lg:items-start xl:text-6xl`}
							initial={{ y: 24, opacity: 0 }}
							transition={{ duration: 0.5 }}
						>
							<span className="sr-only">
								StalHub — калькуляторы, сборки и гайды для
								StalZone (Stalcraft):{' '}
							</span>
							<span aria-hidden>
								<SwapText
									className="text-primary"
									texts={swapTexts}
								/>
							</span>
						</motion.h1>
						<motion.h2
							animate={{ y: 0, opacity: 1 }}
							className={`${mtsWide.className} flex w-full min-w-0 flex-col items-center gap-1 text-balance font-bold text-[19px] tracking-tight lg:items-start lg:text-[25px] xl:text-3xl`}
							initial={{ y: 24, opacity: 0 }}
							transition={{ duration: 0.5, delay: 0.08 }}
						>
							{t('landing.sub_title')}
						</motion.h2>
					</div>
					<motion.p
						animate={{ y: 0, opacity: 1 }}
						className={`${mtsExtended.className} w-full max-w-xl font-medium text-sm leading-relaxed dark:text-white/80`}
						initial={{ y: 24, opacity: 0 }}
						transition={{ duration: 0.5, delay: 0.15 }}
					>
						{t('landing.need')}
					</motion.p>

					<motion.div
						animate={{ y: 0, opacity: 1 }}
						className="grid w-full max-w-lg grid-cols-2 gap-y-5 sm:max-w-none sm:grid-cols-4"
						initial={{ y: 24, opacity: 0 }}
						transition={{ duration: 0.5, delay: 0.25 }}
					>
						{featuresHero.map((stat) => (
							<div
								className="min-w-0 text-center lg:text-left"
								key={stat.label}
							>
								<p
									className={`${mtsWide.className} truncate font-bold text-2xl text-primary tabular-nums tracking-tight`}
								>
									{stat.value}
								</p>
								<p
									className={`${mtsExtended.className} mt-1 font-medium text-xs sm:text-sm`}
								>
									{t(stat.label)}
								</p>
							</div>
						))}
					</motion.div>

					<motion.div
						animate={{ y: 0, opacity: 1 }}
						className="flex w-full justify-center lg:justify-start"
						initial={{ y: 24, opacity: 0 }}
						transition={{ duration: 0.5, delay: 0.35 }}
					>
						<CLink
							className={`${mtsExtended.className} w-full justify-center gap-2 rounded-xl font-medium sm:w-auto`}
							href="/calcs"
							size="lg"
							variant="primary"
						>
							<Icon
								aria-hidden
								className="text-xl"
								icon="lucide:rocket"
							/>
							{t('landing.start')}
						</CLink>
					</motion.div>
				</div>

				<motion.div
					animate={{ opacity: 1, scale: 1 }}
					className="mx-auto flex w-full max-w-xs shrink-0 justify-center sm:max-w-sm lg:mx-0 lg:max-w-none lg:justify-end"
					initial={{ opacity: 0, scale: 0.92 }}
					transition={{ duration: 0.6, delay: 0.2 }}
				>
					<LogoDrawAnimation />
				</motion.div>
			</div>
		</section>
	)
}
