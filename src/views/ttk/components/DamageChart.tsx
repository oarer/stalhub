import type { ChartData, ChartOptions, TooltipItem } from 'chart.js'
import {
	CategoryScale,
	Chart as ChartJS,
	Filler,
	Legend,
	LinearScale,
	LineElement,
	PointElement,
	Title,
	Tooltip,
} from 'chart.js'
import { useTheme } from 'next-themes'
import React from 'react'
import { Line } from 'react-chartjs-2'

import { Card } from '@/components/ui/Card'

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
	Filler
)

interface Block {
	startDamage: number
	endDamage: number
	damageDecreaseStart: number
	damageDecreaseEnd: number
	maxDistance: number
}

interface DamageChartProps {
	block: Block
}

// ! ОСТОРОЖНО СНИЗУ СТРАШНЫЙ (ГОВНО) КОД !

const round = (v: number, digits = 6): number =>
	Math.round(v * 10 ** digits) / 10 ** digits

const clamp = (v: number, a: number, b: number): number =>
	Math.max(a, Math.min(b, v))

const getDamageAt = (block: Block, x: number): number => {
	const startDamage = block.startDamage
	const endDamage = block.endDamage

	const maxDist = Math.max(0, block.maxDistance)
	const dds = clamp(block.damageDecreaseStart, 0, maxDist)
	const dde = clamp(block.damageDecreaseEnd, dds, maxDist)

	if (x <= dds) return startDamage
	if (x >= dde) return endDamage

	const t = (x - dds) / (dde - dds)
	return startDamage + t * (endDamage - startDamage)
}

const generateXsByRule = (block: Block): number[] => {
	const maxDist = Math.max(0, block.maxDistance)
	const xsSet = new Set<number>()

	xsSet.add(0)

	const dds = clamp(block.damageDecreaseStart, 0, maxDist)
	const dde = clamp(block.damageDecreaseEnd, dds, maxDist)

	const step1 = 10
	for (let x = 0; x <= dde; x += step1) {
		xsSet.add(round(x, 6))
	}

	if (dde < maxDist) {
		xsSet.add(round(maxDist, 6))
	}

	xsSet.add(round(dds, 6))
	xsSet.add(round(dde, 6))

	const xs = Array.from(xsSet).sort((a, b) => a - b)
	return xs
}

const generatePointsVariableSteps = (
	block: Block
): { x: number; y: number }[] => {
	const xs = generateXsByRule(block)
	const points = xs.map((x) => {
		const y = getDamageAt(block, x)
		return { x: round(x, 6), y }
	})
	return points
}

export const DamageChart: React.FC<DamageChartProps> = ({ block }) => {
	const { resolvedTheme } = useTheme()
	const isDark = resolvedTheme === 'dark'

	const points = React.useMemo(
		() => generatePointsVariableSteps(block),
		[block]
	)

	const data: ChartData<'line', { x: number; y: number }[], number> = {
		datasets: [
			{
				label: 'Damage',
				data: points,
				parsing: false,
				fill: true,
				tension: 0,
				borderWidth: 2,
				pointRadius: 4,
				pointHoverRadius: 6,
				borderColor: '#0092D1',
				backgroundColor: '#31c2ff20',
			},
		],
	}

	const options: ChartOptions<'line'> = {
		maintainAspectRatio: false,
		responsive: true,
		plugins: {
			legend: { display: false },
			tooltip: {
				mode: 'nearest',
				intersect: false,
				backgroundColor: isDark ? '#080808' : '#fff',
				titleColor: isDark ? '#fbfbfe' : '#171717',
				bodyColor: isDark ? '#d4d4d4' : '#525252',
				borderColor: isDark ? '#3d4a52' : '#badbeb',
				borderWidth: 2,
				padding: 12,
				displayColors: false,
				titleFont: { size: 13, weight: 'bold' },
				bodyFont: { size: 12, weight: 'bold' },
				callbacks: {
					title: (tooltipItems: TooltipItem<'line'>[]) => {
						if (tooltipItems.length === 0) return ''

						const item = tooltipItems[0]
						const parsed = item.parsed as { x: number; y: number }
						return `Дистанция: ${Math.round(parsed.x)} m`
					},

					label: (context: TooltipItem<'line'>): string => {
						const parsed = context.parsed as {
							x: number
							y: number
						}
						const dmg = Math.round(parsed.y * 100) / 100
						return `Урон: ${dmg}`
					},
				},
			},
		},
		scales: {
			x: {
				type: 'linear',
				title: { display: true, text: 'Дистанция (м)' },
				grid: { display: false },
				min: 0,
				max: Math.max(0, block.maxDistance),
				grace: 0,
				ticks: {
					callback: (value) => {
						const v = Number(value)
						return Number.isInteger(v) ? v.toString() : v.toFixed(1)
					},
				},
			},
			y: {
				beginAtZero: true,
				title: { display: true, text: 'Урон' },
				grid: { display: false },
			},
		},
	}

	return (
		<Card.Root className="h-80 w-full py-8">
			<Card.Header>
				<h1 className="text-center font-semibold">Урон на дистанции</h1>
			</Card.Header>

			<Line data={data} options={options} />
		</Card.Root>
	)
}

export default DamageChart
