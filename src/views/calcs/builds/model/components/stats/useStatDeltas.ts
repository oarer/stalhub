'use client'

import { useEffect, useRef, useState } from 'react'

const DELTA_VISIBLE_MS = 4000
const MIN_DELTA = 0.004
const EMPTY: Record<string, number> = {}

export function useStatDeltas(
	current: Record<string, number>
): Record<string, number> {
	const prevRef = useRef<Record<string, number> | null>(null)
	const [deltas, setDeltas] = useState<Record<string, number>>(EMPTY)
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

	useEffect(() => {
		const prev = prevRef.current
		prevRef.current = current
		if (!prev) return

		const result: Record<string, number> = {}
		const allKeys = new Set([...Object.keys(prev), ...Object.keys(current)])
		for (const key of allKeys) {
			const diff = roundDelta((current[key] ?? 0) - (prev[key] ?? 0))
			if (Math.abs(diff) > MIN_DELTA) {
				result[key] = diff
			}
		}

		if (Object.keys(result).length === 0) return

		setDeltas(result)
		if (timeoutRef.current) clearTimeout(timeoutRef.current)
		timeoutRef.current = setTimeout(() => {
			setDeltas(EMPTY)
			timeoutRef.current = null
		}, DELTA_VISIBLE_MS)
	}, [current])

	useEffect(() => {
		return () => {
			if (timeoutRef.current) clearTimeout(timeoutRef.current)
		}
	}, [])

	return deltas
}

function roundDelta(v: number): number {
	return Math.round(v * 100) / 100
}
