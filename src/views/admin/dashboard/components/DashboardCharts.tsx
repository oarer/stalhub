'use client'

import type { ChartDataset } from 'chart.js'
import {
	BarElement,
	CategoryScale,
	Chart as ChartJS,
	Legend,
	LinearScale,
	LineElement,
	PointElement,
	Tooltip,
} from 'chart.js'
import { useTranslations } from 'next-intl'
import { useMemo } from 'react'
import { Bar, Line } from 'react-chartjs-2'
import { getChartColors } from '@/lib/chart-theme'
import { ChartShell } from './Shared'

ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	PointElement,
	LineElement,
	Tooltip,
	Legend
)

interface TrendPoint {
	date: string
	count: number
}

interface ContentTrendPoint {
	date: string
	builds: number
	articles: number
	arts: number
}

interface OnlinePoint {
	region: string
	createdAt: string
	online: number
}

const PALETTE = {
	sky: '#0ea5e9',
	emerald: '#10b981',
	amber: '#f59e0b',
	rose: '#f43f5e',
	violet: '#8b5cf6',
	cyan: '#06b6d4',
	pink: '#ec4899',
	lime: '#84cc16',
}

function shortDate(date: string): string {
	return date.slice(5)
}

function useLineOptions() {
	const colors = getChartColors()
	return useMemo(() => {
		const tickFont = { size: 11, weight: 'bold' } as const
		return {
			responsive: true,
			maintainAspectRatio: false,
			interaction: { intersect: false, mode: 'index' as const },
			plugins: {
				legend: {
					display: true,
					position: 'top' as const,
					labels: {
						color: colors.axis,
						usePointStyle: true,
						pointStyle: 'rectRounded' as const,
						boxWidth: 10,
						boxHeight: 10,
						padding: 12,
					},
				},
				tooltip: {
					backgroundColor: colors.tooltip.background,
					titleColor: colors.tooltip.titleColor,
					bodyColor: colors.tooltip.bodyColor,
					borderColor: colors.tooltip.borderColor,
					borderWidth: 1,
					padding: 10,
					titleFont: { size: 13, weight: 'bold' as const },
					bodyFont: { size: 12, weight: 'bold' as const },
				},
			},
			scales: {
				x: {
					ticks: {
						color: colors.axis,
						maxTicksLimit: 8,
						maxRotation: 0,
						font: tickFont,
					},
					grid: { display: false },
				},
				y: {
					beginAtZero: true,
					ticks: {
						color: colors.axis,
						maxTicksLimit: 6,
						font: tickFont,
					},
					grid: { color: colors.grid },
				},
			},
		}
	}, [colors])
}

function lineDataset(
	label: string,
	data: number[],
	color: string,
	fill = false
): ChartDataset<'line', number[]> {
	return {
		label,
		data,
		borderColor: color,
		backgroundColor: fill ? `${color}22` : color,
		fill,
		tension: 0.3,
		borderWidth: 2,
		pointRadius: 0,
		pointHoverRadius: 4,
	}
}

function barDataset(colors: string[], borderColors: string[]) {
	return {
		backgroundColor: colors.map((c) => `${c}66`),
		borderColor: borderColors,
		borderWidth: 1.5,
		borderRadius: 6,
	}
}

export function RegistrationsChart({ trend }: { trend: TrendPoint[] }) {
	const options = useLineOptions()
	const t = useTranslations()
	return (
		<ChartShell height="h-64">
			{trend.length === 0 ? (
				<EmptyChart />
			) : (
				<Line
					data={{
						labels: trend.map((p) => shortDate(p.date)),
						datasets: [
							lineDataset(
								t('admin.dashboard.labels.registrations'),
								trend.map((p) => p.count),
								PALETTE.sky,
								true
							),
						],
					}}
					options={{
						...options,
						plugins: {
							...options.plugins,
							legend: { display: false },
						},
					}}
				/>
			)}
		</ChartShell>
	)
}

export function ContentCreatedChart({ trend }: { trend: ContentTrendPoint[] }) {
	const options = useLineOptions()
	const t = useTranslations()
	return (
		<ChartShell height="h-64">
			{trend.length === 0 ? (
				<EmptyChart />
			) : (
				<Line
					data={{
						labels: trend.map((p) => shortDate(p.date)),
						datasets: [
							lineDataset(
								t('admin.dashboard.labels.builds'),
								trend.map((p) => p.builds),
								PALETTE.emerald
							),
							lineDataset(
								t('admin.dashboard.labels.articles'),
								trend.map((p) => p.articles),
								PALETTE.amber
							),
							lineDataset(
								t('admin.dashboard.labels.arts'),
								trend.map((p) => p.arts),
								PALETTE.violet
							),
						],
					}}
					options={options}
				/>
			)}
		</ChartShell>
	)
}

export function ViewsChart({
	views,
	labels,
}: {
	views: number[]
	labels: string[]
}) {
	const options = useLineOptions()
	return (
		<ChartShell height="h-64">
			{views.every((v) => v === 0) ? (
				<EmptyChart />
			) : (
				<Bar
					data={{
						labels,
						datasets: [
							{
								...barDataset(
									[
										PALETTE.emerald,
										PALETTE.amber,
										PALETTE.violet,
										PALETTE.cyan,
									],
									[
										PALETTE.emerald,
										PALETTE.amber,
										PALETTE.violet,
										PALETTE.cyan,
									]
								),
								data: views,
							},
						],
					}}
					options={{
						...options,
						plugins: {
							...options.plugins,
							legend: { display: false },
						},
					}}
				/>
			)}
		</ChartShell>
	)
}

export function ArticleStatusesChart({
	statuses,
	labels,
}: {
	statuses: number[]
	labels: string[]
}) {
	const options = useLineOptions()
	return (
		<ChartShell height="h-64">
			{statuses.every((v) => v === 0) ? (
				<EmptyChart />
			) : (
				<Bar
					data={{
						labels,
						datasets: [
							{
								...barDataset(
									[
										PALETTE.amber,
										PALETTE.emerald,
										PALETTE.sky,
										PALETTE.rose,
										PALETTE.pink,
									],
									[
										PALETTE.amber,
										PALETTE.emerald,
										PALETTE.sky,
										PALETTE.rose,
										PALETTE.pink,
									]
								),
								data: statuses,
							},
						],
					}}
					options={{
						...options,
						plugins: {
							...options.plugins,
							legend: { display: false },
						},
					}}
				/>
			)}
		</ChartShell>
	)
}

function EmptyChart() {
	return (
		<div className="flex h-full items-center justify-center text-neutral-500 text-sm">
			—
		</div>
	)
}
