'use client'

import { memo } from 'react'
import { montserrat } from '@/app/fonts'
import { roundNumber } from '../hooks/useBuildStats'

interface StatRowProps {
	keyName: string
	name: string
	value: number
	isPercent?: boolean
	color?: string
	delta?: number
}

export const StatRow = memo(function StatRow({
	keyName,
	name,
	value,
	isPercent,
	color,
	delta,
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
			<span className="flex items-center gap-1.5">
				{delta !== undefined && (
					<span
						className={`${montserrat.className} font-semibold text-xs`}
						style={{
							color: delta >= 0 ? '#53C353' : '#C15252',
						}}
					>
						{delta >= 0 ? '+' : ''}
						{roundNumber(delta)}
						{isPercent ? '%' : ''}
					</span>
				)}
				<span
					className={`${montserrat.className} font-semibold`}
					style={{ color: valueColor }}
				>
					{value >= 0 && !color ? '+' : ''}
					{roundNumber(value)}
					{isPercent ? '%' : ''}
				</span>
			</span>
		</p>
	)
})
