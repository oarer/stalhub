'use client'

import { useReactFlow } from '@xyflow/react'
import { useEffect } from 'react'

export function CenterOnNode({
	centerTarget,
}: {
	centerTarget: { x: number; y: number } | null
}) {
	const reactFlowInstance = useReactFlow()

	useEffect(() => {
		if (!centerTarget) return
		reactFlowInstance.setCenter(centerTarget.x, centerTarget.y, {
			duration: 600,
			zoom: 0.8,
		})
	}, [centerTarget, reactFlowInstance])

	return null
}
