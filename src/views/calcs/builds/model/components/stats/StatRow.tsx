'use client'

import { montserrat } from '@/app/fonts'
import { roundNumber } from '../hooks/useBuildStats'

interface StatRowProps {
	keyName: string
	name: string
	value: number
	isPercent?: boolean
	color?: string
}

export function StatRow({
	keyName,
	name,
	value,
	isPercent,
	color,
}: StatRowProps) {
	const isAccumulation = keyName.toLowerCase().includes('accumulation')

	const valueColor =
		color ??
		(isAccumulation
			? value <= 0
				? '#53C353'
				: '#C15252'
			: value >= 0
				? '#53C353'
				: '#C15252')

	return (
		<p className="flex justify-between">
			<span>{name}</span>
			<span
				className={`${montserrat.className} font-semibold`}
				style={{ color: valueColor }}
			>
				{value >= 0 && !color ? '+' : ''}
				{roundNumber(value)}
				{isPercent ? '%' : ''}
			</span>
		</p>
	)
}
