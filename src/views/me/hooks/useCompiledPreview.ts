'use client'

import { useEffect, useRef, useState } from 'react'
import { PREVIEW_DEBOUNCE } from '@/constants/article-editor.const'
import { compileMdx } from '@/lib/actions/mdx'

export function useCompiledPreview(content: string) {
	const [compiledSource, setCompiledSource] = useState('')
	const [compileError, setCompileError] = useState(false)
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

	useEffect(() => {
		if (!content.trim()) {
			setCompiledSource('')
			setCompileError(false)
			return
		}
		if (timerRef.current) clearTimeout(timerRef.current)
		timerRef.current = setTimeout(async () => {
			try {
				const result = await compileMdx(content)
				setCompiledSource(result.compiledSource)
				setCompileError(false)
			} catch {
				setCompileError(true)
			}
		}, PREVIEW_DEBOUNCE)
		return () => {
			if (timerRef.current) clearTimeout(timerRef.current)
		}
	}, [content])

	return { compiledSource, compileError }
}
