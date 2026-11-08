'use client'

import { type RefObject, useEffect, useState } from 'react'

export function useFullscreen(ref: RefObject<HTMLElement | null>) {
	const [isFullscreen, setIsFullscreen] = useState(false)

	useEffect(() => {
		const onChange = () =>
			setIsFullscreen(document.fullscreenElement === ref.current)
		document.addEventListener('fullscreenchange', onChange)
		return () => document.removeEventListener('fullscreenchange', onChange)
	}, [ref])

	const toggle = () => {
		if (document.fullscreenElement) {
			void document.exitFullscreen()
			return
		}
		void ref.current?.requestFullscreen()
	}

	return { isFullscreen, toggle }
}
