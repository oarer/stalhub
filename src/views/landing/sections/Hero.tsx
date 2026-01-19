'use client'

import { Icon } from '@iconify/react'
import { motion } from 'motion/react'
import Image from 'next/image'
import { useTranslation } from 'react-i18next'
import { unbounded } from '@/app/fonts'
import { Badge } from '@/components/ui/Badge'
import CLink from '@/components/ui/Link'
import { featuresHero } from '@/constants/landing.const'
import { useUwuStore } from '@/stores/useUwu.store'

export default function Hero() {
	const { uwuMode } = useUwuStore()
	const { t } = useTranslation()

	return (
		<section
			className="mx-auto flex flex-col items-center justify-center gap-6 text-center xl:px-0 xl:py-42.5"
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
							className="text-xl text-cyan-400"
							icon="lucide:boxes"
						/>
						<span className="text-sm">{t('landing.overview')}</span>
					</Badge>
				)}
			</motion.div>

			<motion.h1
				animate={{ y: 0, opacity: 1 }}
				className={`${unbounded.className} text-center text-3xl font-bold tracking-tight text-balance sm:text-4xl md:text-6xl lg:text-7xl`}
				initial={{ y: 30, opacity: 0 }}
				transition={{ duration: 0.6, delay: 0.3 }}
			>
				<motion.span
					animate={{
						backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
					}}
					className="bg-linear-to-r from-sky-600 via-sky-400 to-sky-600 bg-clip-text text-transparent dark:from-sky-400 dark:via-sky-200 dark:to-sky-400"
					style={{ backgroundSize: '200% 200%' }}
					transition={{
						duration: 3,
						repeat: Number.POSITIVE_INFINITY,
						ease: 'linear',
					}}
				>
					{t('landing.tools_for')}
				</motion.span>
				<br />
				<span className="dark:text-neutral-100">StalCraft</span>
			</motion.h1>

			<motion.p
				animate={{ y: 0, opacity: 1 }}
				className="max-w-xl px-4 text-center text-xl leading-relaxed font-semibold text-nowrap md:text-2xl dark:text-white"
				initial={{ y: 30, opacity: 0 }}
				transition={{ duration: 0.6, delay: 0.4 }}
			>
				{t('landing.need')} StalCraft
			</motion.p>

			<motion.div
				animate={{ y: 0, opacity: 1 }}
				className="flex flex-wrap justify-center gap-4 px-4 sm:gap-6 md:gap-8"
				initial={{ y: 30, opacity: 0 }}
				transition={{ duration: 0.6, delay: 0.5 }}
			>
				{featuresHero.map((stat, index) => (
					<motion.div
						animate={{ opacity: 1 }}
						className="w-1/2 text-center sm:w-auto"
						initial={{ opacity: 0 }}
						key={stat.label}
						transition={{
							duration: 0.5,
							delay: 0.6 + index * 0.3,
						}}
					>
						<div
							className={`text-xl font-bold md:text-2xl ${stat.color}`}
						>
							{stat.value}
						</div>
						<div className="text-xs font-semibold sm:text-sm">
							{t(stat.label)}
						</div>
					</motion.div>
				))}
			</motion.div>

			<div className="flex flex-col items-center justify-center gap-4 sm:flex-row dark:text-neutral-100">
				<motion.div
					animate={{ y: 0, opacity: 1 }}
					initial={{ y: 30, opacity: 0 }}
					transition={{ duration: 0.6, delay: 0.7 }}
				>
					<CLink
						className="gap-2"
						href="/workspace"
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
						className="gap-2"
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
