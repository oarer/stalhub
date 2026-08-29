'use client'

import { motion } from 'motion/react'
import { useTranslations } from 'next-intl'
import { montserrat } from '@/app/fonts'
import { featuresHero } from '@/constants/landing.const'

export default function HeroFeatures() {
	const t = useTranslations()

	return (
		<motion.section
			animate={{ y: 0, opacity: 1 }}
			className="relative grid grid-cols-1 overflow-hidden rounded-2xl border-2 border-primary/40 sm:grid-cols-2 lg:grid-cols-6"
			initial={{ y: 30, opacity: 0 }}
			transition={{ duration: 0.6, delay: 0.8 }}
		>
			{featuresHero.map((stat, index) => (
				<motion.div
					animate={{ opacity: 1, y: 0 }}
					className="flex w-full flex-col gap-0 bg-muted px-6 py-5 ring ring-primary/40"
					initial={{ opacity: 0, y: 16 }}
					key={stat.label}
					transition={{
						duration: 0.5,
						delay: 0.3 + index * 0.3,
					}}
				>
					<div
						className={`${montserrat.className} font-bold text-xl md:text-4xl`}
					>
						{stat.value}
					</div>
					<div className="font-semibold text-lg text-muted-foreground lowercase">
						{t(stat.label)}
					</div>
				</motion.div>
			))}
		</motion.section>
	)
}
