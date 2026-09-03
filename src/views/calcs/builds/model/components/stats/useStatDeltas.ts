'use client'

import { useMemo, useRef } from 'react'

export function useStatDeltas(
	current: Record<string, number>
): Record<string, number> {
	const prevRef = useRef<Record<string, number> | null>(null)

	const deltas = useMemo(() => {
		const prev = prevRef.current
		const result: Record<string, number> = {}
		if (!prev) return result

		const allKeys = new Set([...Object.keys(prev), ...Object.keys(current)])
		for (const key of allKeys) {
			const prevVal = prev[key] ?? 0
			const curVal = current[key] ?? 0
			const diff = roundDelta(curVal - prevVal)
			if (Math.abs(diff) > 0.004) {
				result[key] = diff
			}
		}
		return result
	}, [current])

	prevRef.current = current

	return deltas
}

function roundDelta(v: number): number {
	return Math.round(v * 100) / 100
}
