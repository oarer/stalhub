'use client'

import { type MotionValue, motion, useTransform } from 'motion/react'
import { loop01 } from '../utils'

export function FlowDot({
	flow,
	offset,
}: {
	flow: MotionValue<number>
	offset: number
}) {
	const left = useTransform(flow, (v) => `${loop01(v + offset) * 100}%`)
	const opacity = useTransform(flow, (v) => {
		const p = loop01(v + offset)
		return p < 0.02 || p > 0.98 ? 0 : 1
	})
	return (
		<motion.span
			className="absolute top-0 size-1.5 rounded-full bg-primary shadow-[0_0_8px_2px_var(--primary)]"
			style={{ left, opacity, marginLeft: -3 }}
		/>
	)
}
