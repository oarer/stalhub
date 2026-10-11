'use client'

import { AnimatePresence, motion } from 'motion/react'
import { memo } from 'react'
import { roundNumber } from '../hooks/useBuildStats'

interface StatDeltaProps {
	delta?: number
	isPercent?: boolean
}

export const StatDelta = memo(function StatDelta({
	delta,
	isPercent,
}: StatDeltaProps) {
	return (
		<AnimatePresence>
			{delta !== undefined && (
				<motion.span
					animate={{ opacity: 1, x: 0 }}
					className="font-medium text-xs"
					exit={{ opacity: 0, x: 4 }}
					initial={{ opacity: 0, x: 4 }}
					style={{ color: delta >= 0 ? '#53C353' : '#C15252' }}
					transition={{ duration: 0.2 }}
				>
					{delta >= 0 ? '+' : ''}
					{roundNumber(delta)}
					{isPercent ? '%' : ''}
				</motion.span>
			)}
		</AnimatePresence>
	)
})
