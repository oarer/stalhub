'use client'

import { useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'
import { useMemo } from 'react'
import { Bar } from 'react-chartjs-2'
import { ChartCard } from './ChartCard'
import type { SessionResult } from './chart.utils'
import { resultBarOptions } from './chartOptions'

interface SessionResultsChartProps {
	sessionResults: SessionResult[]
}

export function SessionResultsChart({
	sessionResults,
}: SessionResultsChartProps) {
	const t = useTranslations()
	const { resolvedTheme } = useTheme()
	const data = useMemo(
		() => ({
			labels: sessionResults.map((s) => s.label),
			datasets: [
				{
					label: t('clan.charts.victories'),
					data: sessionResults.map((s) =>
						s.victory === 'win' ? 1 : 0
					),
					backgroundColor: '#22c55e',
					borderRadius: 4,
				},
				{
					label: t('clan.charts.defeats'),
					data: sessionResults.map((s) =>
						s.victory === 'loss' ? 1 : 0
					),
					backgroundColor: '#ef4444',
					borderRadius: 4,
				},
			],
		}),
		[sessionResults, t]
	)
	const options = resultBarOptions()

	return (
		<ChartCard title={t('clan.charts.victoriesByGames')}>
			{sessionResults.length === 0 ? (
				<div className="flex h-full items-center justify-center text-sm text-text-accent">
					{t('clan.charts.noGames')}
				</div>
			) : (
				<Bar data={data} key={resolvedTheme ?? 'light'} options={options} />
			)}
		</ChartCard>
	)
}
