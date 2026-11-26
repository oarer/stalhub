'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Combobox } from '@/components/ui/Combobox'
import { Modal } from '@/components/ui/Modal'
import { PngPreviewModal } from '@/components/ui/PngPreviewModal'
import type {
	AwardCampaign,
	AwardCategory,
	AwardResults,
} from '@/types/awards.type'
import { useAwardPng } from '../hooks/useAwardPng'
import { AwardPngTemplate } from './AwardPngTemplate'

export default function AwardPngDialog({
	open,
	onOpenChange,
	campaign,
	categories,
	results,
	initialCategoryId,
	initialNomineeId,
	allowDraft = false,
}: {
	open: boolean
	onOpenChange: (open: boolean) => void
	campaign: AwardCampaign
	categories: AwardCategory[]
	results?: AwardResults
	initialCategoryId?: string
	initialNomineeId?: string
	allowDraft?: boolean
}) {
	const t = useTranslations()
	const initialCategory =
		categories.find((category) => category.id === initialCategoryId) ??
		categories[0]
	const [categoryId, setCategoryId] = useState(initialCategory?.id ?? '')
	const [nomineeId, setNomineeId] = useState(
		initialNomineeId &&
			initialCategory?.nominees.some(
				(nominee) => nominee.id === initialNomineeId
			)
			? initialNomineeId
			: (initialCategory?.nominees[0]?.id ?? '')
	)
	const category =
		categories.find((c) => c.id === categoryId) ?? categories[0]
	const nominee = category?.nominees.find((n) => n.id === nomineeId)
	const result = results?.categories
		.find((c) => c.id === category?.id)
		?.nominees.find((n) => n.id === nominee?.id)
	const [previewOpen, setPreviewOpen] = useState(false)
	const png = useAwardPng()

	useEffect(() => {
		if (!open) return
		const nextCategory =
			categories.find((item) => item.id === initialCategoryId) ??
			categories[0]
		setCategoryId(nextCategory?.id ?? '')
		setNomineeId(
			initialNomineeId &&
				nextCategory?.nominees.some(
					(nominee) => nominee.id === initialNomineeId
				)
				? initialNomineeId
				: (nextCategory?.nominees[0]?.id ?? '')
		)
	}, [open, categories, initialCategoryId, initialNomineeId])

	useEffect(() => {
		if (category && !category.nominees.some((n) => n.id === nomineeId))
			setNomineeId(category.nominees[0]?.id ?? '')
	}, [category, nomineeId])

	const generate = async () => {
		if (!category || !nominee) return
		await png.generate()
		setPreviewOpen(true)
	}

	if (!allowDraft && campaign.status === 'draft') return null

	return (
		<>
			<Modal.Root onOpenChange={onOpenChange} open={open}>
				<Modal.Content className="max-w-xl" fullScreen={false}>
					<Modal.Header>
						<Modal.Title>{t('awards.sharePng')}</Modal.Title>
					</Modal.Header>
					<div className="flex flex-col gap-3">
						<div className="flex flex-col gap-1">
							<span>{t('admin.awards.categories')}</span>
							<Combobox
								onValueChange={(value) =>
									value && setCategoryId(value)
								}
								options={categories.map((c) => ({
									value: c.id,
									label: c.title,
								}))}
								placeholder="admin.awards.selectCategory"
								translateOptions={false}
								value={category?.id ?? ''}
							/>
						</div>
						<div className="flex flex-col gap-1">
							<span>{t('admin.awards.nominees')}</span>
							<Combobox
								onValueChange={(value) =>
									value && setNomineeId(value)
								}
								options={(category?.nominees ?? []).map(
									(n) => ({
										value: n.id,
										label: n.clan_name ?? n.name,
									})
								)}
								placeholder="admin.awards.select"
								translateOptions={false}
								value={nominee?.id ?? ''}
							/>
						</div>
						<div className="flex justify-end">
							<Button
								loading={png.isGenerating}
								onClick={generate}
							>
								{t('awards.sharePng')}
							</Button>
						</div>
					</div>
				</Modal.Content>
			</Modal.Root>
			{category && nominee && (
				<div
					aria-hidden
					className="pointer-events-none fixed top-0 -left-[10000px] opacity-0"
				>
					<AwardPngTemplate
						baseUrl={
							process.env.NEXT_PUBLIC_BASE_URL ??
							(typeof window === 'undefined'
								? ''
								: window.location.origin)
						}
						campaign={campaign}
						category={category}
						nominee={nominee}
						ref={png.ref}
						result={result}
					/>
				</div>
			)}
			<PngPreviewModal
				alt={nominee?.name ?? ''}
				closeLabel={t('ui.cancel')}
				copyLabel={t('ui.copy')}
				downloadLabel={t('ui.download')}
				onCopy={png.copy}
				onDownload={png.download}
				onOpenChange={setPreviewOpen}
				open={previewOpen}
				previewUrl={png.previewUrl}
				title={t('awards.sharePng')}
			/>
		</>
	)
}
