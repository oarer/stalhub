'use client'

import { useEffect, useState } from 'react'
import {
	INITIAL_SHOT,
	LOG_PAUSE,
	LOG_PROCESSING,
	type LogEntry,
	VISIBLE_ROWS,
} from '../config'
import { formatTime } from '../utils'

function buildInitialEntries(locale: string): LogEntry[] {
	return Array.from({ length: VISIBLE_ROWS }, (_, i) => {
		const shot = INITIAL_SHOT + VISIBLE_ROWS - 1 - i
		return {
			shot,
			time: formatTime(locale),
			status: i === 0 ? 'processing' : 'done',
			players: i === 2 ? 5 : 6,
		} as LogEntry
	})
}

export function useClanLog(locale: string) {
	const [entries, setEntries] = useState<LogEntry[]>(() =>
		buildInitialEntries(locale)
	)

	useEffect(() => {
		let alive = true
		let timer: ReturnType<typeof setTimeout>

		const settle = () => {
			if (!alive) {
				return
			}
			setEntries((prev) =>
				prev.map((entry, i) =>
					i === 0 && entry.status === 'processing'
						? { ...entry, status: 'done' as const }
						: entry
				)
			)
			timer = setTimeout(add, LOG_PAUSE)
		}

		const add = () => {
			if (!alive) {
				return
			}
			setEntries((prev) => {
				const nextShot = (prev[0]?.shot ?? 0) + 1
				return [
					{
						shot: nextShot,
						time: formatTime(locale),
						status: 'processing',
						players: 6,
					} as LogEntry,
					...prev,
				].slice(0, VISIBLE_ROWS)
			})
			timer = setTimeout(settle, LOG_PROCESSING)
		}

		timer = setTimeout(settle, LOG_PROCESSING)
		return () => {
			alive = false
			clearTimeout(timer)
		}
	}, [locale])

	return entries
}
