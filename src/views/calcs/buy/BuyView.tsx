'use client'

import { Icon } from '@iconify/react'
import { toPng } from 'html-to-image'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useCallback, useMemo, useRef, useState } from 'react'
import { unbounded } from '@/app/fonts'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { LightBox } from '@/components/ui/LightBox'
import { Modal } from '@/components/ui/Modal'
import { toast } from '@/components/ui/Toast'
import { getLocale } from '@/lib/getLocale'
import { useBuyStore } from '@/stores/useBuy.store'
import type { ItemListing } from '@/types/api.type'
import { BuyHeader } from './components/BuyHeader'
import {
	BuyPngTemplate,
	formatBuyPrice,
	getBuyIconUrl,
} from './components/BuyPngTemplate'
import { BuyTable } from './components/BuyTable'
import ItemPickerModal from './components/ItemPickerModal'

const imagePlaceholder =
	'data:image/svg+xml;charset=utf-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1" height="1"%3E%3C/svg%3E'

function isImageEntry(
	entry: readonly [string, string] | null
): entry is readonly [string, string] {
	return entry !== null
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
	return new Promise((resolve, reject) => {
		const timeoutId = window.setTimeout(() => {
			reject(new Error('PNG export timeout'))
		}, timeoutMs)

		promise.then(
			(value) => {
				window.clearTimeout(timeoutId)
				resolve(value)
			},
			(error) => {
				window.clearTimeout(timeoutId)
				reject(error)
			}
		)
	})
}

async function imageToDataUrl(url: string, timeoutMs = 4000) {
	const controller = new AbortController()
	const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs)

	try {
		const response = await fetch(url, { signal: controller.signal })
		if (!response.ok) return null

		const blob = await response.blob()

		return await new Promise<string | null>((resolve, reject) => {
			const reader = new FileReader()
			reader.onerror = () => reject(reader.error)
			reader.onloadend = () => resolve(String(reader.result))
			reader.readAsDataURL(blob)
		})
	} catch {
		return null
	} finally {
		window.clearTimeout(timeoutId)
	}
}

