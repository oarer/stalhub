'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Combobox } from '@/components/ui/Combobox'
import { Modal } from '@/components/ui/Modal'
import { PngPreviewModal } from '@/components/ui/PngPreviewModal'
import { Tabs } from '@/components/ui/Tabs'
import type { AwardResults } from '@/types/awards.type'
import { useAwardResultsPng } from '../hooks/useAwardResultsPng'
import {
	AwardCategoryResultsPngTemplate,
	AwardOverallResultsPngTemplate,
} from './AwardResultsPngTemplate'

type ResultsImageMode = 'category' | 'overall'

export default function AwardResultsPngDialog({
	open,
	onOpenChange,
	results,
	initialCategoryId,
	initialMode = 'category',
}: {
	open: boolean
	onOpenChange: (open: boolean) => void
	results: AwardResults
	initialCategoryId?: string
	initialMode?: ResultsImageMode
}) {
	const t = useTranslations()
	const firstCategory =
		results.categories.find(
			(category) => category.id === initialCategoryId
		) ?? results.categories[0]
	const [mode, setMode] = useState<ResultsImageMode>(initialMode)
	const [categoryId, setCategoryId] = useState(firstCategory?.id ?? '')
	const [previewOpen, setPreviewOpen] = useState(false)
	const category =
		results.categories.find((item) => item.id === categoryId) ??
		firstCategory
	const filename =
		mode === 'category' && category
			? `awards-${category.slug}.png`
			: 'awards-overall.png'
	const png = useAwardResultsPng(filename)
	const baseUrl =
		process.env.NEXT_PUBLIC_BASE_URL ??
		(typeof window === 'undefined' ? '' : window.location.origin)

	useEffect(() => {
		if (!open) return
		const nextCategory =
			results.categories.find((item) => item.id === initialCategoryId) ??
			results.categories[0]
		setMode(initialMode)
		setCategoryId(nextCategory?.id ?? '')
	}, [open, initialCategoryId, initialMode, results.categories])

	const generate = async () => {
		if (mode === 'category' && !category) return
		await png.generate()
		setPreviewOpen(true)
	}

	if (results.categories.length === 0) return null

	return (
		<>
			<Modal.Root onOpenChange={onOpenChange} open={open}>
				<Modal.Content className="max-w-xl" fullScreen={false}>
					<Modal.Header>
						<Modal.Title>{t('awards.results.images')}</Modal.Title>
					</Modal.Header>
					<div className="flex flex-col gap-4">
						<Tabs.Root
							onValueChange={(value) =>
								setMode(value as ResultsImageMode)
							}
							value={mode}
						>
							<Tabs.List className="grid grid-cols-2">
								<Tabs.Trigger value="category">
									{t('awards.results.imageCategory')}
								</Tabs.Trigger>
								<Tabs.Trigger value="overall">
									{t('awards.results.imageOverall')}
								</Tabs.Trigger>
							</Tabs.List>
						</Tabs.Root>

						{mode === 'category' && (
							<div className="flex flex-col gap-1">
								<span>{t('admin.awards.categories')}</span>
								<Combobox
									onValueChange={(value) =>
										value && setCategoryId(value)
									}
									options={results.categories.map((item) => ({
										label: item.title,
										value: item.id,
									}))}
									placeholder="admin.awards.selectCategory"
									translateOptions={false}
									value={category?.id ?? ''}
								/>
							</div>
						)}

						<div className="flex justify-end">
							<Button
								loading={png.isGenerating}
								onClick={generate}
							>
								{t('awards.results.generateImage')}
							</Button>
						</div>
					</div>
				</Modal.Content>
			</Modal.Root>

			<div
				aria-hidden
				className="pointer-events-none fixed top-0 -left-[10000px] opacity-0"
			>
				{mode === 'category' && category ? (
					<AwardCategoryResultsPngTemplate
						baseUrl={baseUrl}
						campaignTitle={results.title}
						category={category}
						ref={png.ref}
						year={results.year}
					/>
				) : (
					<AwardOverallResultsPngTemplate
						baseUrl={baseUrl}
						campaignTitle={results.title}
						categories={results.categories}
						ref={png.ref}
						year={results.year}
					/>
				)}
			</div>

			<PngPreviewModal
				alt={t('awards.results.images')}
				closeLabel={t('ui.cancel')}
				copyLabel={t('ui.copy')}
				downloadLabel={t('ui.download')}
				onCopy={png.copy}
				onDownload={png.download}
				onOpenChange={setPreviewOpen}
				open={previewOpen}
				previewUrl={png.previewUrl}
				title={t('awards.results.images')}
			/>
		</>
	)
}
