'use client'

import { toBlob } from 'html-to-image'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from '@/components/ui/Toast'
import { getFontEmbedCss } from '@/lib/font-embed'

const PLACEHOLDER =
	'data:image/svg+xml;charset=utf-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="2" height="2"%3E%3Crect width="2" height="2" fill="%23111318"/%3E%3C/svg%3E'

async function imageToDataUrl(url: string) {
	try {
		const response = await fetch(url)
		if (!response.ok) return null
		const blob = await response.blob()
		return await new Promise<string | null>((resolve) => {
			const reader = new FileReader()
			reader.onload = () => resolve(String(reader.result))
			reader.onerror = () => resolve(null)
			reader.readAsDataURL(blob)
		})
	} catch {
		return null
	}
}

export function useAwardResultsPng(filename = 'awards-results.png') {
	const t = useTranslations('awards')
	const ref = useRef<HTMLDivElement | null>(null)
	const [previewUrl, setPreviewUrl] = useState<string | null>(null)
	const [blob, setBlob] = useState<Blob | null>(null)
	const [isGenerating, setGenerating] = useState(false)

	useEffect(() => {
		if (!blob) {
			setPreviewUrl(null)
			return
		}
		const url = URL.createObjectURL(blob)
		setPreviewUrl(url)
		return () => URL.revokeObjectURL(url)
	}, [blob])

	const generate = useCallback(async () => {
		const node = ref.current
		if (!node || isGenerating) return null
		setGenerating(true)
		try {
			await document.fonts.ready
			await Promise.all(
				Array.from(node.querySelectorAll('img')).map(async (image) => {
					const source = image.currentSrc || image.src
					if (!source || source.startsWith('data:')) return
					const data = await imageToDataUrl(source)
					image.src = data ?? PLACEHOLDER
					await image.decode().catch(() => undefined)
				})
			)
			await new Promise(requestAnimationFrame)
			await new Promise(requestAnimationFrame)
			const { width, height } = node.getBoundingClientRect()
			const fontEmbedCSS = await getFontEmbedCss(node)
			const next = await toBlob(node, {
				backgroundColor: '#111318',
				fontEmbedCSS,
				height,
				imagePlaceholder: PLACEHOLDER,
				onImageErrorHandler: () => undefined,
				pixelRatio: 2,
				width,
			})
			if (!next) throw new Error('PNG generation failed')
			setBlob(next)
			return next
		} catch {
			toast.error(t('pngError'))
			return null
		} finally {
			setGenerating(false)
		}
	}, [isGenerating, t])

	const download = useCallback(() => {
		if (!previewUrl) return
		const link = document.createElement('a')
		link.download = filename
		link.href = previewUrl
		link.click()
	}, [filename, previewUrl])

	const copy = useCallback(async () => {
		if (!blob) return
		try {
			await navigator.clipboard.write([
				new ClipboardItem({
					'image/png': blob,
				}),
			])
			toast.success(t('pngCopied'))
		} catch {
			toast.error(t('pngCopyError'))
		}
	}, [blob, t])

	return {
		ref,
		previewUrl,
		isGenerating,
		generate,
		download,
		copy,
	}
}
