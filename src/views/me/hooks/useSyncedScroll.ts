'use client'

import { useCallback, useRef } from 'react'

export function useSyncedScroll(
	editorRef: React.RefObject<HTMLTextAreaElement | null>,
	previewRef: React.RefObject<HTMLDivElement | null>
) {
	const scrollingFrom = useRef<'editor' | 'preview' | null>(null)

	const handleEditorScroll = useCallback(() => {
		if (scrollingFrom.current && scrollingFrom.current !== 'editor') return
		const ta = editorRef.current
		const pv = previewRef.current
		if (!ta || !pv) return
		scrollingFrom.current = 'editor'
		const ratio = ta.scrollTop / (ta.scrollHeight - ta.clientHeight || 1)
		pv.scrollTop = ratio * (pv.scrollHeight - pv.clientHeight)
		requestAnimationFrame(() => {
			scrollingFrom.current = null
		})
	}, [editorRef, previewRef])

	const handlePreviewScroll = useCallback(() => {
		if (scrollingFrom.current && scrollingFrom.current !== 'preview') return
		const ta = editorRef.current
		const pv = previewRef.current
		if (!ta || !pv) return
		scrollingFrom.current = 'preview'
		const ratio = pv.scrollTop / (pv.scrollHeight - pv.clientHeight || 1)
		ta.scrollTop = ratio * (ta.scrollHeight - ta.clientHeight)
		requestAnimationFrame(() => {
			scrollingFrom.current = null
		})
	}, [editorRef, previewRef])

	return { handleEditorScroll, handlePreviewScroll }
}
