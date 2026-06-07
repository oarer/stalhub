'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { montserrat } from '@/app/fonts'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'

interface BPResultsProps {
	levelWithout: number
	levelWith: number
	difference: number
}

export function BPResults({
	levelWithout,
	levelWith,
	difference,
}: BPResultsProps) {
	const t = useTranslations()

	return (
		<Card.Root className="flex flex-col gap-4">
			<Card.Header>
				<Card.Title>
					<Icon
						className="text-neutral-700 text-xl dark:text-neutral-300"
						icon="lucide:bar-chart-2"
					/>
					<h2>{t('bp.result')}</h2>
				</Card.Title>
			</Card.Header>

			<Card.Content className="flex flex-col gap-3">
				<div className="flex items-center justify-between rounded-lg bg-background p-3">
					<div className="flex items-center gap-2">
						<Icon
							className="text-lg text-neutral-400"
							icon="lucide:x"
						/>
						<p className="text-neutral-700 text-sm dark:text-neutral-300">
							{t('bp.no_overloads')}
						</p>
					</div>
					<Badge variant="secondary">
						<span className={`${montserrat.className}`}>
							{levelWithout}
						</span>
					</Badge>
				</div>

				<div className="flex items-center justify-between rounded-lg bg-background p-3">
					<div className="flex items-center gap-2">
						<Icon
							className="text-lg text-neutral-400"
							icon="lucide:zap"
						/>
						<p className="text-neutral-700 text-sm dark:text-neutral-300">
							{t('bp.with_overloads')}
						</p>
					</div>
					<Badge variant="secondary">
						<span className={`${montserrat.className}`}>
							{levelWith}
						</span>
					</Badge>
				</div>

				<div className="flex items-center justify-between rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
					<div className="flex items-center gap-2">
						<Icon
							className="text-green-500 text-lg"
							icon="lucide:arrow-up-right"
						/>
						<p className="text-green-700 text-sm dark:text-green-400">
							{t('bp.difference')}
						</p>
					</div>
					<Badge
						className="bg-green-100 ring-green-200 dark:bg-green-900/50 dark:ring-green-800"
						variant="secondary"
					>
						<span
							className={`${montserrat.className} text-green-700 dark:text-green-300`}
						>
							+{difference}
						</span>
					</Badge>
				</div>
			</Card.Content>
		</Card.Root>
	)
}
