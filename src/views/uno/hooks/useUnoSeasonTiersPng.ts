'use client'

import { toBlob } from 'html-to-image'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from '@/components/ui/Toast'
import { getFontEmbedCss } from '@/lib/font-embed'

export function useUnoSeasonTiersPng(filename: string) {
	const t = useTranslations('uno')
	const [isSavingPng, setIsSavingPng] = useState(false)
	const [pngPreviewBlob, setPngPreviewBlob] = useState<Blob | null>(null)
	const [pngPreviewUrl, setPngPreviewUrl] = useState<string | null>(null)
	const [showPngModal, setShowPngModal] = useState(false)
	const pngTemplateRef = useRef<HTMLDivElement | null>(null)

	useEffect(() => {
		if (!pngPreviewBlob) return

		const url = URL.createObjectURL(pngPreviewBlob)
		setPngPreviewUrl(url)

		return () => URL.revokeObjectURL(url)
	}, [pngPreviewBlob])

	const handleSavePng = useCallback(async () => {
		if (!pngTemplateRef.current || isSavingPng) return

		setIsSavingPng(true)

		try {
			await document.fonts.ready

			const node = pngTemplateRef.current
			const { width, height } = node.getBoundingClientRect()
			if (width === 0 || height === 0) {
				throw new Error('PNG template has no measurable dimensions')
			}

			const fontEmbedCSS = await getFontEmbedCss(node)
			const pngBlob = await toBlob(node, {
				backgroundColor: '#111318',
				cacheBust: false,
				fontEmbedCSS,
				height,
				pixelRatio: 2,
				width,
			})
			if (!pngBlob) throw new Error('Failed to encode PNG')

			setPngPreviewBlob(pngBlob)
			setShowPngModal(true)
		} catch {
			toast.error(t('seasons.pngError'))
		} finally {
			setIsSavingPng(false)
		}
	}, [isSavingPng, t])

	const handleCopyPng = useCallback(async () => {
		if (!pngPreviewUrl) return
		try {
			const res = await fetch(pngPreviewUrl)
			if (!res.ok) throw new Error('Failed to load PNG')
			const blob = await res.blob()
			await navigator.clipboard.write([
				new ClipboardItem({ 'image/png': blob }),
			])
			toast.success(t('seasons.pngCopied'))
		} catch {
			toast.error(t('seasons.copyError'))
		}
	}, [pngPreviewUrl, t])

	const handleDownloadPng = useCallback(() => {
		if (!pngPreviewUrl) return
		const link = document.createElement('a')
		link.download = filename
		link.href = pngPreviewUrl
		link.click()
	}, [filename, pngPreviewUrl])

	return {
		isSavingPng,
		pngPreviewUrl,
		showPngModal,
		setShowPngModal,
		pngTemplateRef,
		handleSavePng,
		handleCopyPng,
		handleDownloadPng,
	}
}