export default function BuyView() {
	const t = useTranslations()
	const locale = getLocale()

	const title = useBuyStore((s) => s.title)
	const discord = useBuyStore((s) => s.discord)
	const items = useBuyStore((s) => s.items)
	const setTitle = useBuyStore((s) => s.setTitle)
	const setDiscord = useBuyStore((s) => s.setDiscord)
	const addItem = useBuyStore((s) => s.addItem)
	const clearItems = useBuyStore((s) => s.clearItems)

	const [showPicker, setShowPicker] = useState(false)
	const [isSavingPng, setIsSavingPng] = useState(false)
	const [pngImageSources, setPngImageSources] = useState<
		Record<string, string>
	>({})
	const [pngPreviewUrl, setPngPreviewUrl] = useState<string | null>(null)
	const [showPngModal, setShowPngModal] = useState(false)
	const pngTemplateRef = useRef<HTMLDivElement | null>(null)

	const addedKeys = useMemo(
		() => new Set(items.map((entry) => entry.key)),
		[items]
	)

	const handleAdd = useCallback(
		(item: ItemListing) => {
			addItem(item)
			toast.success(t('buy.added'))
		},
		[addItem, t]
	)

	const handleCopyText = useCallback(async () => {
		const lines = items.map((entry, index) => {
			const name = entry.item.name?.[locale] ?? entry.item.data ?? '—'
			return `${index + 1}. ${name} — ${formatBuyPrice(entry.price)}`
		})

		const blocks = [title || t('buy.title'), lines.join('\n')]

		if (discord.trim()) {
			blocks.push(`${t('buy.discord')}: ${discord.trim()}`)
		}

		try {
			await navigator.clipboard.writeText(
				blocks.filter(Boolean).join('\n\n')
			)
			toast.success(t('buy.textCopied'))
		} catch {
			toast.error(t('buy.copyError'))
		}
	}, [discord, items, locale, t, title])

	const handleSavePng = useCallback(async () => {
		if (!pngTemplateRef.current || isSavingPng) return

		setIsSavingPng(true)

		try {
			await document.fonts.ready

			const iconItems = items.filter((entry) => entry.item)
			const imageEntries = await Promise.all(
				iconItems.map(async (entry) => {
					const dataUrl = await imageToDataUrl(
						getBuyIconUrl(entry.item)
					)
					return dataUrl ? ([entry.key, dataUrl] as const) : null
				})
			)
			const sources = Object.fromEntries(
				imageEntries.filter(isImageEntry)
			)
			if (!sources || Object.keys(sources).length === 0) {
				toast.error(t('buy.pngNoIcons'))
			}

			setPngImageSources(sources)
			await new Promise((resolve) => requestAnimationFrame(resolve))

			const node = pngTemplateRef.current
			const { width, height } = node.getBoundingClientRect()

			const dataUrl = await withTimeout(
				toPng(node, {
					backgroundColor: '#111318',
					cacheBust: false,
					height,
					imagePlaceholder,
					onImageErrorHandler: () => undefined,
					pixelRatio: 2,
					width,
				}),
				15000
			)

			setPngPreviewUrl(dataUrl)
			setShowPngModal(true)
		} catch (error) {
			console.error(error)
			toast.error(t('buy.pngError'))
		} finally {
			setIsSavingPng(false)
		}
	}, [isSavingPng, items, t])

	const handleDownloadPng = useCallback(() => {
		if (!pngPreviewUrl) return
		const link = document.createElement('a')
		const safeTitle = (title || t('buy.title'))
			.trim()
			.replace(/[\\/:*?"<>|]+/g, '-')
			.replace(/\s+/g, '-')
			.toLowerCase()
		link.download = `${safeTitle || 'buyer'}.png`
		link.href = pngPreviewUrl
		link.click()
		setShowPngModal(false)
	}, [pngPreviewUrl, title, t])

	const handleCopyPng = useCallback(async () => {
		if (!pngPreviewUrl) return
		try {
			const res = await fetch(pngPreviewUrl)
			const blob = await res.blob()
			await navigator.clipboard.write([
				new ClipboardItem({ 'image/png': blob }),
			])
			toast.success(t('buy.pngCopied'))
			setShowPngModal(false)
		} catch {
			toast.error(t('buy.copyError'))
		}
	}, [pngPreviewUrl, t])

	return (
		<section className="mx-auto flex max-w-300 flex-col gap-4 px-4 pt-32 pb-12 sm:px-6">
			<h1
				className={`${unbounded.className} font-semibold text-2xl tracking-tight md:text-3xl xl:text-4xl`}
			>
				{t('buy.title')}
			</h1>

			<Card.Root className="gap-5">
				<BuyHeader
					discord={discord}
					onAddItem={() => setShowPicker(true)}
					onClear={clearItems}
					onCopyText={handleCopyText}
					onDiscordChange={setDiscord}
					onSavePng={handleSavePng}
					onTitleChange={setTitle}
					savingPng={isSavingPng}
					title={title}
				/>
				<BuyTable />
			</Card.Root>

			<ItemPickerModal
				addedKeys={addedKeys}
				onAdd={handleAdd}
				onOpenChange={setShowPicker}
				open={showPicker}
			/>

			<div
				aria-hidden="true"
				className="pointer-events-none fixed top-0 left-2500"
			>
				<BuyPngTemplate
					discord={discord}
					imageSources={pngImageSources}
					items={items}
					locale={locale}
					ref={pngTemplateRef}
					t={t}
					title={title}
				/>
			</div>

			<Modal.Root onOpenChange={setShowPngModal} open={showPngModal}>
				<Modal.Content fullScreen={false}>
					<Modal.Header>
						<Modal.Title className="flex items-center gap-2">
							<Icon icon="lucide:image" />
							{t('buy.pngPreview')}
						</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						{pngPreviewUrl && (
							<LightBox.Root>
								<LightBox.Trigger asChild>
									<Image
										alt={t('buy.pngPreview')}
										className="rounded-lg"
										height={600}
										priority
										src={pngPreviewUrl}
										width={900}
									/>
								</LightBox.Trigger>
								<LightBox.Content src={pngPreviewUrl} />
							</LightBox.Root>
						)}
					</Modal.Body>
					<Modal.Footer>
						<Modal.Close>{t('buy.close')}</Modal.Close>
						<Button
							className="flex items-center gap-2"
							onClick={handleCopyPng}
							variant="secondary"
						>
							<Icon icon="lucide:copy" />
							{t('buy.copy')}
						</Button>
						<Button
							className="flex items-center gap-2"
							onClick={handleDownloadPng}
							variant="primary"
						>
							<Icon icon="lucide:download" />
							{t('buy.download')}
						</Button>
					</Modal.Footer>
				</Modal.Content>
			</Modal.Root>
		</section>
	)
}
