'use client'

import { memo } from 'react'
import { montserrat } from '@/app/fonts'
import { useBuildStore } from '@/stores/useBuild.store'
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
	const sicknessDisplay = useBuildStore(
		(s) => s.defaults.sicknessDisplay ?? 'new'
	)
	const isAccumulation = keyName.toLowerCase().includes('accumulation')
	const legacyScale = isAccumulation && sicknessDisplay === 'old' ? 20 : 1

	const shownValue = value / legacyScale
	const shownDelta = delta !== undefined ? delta / legacyScale : undefined

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
			<span className="font-medium text-[13px]">{name}</span>
			<span className="flex items-center gap-1.5">
				{shownDelta !== undefined && (
					<span
						className="font-medium text-xs"
						style={{
							color: shownDelta >= 0 ? '#53C353' : '#C15252',
						}}
					>
						{shownDelta >= 0 ? '+' : ''}
						{roundNumber(shownDelta)}
						{isPercent ? '%' : ''}
					</span>
				)}
				<span
					className={`font-mono font-semibold`}
					style={{ color: valueColor }}
				>
					{shownValue >= 0 && !color ? '+' : ''}
					{roundNumber(shownValue)}
					{isPercent ? '%' : ''}
				</span>
			</span>
		</p>
	)
})
