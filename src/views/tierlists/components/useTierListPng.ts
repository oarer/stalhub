'use client'

import { toBlob } from 'html-to-image'
import { useTranslations } from 'next-intl'
import { useCallback, useRef, useState } from 'react'
import { toast } from '@/components/ui/Toast'

const IMAGE_PLACEHOLDER =
	'data:image/svg+xml;charset=utf-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1" height="1"%3E%3C/svg%3E'

async function imageToDataUrl(url: string): Promise<string | null> {
	try {
		const response = await fetch(url)
		if (!response.ok) return null
		const blob = await response.blob()
		return await new Promise((resolve, reject) => {
			const reader = new FileReader()
			reader.onload = () => resolve(String(reader.result))
			reader.onerror = () => reject(reader.error)
			reader.readAsDataURL(blob)
		})
	} catch {
		return null
	}
}

function createPreviewUrl(blob: Blob | null): string {
	if (!blob) throw new Error('Failed to encode PNG')
	return URL.createObjectURL(blob)
}

export function useTierListPng() {
	const t = useTranslations()
	const [isSavingPng, setIsSavingPng] = useState(false)
	const [pngPreviewUrl, setPngPreviewUrl] = useState<string | null>(null)
	const [showPngModal, setShowPngModal] = useState(false)
	const pngTemplateRef = useRef<HTMLDivElement | null>(null)

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

			// Inline remote icons before rasterizing to avoid blocking the canvas pass.
			const images = Array.from(node.querySelectorAll('img'))
			await Promise.all(
				images.map(async (image) => {
					const source = image.currentSrc || image.src
					if (!source || source.startsWith('data:')) return
					const dataUrl = await imageToDataUrl(source)
					if (!dataUrl) return
					image.src = dataUrl
					await image.decode().catch(() => undefined)
				})
			)

			await new Promise((resolve) => requestAnimationFrame(resolve))
			const pngBlob = await toBlob(node, {
				backgroundColor: '#111318',
				cacheBust: false,
				height,
				imagePlaceholder: IMAGE_PLACEHOLDER,
				onImageErrorHandler: () => undefined,
				pixelRatio: 1,
				width,
			})
			const previewUrl = createPreviewUrl(pngBlob)

			setPngPreviewUrl((previousUrl) => {
				if (previousUrl?.startsWith('blob:')) URL.revokeObjectURL(previousUrl)
				return previewUrl
			})
			setShowPngModal(true)
		} catch {
			toast.error(t('tierlists.pngError'))
		} finally {
			setIsSavingPng(false)
		}
	}, [isSavingPng, t])

	const handleCopyPng = useCallback(async () => {
		if (!pngPreviewUrl) return
		try {
			const res = await fetch(pngPreviewUrl)
			const blob = await res.blob()
			await navigator.clipboard.write([
				new ClipboardItem({ 'image/png': blob }),
			])
			toast.success(t('tierlists.pngCopied'))
		} catch {
			toast.error(t('tierlists.copyError'))
		}
	}, [pngPreviewUrl, t])

	const handleDownloadPng = useCallback(() => {
		if (!pngPreviewUrl) return
		const link = document.createElement('a')
		link.download = 'tierlist.png'
		link.href = pngPreviewUrl
		link.click()
	}, [pngPreviewUrl])

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
