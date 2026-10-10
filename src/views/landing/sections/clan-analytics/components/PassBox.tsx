'use client'

import { Icon } from '@iconify/react'
import {
	type MotionValue,
	motion,
	useMotionTemplate,
	useTransform,
} from 'motion/react'
import { DOTS } from '../config'

export function PassBox({
	icon,
	flow,
	fraction,
	frozen,
}: {
	icon: string
	flow: MotionValue<number>
	fraction: number
	frozen: boolean
}) {
	const glow = useTransform(flow, (v) => {
		let dist = 1
		for (let k = 0; k < DOTS; k++) {
			const p = (v + k / DOTS) % 1
			dist = Math.min(dist, Math.abs(p - fraction))
		}

		const t = Math.max(0, 1 - dist / 0.07)
		return t * t
	})
	const mix = useTransform(glow, (t) => t * 100)
	const borderColor = useMotionTemplate`color-mix(in srgb, var(--primary) ${mix}%, rgba(255,255,255,0.15))`
	return (
		<motion.div
			className="z-1 flex size-12 items-center justify-center rounded-xl border-2 border-muted bg-card text-muted-foreground"
			style={frozen ? undefined : { borderColor }}
		>
			<Icon className="text-xl" icon={icon} />
		</motion.div>
	)
}
