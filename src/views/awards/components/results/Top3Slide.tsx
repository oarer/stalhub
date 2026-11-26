'use client'

import { motion } from 'motion/react'
import { useTranslations } from 'next-intl'
import { mtsExtended } from '@/app/fonts'
import type { AwardResultsCategory } from '@/types/awards.type'
import type { RankedNominee } from '../../utils/award-results'
import { nomineeName } from '../../utils/results-presentation'
import { Avatar } from './Avatar'
import { ConfettiBurst } from './ConfettiBurst'

export function Top3Slide({
	category,
	nominees,
}: {
	category: AwardResultsCategory
	nominees: RankedNominee[]
}) {
	const t = useTranslations('awards')

	return (
		<div className="relative mx-auto flex w-full max-w-5xl flex-col gap-18">
			<ConfettiBurst seed={`top3-${category.id}`} />
			<div className="flex flex-col gap-2 text-center">
				<motion.span
					animate={{ opacity: 1, y: 0 }}
					className="text-primary text-xs font-semibold tracking-[0.24em] uppercase"
					initial={{ opacity: 0, y: -12 }}
					transition={{ duration: 0.35 }}
				>
					{category.title}
				</motion.span>
				<motion.h2
					animate={{ opacity: 1, scale: 1 }}
					className={`${mtsExtended.className} z-2 text-3xl font-semibold tracking-tight sm:text-4xl`}
					initial={{ opacity: 0, scale: 0.9 }}
					transition={{
						damping: 14,
						stiffness: 180,
						type: 'spring',
					}}
				>
					{t('results.topThree')}
				</motion.h2>
			</div>

			<div className="grid gap-4 sm:grid-cols-3">
				{nominees.map((nominee, index) => (
					<motion.div
						animate={{
							opacity: 1,
							rotate: 0,
							scale: 1,
							y: 0,
						}}
						className="flex flex-col items-center gap-3 text-center"
						initial={{
							opacity: 0,
							rotate: index % 2 === 0 ? -4 : 4,
							scale: 0.75,
							y: 40,
						}}
						key={nominee.id}
						transition={{
							damping: 14,
							delay: 0.15 + index * 0.12,
							stiffness: 170,
							type: 'spring',
						}}
					>
						<Avatar category={category} nominee={nominee} />
						<p className="z-2 text-lg font-semibold text-balance">
							{nomineeName(nominee)}
						</p>
					</motion.div>
				))}
			</div>
		</div>
	)
}
