'use client'

import { useCallback, useMemo } from 'react'
import {
	Area,
	CartesianGrid,
	ComposedChart,
	Legend,
	ResponsiveContainer,
	Tooltip,
	type TooltipContentProps,
	XAxis,
	YAxis,
} from 'recharts'
import type {
	NameType,
	ValueType,
} from 'recharts/types/component/DefaultTooltipContent'
import { Card } from '@/components/ui/Card'

export interface TTKSeries {
	label: string
	color: string
	points: { x: number; y: number }[]
}

function interpolateY(
	points: { x: number; y: number }[],
	targetX: number
): number | null {
	if (points.length === 0) return null

	const first = points[0]
	const last = points[points.length - 1]

	if (targetX < first.x || targetX > last.x) {
		return null
	}

	if (first.x === targetX) return first.y
	if (last.x === targetX) return last.y

	for (let i = 0; i < points.length - 1; i++) {
		if (points[i].x <= targetX && points[i + 1].x >= targetX) {
			const lower = points[i]
			const upper = points[i + 1]
			const ratio = (targetX - lower.x) / (upper.x - lower.x)
			return lower.y + ratio * (upper.y - lower.y)
		}
	}

	return null
}

type CustomTooltipProps = TooltipContentProps<ValueType, NameType> & {
	series: TTKSeries[]
}

function CustomTooltip({ active, payload, series }: CustomTooltipProps) {
	if (!active || !payload?.length) return null

	const x = payload[0]?.payload?.x
	if (typeof x !== 'number') return null

	const tooltipData = series
		.map((s) => ({
			label: s.label,
			color: s.color,
			value: interpolateY(s.points, x),
		}))
		.filter((d) => d.value !== null)

	if (tooltipData.length === 0) return null

	return (
		<Card.Root>
			<Card.Header className="text-sm">{Math.round(x)} м</Card.Header>
			<Card.Content className="space-y-1">
				{tooltipData.map((entry, index) => (
					<div
						className="flex items-center gap-2 font-semibold text-xs"
						key={index}
					>
						<span
							className="h-2.5 w-2.5 rounded-full"
							style={{ backgroundColor: entry.color }}
						/>
						<span>{entry.label}:</span>
						<span className="font-mono">
							{entry.value!.toFixed(2)}с
						</span>
					</div>
				))}
			</Card.Content>
		</Card.Root>
	)
}

export function TTKChart({
	series,
	maxDist,
}: {
	series: TTKSeries[]
	maxDist: number
}) {
	const chartData = useMemo(() => {
		if (!series.length) return []

		const allXValues = new Set<number>()
		for (const s of series) {
			for (const p of s.points) {
				allXValues.add(p.x)
			}
		}
		const sortedX = Array.from(allXValues).sort((a, b) => a - b)

		const bounds = series.map((s) => {
			const pts = s.points
			return {
				minX: pts.length > 0 ? pts[0].x : 0,
				maxX: pts.length > 0 ? pts[pts.length - 1].x : 0,
			}
		})

		return sortedX.map((x) => {
			const point: Record<string, number | undefined> = { x }
			for (let i = 0; i < series.length; i++) {
				const s = series[i]
				const b = bounds[i]
				if (x >= b.minX && x <= b.maxX) {
					const value = interpolateY(s.points, x)
					if (value !== null) {
						point[s.label] = value
					}
				}
			}
			return point
		})
	}, [series])

	const renderTooltip = useCallback(
		(props: TooltipContentProps<ValueType, NameType>) => (
			<CustomTooltip {...props} series={series} />
		),
		[series]
	)

	return (
		<div className="h-full w-full">
			<ResponsiveContainer
				className="outline-none"
				height="100%"
				width="100%"
			>
				<ComposedChart
					data={chartData}
					margin={{ top: 16, right: 16, bottom: 24, left: 8 }}
				>
					<CartesianGrid horizontal={false} vertical={false} />

					<XAxis
						axisLine={{ stroke: 'var(--border)', strokeWidth: 1 }}
						dataKey="x"
						domain={[0, maxDist]}
						tick={{ fontSize: 11 }}
						tickFormatter={(value) => `${value}`}
						tickLine={false}
						ticks={Array.from(
							{ length: Math.floor(maxDist / 10) + 1 },
							(_, i) => i * 10
						)}
						type="number"
					/>

					<YAxis
						axisLine={{ stroke: 'var(--border)', strokeWidth: 1 }}
						domain={[
							(dataMin: number) =>
								Number((dataMin - 0.1).toFixed(2)),
							'auto',
						]}
						tick={{ fontSize: 11 }}
						tickFormatter={(value) => (value as number).toFixed(1)}
						tickLine={false}
						width={36}
					/>

					<Tooltip content={renderTooltip} />

					{series.map((s) => (
						<Area
							activeDot={{
								r: 5,
								stroke: s.color,
								strokeWidth: 2,
								fill: 'var(--background)',
							}}
							connectNulls={false}
							dataKey={s.label}
							dot={false}
							fill="none"
							isAnimationActive={false}
							key={s.label}
							stroke={s.color}
							strokeWidth={2.5}
							type="monotone"
						/>
					))}
					<Legend height={24} verticalAlign="bottom" />
				</ComposedChart>
			</ResponsiveContainer>
		</div>
	)
}
