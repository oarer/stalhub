'use client'

import { toPng } from 'html-to-image'
import { useTranslations } from 'next-intl'
import { useCallback, useRef, useState } from 'react'
import { toast } from '@/components/ui/Toast'
import type { ClanSquad, SquadMap } from '@/types/clan/clan.type'

export function useClanSquadPng(
	activeSquads: ClanSquad[],
	activeMap: SquadMap
) {
	const t = useTranslations()
	const [isSavingPng, setIsSavingPng] = useState(false)
	const [pngPreviewUrl, setPngPreviewUrl] = useState<string | null>(null)
	const [showPngModal, setShowPngModal] = useState(false)
	const pngTemplateRef = useRef<HTMLDivElement | null>(null)

	const handleSavePng = useCallback(async () => {
		if (!pngTemplateRef.current || isSavingPng) return
		if (activeSquads.length === 0) return

		setIsSavingPng(true)

		try {
			await document.fonts.ready

			const node = pngTemplateRef.current
			const { width, height } = node.getBoundingClientRect()

			const dataUrl = await toPng(node, {
				backgroundColor: '#111318',
				cacheBust: false,
				height,
				pixelRatio: 2,
				width,
			})

			setPngPreviewUrl(dataUrl)
			setShowPngModal(true)
		} catch {
			toast.error(t('clan.squads.toasts.pngError'))
		} finally {
			setIsSavingPng(false)
		}
	}, [activeSquads.length, isSavingPng, t])

	const handleCopyPng = useCallback(async () => {
		if (!pngPreviewUrl) return
		try {
			const res = await fetch(pngPreviewUrl)
			const blob = await res.blob()
			await navigator.clipboard.write([
				new ClipboardItem({ 'image/png': blob }),
			])
			toast.success(t('clan.squads.toasts.pngCopied'))
		} catch {
			toast.error(t('clan.squads.toasts.copyError'))
		}
	}, [pngPreviewUrl, t])

	const handleDownloadPng = useCallback(() => {
		if (!pngPreviewUrl) return
		const link = document.createElement('a')
		link.download = `squads-${activeMap.toLowerCase()}.png`
		link.href = pngPreviewUrl
		link.click()
	}, [activeMap, pngPreviewUrl])

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
