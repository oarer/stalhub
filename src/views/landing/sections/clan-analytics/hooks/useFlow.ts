'use client'

import { animate, useMotionValue } from 'motion/react'
import { useEffect } from 'react'
import { FLOW_DURATION } from '../config'

export function useFlow(disabled: boolean) {
	const flow = useMotionValue(0)

	useEffect(() => {
		if (disabled) {
			return
		}
		const controls = animate(flow, 1, {
			duration: FLOW_DURATION,
			repeat: Infinity,
			ease: 'linear',
		})
		return () => controls.stop()
	}, [flow, disabled])

	return flow
}
