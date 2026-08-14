'use client'

import { useEffect, useRef } from 'react'
import { AUTOSAVE_DELAY } from '@/constants/article-editor.const'

export function useAutosave({
	isDirty,
	onSave,
}: {
	isDirty: boolean
	onSave: () => void
}) {
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

	useEffect(() => {
		if (!isDirty) return
		if (timerRef.current) clearTimeout(timerRef.current)
		timerRef.current = setTimeout(onSave, AUTOSAVE_DELAY)
		return () => {
			if (timerRef.current) clearTimeout(timerRef.current)
		}
	}, [isDirty, onSave])
}
