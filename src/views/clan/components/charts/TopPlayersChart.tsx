'use client'

import { useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'
import { useMemo } from 'react'
import { Bar } from 'react-chartjs-2'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { ChartCard } from './ChartCard'
import { METRICS, type Metric } from './chart.utils'
import { baseBarOptions } from './chartOptions'

interface TopPlayersChartProps {
	topPlayers: { name: string; value: number }[]
	metric: Metric
	topCount: number
	onMetricChange: (metric: Metric) => void
}

export function TopPlayersChart({
	topPlayers,
	metric,
	topCount,
	onMetricChange,
}: TopPlayersChartProps) {
	const t = useTranslations()
	const { resolvedTheme } = useTheme()
	const activeMetric = METRICS.find((m) => m.value === metric) ?? METRICS[0]

	const data = useMemo(
		() => ({
			labels: topPlayers.map((p) => p.name),
			datasets: [
				{
					label: t(activeMetric.label),
					data: topPlayers.map((p) => p.value),
					backgroundColor: activeMetric.color,
					borderRadius: 4,
				},
			],
		}),
		[topPlayers, activeMetric, t]
	)
	const options = baseBarOptions(t(activeMetric.label))

	return (
		<ChartCard
			action={
				<div className="flex items-center gap-2 rounded-xl bg-muted px-2 py-1.5">
					{METRICS.map((m) => (
						<Button
							className={cn(
								'font-semibold text-card-foreground',
								metric === m.value && 'bg-primary/40'
							)}
							key={m.value}
							onClick={() => onMetricChange(m.value)}
							size={'sm'}
							type="button"
							variant={'ghost'}
						>
							{t(m.label)}
						</Button>
					))}
				</div>
			}
			className="col-span-2"
			title={
				topCount === 35
					? t('clan.charts.topPlayersTitleAll', {
							metric: t(activeMetric.label).toLowerCase(),
						})
					: t('clan.charts.topPlayersTitle', {
							metric: t(activeMetric.label).toLowerCase(),
							n: topCount,
						})
			}
		>
			{topPlayers.length === 0 ? (
				<div className="flex h-full items-center justify-center text-sm text-text-accent">
					{t('clan.charts.noPlayers')}
				</div>
			) : (
				<Bar
					data={data}
					key={resolvedTheme ?? 'light'}
					options={options}
				/>
			)}
		</ChartCard>
	)
}
