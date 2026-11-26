'use client'

import { Icon } from '@iconify/react'
import { motion, useReducedMotion } from 'motion/react'
import { useTranslations } from 'next-intl'
import { mtsExtended } from '@/app/fonts'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/cn'
import { useFlow } from '../../clan-analytics/hooks/useFlow'
import { PipelineStages } from '../../shared/PipelineStages'
import { PERSONAL_DEMO_STATS, PERSONAL_STAGES } from '../config'
import { MiniChart } from './MiniChart'

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
			<PipelineStages
				flow={flow}
				frozen={frozen}
				namespace="landing.personal"
				reducedMotion={frozen}
				stages={PERSONAL_STAGES}
			/>

			<motion.div
				className="bg-accent/50 flex items-center gap-3 rounded-xl px-4 py-3"
				{...rise}
				transition={{ duration: 0.5, delay: 0.1 }}
			>
				<span className="bg-primary/15 text-primary flex size-10 items-center justify-center rounded-lg">
					<Icon className="text-xl" icon="lucide:user-round" />
				</span>
				<div className="min-w-0 flex-1">
					<p
						className={`${mtsExtended.className} truncate text-[15px] font-bold`}
					>
						Pink_Poffinz
					</p>
					<p className="text-muted-foreground truncate text-xs">
						RU · {t('demo.snapshots', { n: 42 })}
					</p>
				</div>
				{frozen ? (
					<span className="bg-primary/10 text-primary flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold">
						<Icon className="text-sm" icon="lucide:trending-up" />
						{t('demo.growth')}
					</span>
				) : (
					<motion.span
						className="bg-primary/10 text-primary flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
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
						className="bg-card ring-primary/30 rounded-xl px-3.5 py-3 ring-2"
						key={stat.id}
						{...rise}
						transition={{ duration: 0.45, delay: 0.15 + i * 0.1 }}
					>
						<p className="text-muted-foreground text-xs">
							{t(`demo.stats.${stat.id}`)}
						</p>
						<p className="truncate text-xl font-semibold tabular-nums">
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
				className="border-muted bg-card overflow-hidden rounded-xl border"
				{...rise}
				transition={{ duration: 0.5, delay: 0.5 }}
			>
				<div className="flex items-center justify-between px-4 pt-3 pb-1">
					<p className="font-mono text-[13px] font-semibold">
						{t('demo.chartTitle')}
					</p>
					<span className="text-primary text-xs font-semibold tabular-nums">
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
