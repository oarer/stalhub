'use client'

import { Icon } from '@iconify/react'
import { motion, useReducedMotion } from 'motion/react'
import { useTranslations } from 'next-intl'
import { mtsExtended } from '@/app/fonts'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/cn'
import { useFlow } from '../../clan-analytics/hooks/useFlow'
import { PERSONAL_DEMO_STATS } from '../config'
import { MiniChart } from './MiniChart'
import { PersonalPipelineStages } from './PipelineStages'

const rise = {
	initial: { opacity: 0, y: 16 },
	whileInView: { opacity: 1, y: 0 },
	viewport: { once: true },
}

export function PersonalDemoCard() {
	const t = useTranslations('landing.personal')
	const shouldReduceMotion = useReducedMotion()
	const frozen = shouldReduceMotion ?? false
	const flow = useFlow(frozen)

	return (
		<Card.Root className="gap-4">
			<PersonalPipelineStages
				flow={flow}
				frozen={frozen}
				reducedMotion={frozen}
			/>

			<motion.div
				className="flex items-center gap-3 rounded-xl bg-accent/50 px-4 py-3"
				{...rise}
				transition={{ duration: 0.5, delay: 0.1 }}
			>
				<span className="flex size-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
					<Icon className="text-xl" icon="lucide:user-round" />
				</span>
				<div className="min-w-0 flex-1">
					<p
						className={`${mtsExtended.className} truncate font-bold text-[15px]`}
					>
						Pink_Poffinz
					</p>
					<p className="truncate text-muted-foreground text-xs">
						RU · {t('demo.snapshots', { n: 42 })}
					</p>
				</div>
				{frozen ? (
					<span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 font-semibold text-primary text-xs">
						<Icon className="text-sm" icon="lucide:trending-up" />
						{t('demo.growth')}
					</span>
				) : (
					<motion.span
						className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 font-semibold text-primary text-xs"
						transition={{
							duration: 2.4,
							repeat: Infinity,
							ease: 'easeInOut',
						}}
					>
						<Icon className="text-sm" icon="lucide:trending-up" />
						{t('demo.growth')}
					</motion.span>
				)}
			</motion.div>

			<div className="grid grid-cols-2 gap-2.5">
				{PERSONAL_DEMO_STATS.map((stat, i) => (
					<motion.div
						className="rounded-xl bg-card px-3.5 py-3 ring-2 ring-primary/30"
						key={stat.id}
						{...rise}
						transition={{ duration: 0.45, delay: 0.15 + i * 0.1 }}
					>
						<p className="text-muted-foreground text-xs">
							{t(`demo.stats.${stat.id}`)}
						</p>
						<p className="truncate font-semibold text-xl tabular-nums">
							{stat.value}
						</p>
						<p
							className={cn(
								'text-xs tabular-nums',
								stat.positive
									? 'text-primary'
									: 'text-destructive'
							)}
						>
							{stat.delta} · {t('demo.forPeriod')}
						</p>
					</motion.div>
				))}
			</div>

			<motion.div
				className="overflow-hidden rounded-xl border border-muted bg-card"
				{...rise}
				transition={{ duration: 0.5, delay: 0.5 }}
			>
				<div className="flex items-center justify-between px-4 pt-3 pb-1">
					<p className="font-mono font-semibold text-[13px]">
						{t('demo.chartTitle')}
					</p>
					<span className="font-semibold text-primary text-xs tabular-nums">
						+0.28 · {t('demo.forPeriod')}
					</span>
				</div>
				<div className="px-2 pb-2">
					<MiniChart />
				</div>
			</motion.div>
		</Card.Root>
	)
}
