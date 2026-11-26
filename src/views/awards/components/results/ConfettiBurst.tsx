'use client'

import { motion, useReducedMotion } from 'motion/react'
import { useMemo } from 'react'
import { seededRandom } from '../../utils/award-results'

const CONFETTI_COLORS = [
	'#f0abfc',
	'#afe3ff',
	'#facc15',
	'#4ade80',
	'#fb7185',
	'#c084fc',
]

export function ConfettiBurst({ seed }: { seed: string }) {
	const reducedMotion = useReducedMotion()
	const pieces = useMemo(() => {
		if (reducedMotion) return []

		return Array.from({ length: 48 }, (_, index) => {
			const random = (offset: number) =>
				seededRandom(`${seed}-${index}-${offset}`)

			return {
				color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
				delay: random(1) * 0.2,
				duration: 1.1 + random(2) * 0.9,
				rotate: (random(6) - 0.5) * 1080,
				size: 5 + random(3) * 9,
				x: (random(4) - 0.5) * 720,
				y: -120 - random(5) * 520,
			}
		})
	}, [reducedMotion, seed])

	if (pieces.length === 0) return null

	return (
		<div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
			{pieces.map((piece, index) => (
				<motion.span
					animate={{
						opacity: 0,
						rotate: piece.rotate,
						scale: 0.4,
						x: piece.x,
						y: piece.y,
					}}
					className="absolute top-1/2 left-1/2 rounded-[2px]"
					initial={{ opacity: 1, rotate: 0, scale: 1, x: 0, y: 0 }}
					key={index}
					style={{
						backgroundColor: piece.color,
						height: piece.size,
						width: piece.size * 0.6,
					}}
					transition={{
						delay: piece.delay,
						duration: piece.duration,
						ease: 'easeOut',
					}}
				/>
			))}
		</div>
	)
}
