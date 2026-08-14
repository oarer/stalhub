'use client'

import { useTranslations } from 'next-intl'
import { useMemo } from 'react'
import { Bar } from 'react-chartjs-2'
import { ChartCard } from './ChartCard'
import type { SquadAgg } from './chart.utils'
import { squadBarOptions } from './chartOptions'

interface SquadKdChartProps {
	isDark: boolean
	squadRows: SquadAgg[]
}

export function SquadKdChart({ isDark, squadRows }: SquadKdChartProps) {
	const t = useTranslations()
	const data = useMemo(
		() => ({
			labels: squadRows.map((s) => s.name),
			datasets: [
				{
					label: t('clan.charts.kdShort'),
					data: squadRows.map((s) => Number(s.kd.toFixed(2))),
					backgroundColor: '#0092D1',
					borderRadius: 4,
				},
				{
					label: t('clan.charts.kdaShort'),
					data: squadRows.map((s) => Number(s.kda.toFixed(2))),
					backgroundColor: '#a855f7',
					borderRadius: 4,
				},
			],
		}),
		[squadRows, t]
	)
	const options = useMemo(() => squadBarOptions(isDark), [isDark])

	return (
		<ChartCard title={t('clan.charts.topSquadsKd')}>
			{squadRows.length === 0 ? (
				<div className="flex h-full items-center justify-center text-sm text-text-accent">
					{t('clan.charts.noSquads')}
				</div>
			) : (
				<Bar data={data} options={options} />
			)}
		</ChartCard>
	)
}
