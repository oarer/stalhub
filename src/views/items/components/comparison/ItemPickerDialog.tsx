'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Skeleton } from '@/components/ui/Skeleton'
import { useSearchItem } from '@/hooks/useSearchItem'
import { ItemsList } from '@/shared/components/ItemsList'
import type { Locale } from '@/types/item.type'
import {
	getCatalogStatus,
	getComparisonCandidates,
	type ListingPath,
} from '../itemComparisonUtils'

type ItemPickerDialogProps = {
	open: boolean
	onOpenChange: (open: boolean) => void
	title: string
	source: ListingPath | null
	exclude: readonly ListingPath[] | null
	locale: Locale
	onPick: (ref: ListingPath) => void
}

const SKELETON_ROWS = ['a', 'b', 'c', 'd', 'e']

export function ItemPickerDialog({
	open,
	onOpenChange,
	title,
	source,
	exclude,
	locale,
	onPick,
}: ItemPickerDialogProps) {
	const t = useTranslations()
	const [query, setQuery] = useState('')
	const { items, error, retry } = useSearchItem()

	useEffect(() => {
		if (open) setQuery('')
	}, [open])

	const candidates = useMemo(
		() => getComparisonCandidates(items, source, exclude),
		[items, source, exclude]
	)
	const pickerItems = useMemo(
		() => candidates.map((candidate) => candidate.item),
		[candidates]
	)

	const status = getCatalogStatus({
		hasItems: !!items,
		error,
		candidateCount: candidates.length,
	})

	return (
		<Modal.Root onOpenChange={onOpenChange} open={open}>
			<Modal.Content className="flex flex-col sm:max-h-[90dvh] sm:w-full sm:max-w-3xl">
				<Modal.Header className="pr-12">
					<Modal.Title>{title}</Modal.Title>
				</Modal.Header>

				<div className="space-y-3 pb-3">
					<Input
						className="px-2 text-[14px]"
						label="items.comparison.pickSearch"
						onChange={(e) => setQuery(e.target.value)}
						value={query}
					/>
					{source && (
						<p className="text-muted-foreground text-xs">
							{t('items.comparison.pickHint')}
						</p>
					)}
				</div>

				<div className="max-h-[60dvh]">
					{status === 'loading' && (
						<div aria-busy="true" className="space-y-2">
							<p className="font-medium text-sm">
								{t('items.comparison.catalogLoading')}
							</p>
							{SKELETON_ROWS.map((row) => (
								<Skeleton className="h-14" key={row} />
							))}
						</div>
					)}

					{status === 'error' && (
						<Card.Root className="items-center justify-center gap-3 py-8 text-center">
							<Icon
								className="text-3xl text-muted-foreground"
								icon="lucide:triangle-alert"
							/>
							<p className="font-medium text-sm">
								{t('items.comparison.catalogError')}
							</p>
							<Button
								onClick={() => void retry()}
								size="sm"
								variant="outline"
							>
								<Icon
									className="mr-2"
									icon="lucide:refresh-cw"
								/>
								{t('items.comparison.retry')}
							</Button>
						</Card.Root>
					)}

					{status === 'empty' && (
						<Card.Root className="items-center justify-center gap-3 py-8 text-center">
							<Icon
								className="text-3xl text-muted-foreground"
								icon="lucide:package-x"
							/>
							<p className="font-medium text-sm">
								{t('items.comparison.catalogEmpty')}
							</p>
						</Card.Root>
					)}

					{status === 'ready' && (
						<ItemsList
							className="max-h-[50dvh]"
							emptyText={t('items.comparison.noResults')}
							items={pickerItems}
							locale={locale}
							onSelectItem={(id) => {
								const picked = candidates.find(
									(candidate) => candidate.id === id
								)
								if (picked) onPick(picked)
							}}
							query={query}
						/>
					)}
				</div>
			</Modal.Content>
		</Modal.Root>
	)
}
