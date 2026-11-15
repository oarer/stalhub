'use client'

import { useEffect, useState } from 'react'

export type ImageLuminance = 'dark' | 'light' | null

const SAMPLE_SIZE = 32

export function useImageLuminance(
	url: string | null | undefined
): ImageLuminance {
	const [luminance, setLuminance] = useState<ImageLuminance>(null)

	useEffect(() => {
		if (!url) {
			setLuminance(null)
			return
		}

		let cancelled = false
		const img = new Image()
		img.crossOrigin = 'anonymous'

		img.onload = () => {
			if (cancelled) return
			try {
				const canvas = document.createElement('canvas')
				canvas.width = SAMPLE_SIZE
				canvas.height = SAMPLE_SIZE
				const ctx = canvas.getContext('2d')
				if (!ctx) return
				ctx.drawImage(img, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE)
				const { data } = ctx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE)
				let total = 0
				const count = data.length / 4
				for (let i = 0; i < data.length; i += 4) {
					const r = data[i] / 255
					const g = data[i + 1] / 255
					const b = data[i + 2] / 255
					total += 0.2126 * r + 0.7152 * g + 0.0722 * b
				}
				setLuminance(total / count > 0.4 ? 'light' : 'dark')
			} catch {
				setLuminance(null)
			}
		}

		img.onerror = () => {
			if (!cancelled) setLuminance(null)
		}

		img.src = url

		return () => {
			cancelled = true
		}
	}, [url])

	return luminance
}
