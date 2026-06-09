'use client'

import { roundNumber } from '../hooks/useBuildStats'

interface StatRowProps {
	keyName: string
	name: string
	value: number
	isPercent?: boolean
}

export function StatRow({ keyName, name, value, isPercent }: StatRowProps) {
	const isAccumulation = keyName.toLowerCase().includes('accumulation')

	const valueColor = isAccumulation
		? value <= 0
			? '#53C353'
			: '#C15252'
		: value >= 0
			? '#53C353'
			: '#C15252'

	return (
		<p className="flex justify-between">
			<span>{name}</span>
			<span className="font-medium" style={{ color: valueColor }}>
				{value >= 0 ? '+' : ''}
				{roundNumber(value)}
				{isPercent ? '%' : ''}
			</span>
		</p>
	)
}
