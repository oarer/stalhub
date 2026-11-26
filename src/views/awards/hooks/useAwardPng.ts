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
		const r = await fetch(url)
		if (!r.ok) return null
		const b = await r.blob()
		return await new Promise<string | null>((resolve) => {
			const reader = new FileReader()
			reader.onload = () => resolve(String(reader.result))
			reader.onerror = () => resolve(null)
			reader.readAsDataURL(b)
		})
	} catch {
		return null
	}
}

export function useAwardPng() {
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
		const u = URL.createObjectURL(blob)
		setPreviewUrl(u)
		return () => URL.revokeObjectURL(u)
	}, [blob])

	const generate = useCallback(async () => {
		const node = ref.current
		if (!node || isGenerating) return null
		setGenerating(true)
		try {
			await document.fonts.ready
			await Promise.all(
				Array.from(node.querySelectorAll('img')).map(async (img) => {
					const src = img.currentSrc || img.src
					if (!src || src.startsWith('data:')) return
					const data = await imageToDataUrl(src)
					img.src = data ?? PLACEHOLDER
					await img.decode().catch(() => undefined)
				})
			)
			await new Promise(requestAnimationFrame)
			await new Promise(requestAnimationFrame)
			const { width, height } = node.getBoundingClientRect()
			const fontEmbedCSS = await getFontEmbedCss(node)
			const next = await toBlob(node, {
				backgroundColor: '#111318',
				pixelRatio: 2,
				fontEmbedCSS,
				imagePlaceholder: PLACEHOLDER,
				onImageErrorHandler: () => undefined,
				width,
				height,
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
		const a = document.createElement('a')
		a.href = previewUrl
		a.download = 'stalzone-award.png'
		a.click()
	}, [previewUrl])

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

	const share = useCallback(async () => {
		if (!blob) return
		if (navigator.share) {
			await navigator
				.share({
					files: [
						new File([blob], 'stalzone-award.png', {
							type: 'image/png',
						}),
					],
					title: 'StalZone Awards',
				})
				.catch(() => undefined)
		} else download()
	}, [blob, download])

	return {
		ref,
		previewUrl,
		isGenerating,
		generate,
		download,
		copy,
		share,
	}
}
