'use client'

import { Icon } from '@iconify/react'
import { motion } from 'motion/react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { montserrat, unbounded } from '@/app/fonts'
import { Badge } from '@/components/ui/Badge'
import GradientText from '@/components/ui/GradientText'
import { CLink } from '@/components/ui/Link'
import { featuresHero } from '@/constants/landing.const'
import { useUwuStore } from '@/stores/useUwu.store'

export default function Hero() {
	const { uwuMode } = useUwuStore()
	const t = useTranslations()

	return (
		<section
			className="mx-auto flex min-h-screen flex-col items-center gap-6 text-center xl:px-0"
			id="hero"
		>
			<motion.div
				animate={{ y: 0, opacity: 1 }}
				initial={{ y: 30, opacity: 0 }}
				transition={{ duration: 0.6, delay: 0.2 }}
			>
				{uwuMode ? (
					<Image
						alt="uwu"
						height={380}
						quality={100}
						src={'/stalhub_uwu.png'}
						width={750}
					/>
				) : (
					<Badge variant="secondary">
						<Icon
							className="text-primary text-xl"
							icon="lucide:boxes"
						/>
						<span className="text-xs md:text-sm">
							{t('landing.overview')}
						</span>
					</Badge>
				)}
			</motion.div>

			<motion.h1
				animate={{ y: 0, opacity: 1 }}
				className={`${unbounded.className} font-bold text-3xl tracking-tight sm:text-4xl md:text-6xl lg:text-8xl`}
				initial={{ y: 30, opacity: 0 }}
				transition={{ duration: 0.6, delay: 0.3 }}
			>
				<GradientText
					className="py-0"
					colors={['var(--primary)', '#afc7d4']}
					yoyo={false}
				>
					{t('landing.tools_for')}
				</GradientText>
				<span className="dark:text-foreground">StalZone</span>
			</motion.h1>

			<motion.p
				animate={{ y: 0, opacity: 1 }}
				className="max-w-xl px-4 text-center font-semibold text-xl leading-relaxed md:text-3xl dark:text-white"
				initial={{ y: 30, opacity: 0 }}
				transition={{ duration: 0.6, delay: 0.4 }}
			>
				{t('landing.need')} StalZone
			</motion.p>

			<motion.div
				animate={{ y: 0, opacity: 1 }}
				className="grid grid-cols-2 items-center justify-center gap-4 px-4 sm:grid-cols-4 sm:gap-6 md:gap-8"
				initial={{ y: 30, opacity: 0 }}
				transition={{ duration: 0.6, delay: 0.5 }}
			>
				{featuresHero.map((stat, index) => (
					<motion.div
						animate={{ opacity: 1 }}
						className="text-center"
						initial={{ opacity: 0 }}
						key={stat.label}
						transition={{
							duration: 0.5,
							delay: 0.6 + index * 0.3,
						}}
					>
						<p
							className={`${montserrat.className} font-bold text-primary text-xl md:text-2xl`}
						>
							{stat.value}
						</p>
						<p className="font-semibold text-foreground text-xs sm:text-sm">
							{t(stat.label)}
						</p>
					</motion.div>
				))}
			</motion.div>

			<div className="flex flex-col items-center justify-center gap-4 sm:flex-row dark:text-foreground">
				<motion.div
					animate={{ y: 0, opacity: 1 }}
					initial={{ y: 30, opacity: 0 }}
					transition={{ duration: 0.6, delay: 0.7 }}
				>
					<CLink
						className="gap-2 rounded-xl"
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
					initial={{ y: 30, opacity: 0 }}
					transition={{ duration: 0.6, delay: 0.95 }}
				>
					<CLink
						className="gap-2 rounded-xl"
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
