'use client'

import {
	CategoryScale,
	Chart as ChartJS,
	Filler,
	Legend,
	LinearScale,
	LineElement,
	PointElement,
	Tooltip,
} from 'chart.js'
import { useMemo } from 'react'
import { Line } from 'react-chartjs-2'
import { useTheme } from 'next-themes'

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Tooltip,
	Legend,
	Filler
)

export function StatChart({
	points,
	label,
}: {
	points: { t: string; v: number }[]
	label: string
}) {
	const { resolvedTheme } = useTheme()

	const data = useMemo(
		() => ({
			labels: points.map((p) => new Date(p.t).toLocaleString()),
			datasets: [
				{
					label,
					data: points.map((p) => p.v),
					borderColor: '#8b5cf6',
					backgroundColor: 'rgba(139, 92, 246, 0.2)',
					fill: true,
					tension: 0.3,
					pointRadius: 3,
				},
			],
		}),
		[points, label]
	)

	if (points.length === 0) {
		return <div className="py-8 text-center text-muted-foreground text-sm">—</div>
	}

	return (
		<div className="h-64">
			<Line
				data={data}
				key={resolvedTheme ?? 'light'}
				options={{
					maintainAspectRatio: false,
					responsive: true,
					plugins: { legend: { display: false } },
					scales: {
						x: { ticks: { maxTicksLimit: 8 } },
						y: { beginAtZero: true },
					},
				}}
			/>
		</div>
	)
}
