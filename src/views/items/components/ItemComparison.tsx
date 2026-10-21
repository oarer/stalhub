'use client'

import { Icon } from '@iconify/react'
import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'
import { useMemo, useState } from 'react'
import { mtsExtended } from '@/app/fonts'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Skeleton } from '@/components/ui/Skeleton'
import { useSearchItem } from '@/hooks/useSearchItem'
import { getLocale } from '@/lib/getLocale'
import { itemQueries } from '@/queries/item/item.queries'
import { ItemsList } from '@/shared/components/ItemsList'
import {
	type DamageDistanceInfoBlock,
	InfoColor,
	infoColorMap,
	type Item,
	type Locale,
} from '@/types/item.type'
import { getCategoryLabel, messageToString } from '@/utils/itemUtils'
import { DamageChart } from '@/views/calcs/ttk/components/DamageChart'
import { InfoBlocksRenderer, NumericVariantsCard } from './blocks'
import {
	type ComparisonSelection,
	clampSharpening,
	createSelection,
	getCatalogStatus,
	getComparisonCandidates,
	parseListingPath,
	resolveSelection,
	validateComparisonTarget,
} from './itemComparisonUtils'

type ItemComparisonProps = {
	item: Item
	githubUrl: string
	initialSharpening?: number
}

const SKELETON_ROWS = ['a', 'b', 'c', 'd', 'e']

const iconUrl = (item: Pick<Item, 'category' | 'id'>) =>
	`https://cdn.stalhub.dev/db/icons/${item.category}/${item.id}.png`

function Notice({
	icon,
	text,
	onRetry,
	loading = false,
}: {
	icon: string
	text: string
	onRetry?: () => void
	loading?: boolean
}) {
	const t = useTranslations()

	return (
		<Card.Root
			aria-live="polite"
			className="items-center justify-center gap-3 py-8 text-center"
		>
			<Icon
				className={`text-3xl text-muted-foreground ${loading ? 'animate-spin' : ''}`}
				icon={icon}
			/>
			<p className="font-medium text-sm">{text}</p>
			{onRetry && (
				<Button onClick={onRetry} size="sm" variant="outline">
					<Icon className="mr-2" icon="lucide:refresh-cw" />
					{t('items.comparison.retry')}
				</Button>
			)}
		</Card.Root>
	)
}

function ItemSummary({
	item,
	locale,
	pinned = false,
	onChange,
}: {
	item: Item
	locale: Locale
	pinned?: boolean
	onChange?: () => void
}) {
	const t = useTranslations()
	const { resolvedTheme } = useTheme()
	const name = messageToString(item.name, locale) || item.id
	const color =
		item.color === InfoColor.DEFAULT
			? 'var(--foreground)'
			: (infoColorMap[item.color] ?? 'var(--foreground)')
	const nameColor =
		resolvedTheme === 'dark'
			? color
			: `color-mix(in srgb, ${color} 70%, var(--foreground))`

	return (
		<Card.Root>
			<div className="flex items-center gap-3">
				<Image
					alt={name}
					className="h-16 w-16 shrink-0 object-contain"
					height={64}
					src={iconUrl(item)}
					width={64}
				/>
				<div className="min-w-0 flex-1 space-y-1">
					<h2
						className={`${mtsExtended.className} wrap-break-word font-semibold text-lg`}
						style={{
							color: nameColor,
						}}
					>
						{name}
					</h2>
					<p className="font-medium text-sm">
						{getCategoryLabel(item, locale)}
					</p>
				</div>
				{pinned && (
					<Badge className="shrink-0" variant="stalhub">
						<Icon icon="lucide:pin" />
						{t('items.comparison.pinned')}
					</Badge>
				)}
				{onChange && (
					<Button
						className="shrink-0"
						onClick={onChange}
						size="sm"
						variant="outline"
					>
						{t('items.comparison.change')}
					</Button>
				)}
			</div>
		</Card.Root>
	)
}

function ItemStats({
	item,
	locale,
	sharpening,
}: {
	item: Item
	locale: Locale
	sharpening: number
}) {
	return (
		<>
			<InfoBlocksRenderer
				infoBlocks={item.infoBlocks}
				locale={locale}
				numericVariants={sharpening}
			/>
			{item.infoBlocks
				.filter(
					(block): block is DamageDistanceInfoBlock =>
						block?.type === 'damage'
				)
				.map((block) => (
					<DamageChart
						block={block}
						key={`${block.startDamage}-${block.endDamage}-${block.damageDecreaseStart}-${block.damageDecreaseEnd}-${block.maxDistance}`}
					/>
				))}
		</>
	)
}

function TargetPicker({
	source,
	locale,
	onPick,
}: {
	source: Item
	locale: Locale
	onPick: (githubUrl: string) => void
}) {
	const t = useTranslations()
	const [query, setQuery] = useState('')
	const { items, error, retry } = useSearchItem()

	const candidates = useMemo(
		() => getComparisonCandidates(items, source),
		[items, source]
	)
	const pickerItems = useMemo(
		() => candidates.map((c) => c.item),
		[candidates]
	)

	const status = getCatalogStatus({
		hasItems: !!items,
		error,
		candidateCount: candidates.length,
	})

	if (status === 'loading') {
		return (
			<div aria-busy="true" className="space-y-2">
				<p className="font-medium text-sm">
					{t('items.comparison.catalogLoading')}
				</p>
				{SKELETON_ROWS.map((row) => (
					<Skeleton className="h-14" key={row} />
				))}
			</div>
		)
	}

	if (status === 'error') {
		return (
			<Notice
				icon="lucide:triangle-alert"
				onRetry={() => void retry()}
				text={t('items.comparison.catalogError')}
			/>
		)
	}

	if (status === 'empty') {
		return (
			<Notice
				icon="lucide:package-x"
				text={t('items.comparison.catalogEmpty')}
			/>
		)
	}

	return (
		<Card.Root className="gap-3">
			<div className="space-y-1">
				<h2 className="font-semibold text-lg">
					{t('items.comparison.pickTitle')}
				</h2>
				<p className="text-muted-foreground text-sm">
					{t('items.comparison.pickHint')}
				</p>
			</div>
			<Input
				className="px-2 text-[14px]"
				label="ui.input_label"
				onChange={(e) => setQuery(e.target.value)}
				value={query}
			/>
			<div className="h-96">
				<ItemsList
					emptyText={t('items.comparison.noResults')}
					items={pickerItems}
					locale={locale}
					onSelectItem={(id) => {
						const picked = candidates.find((c) => c.id === id)
						if (picked) onPick(picked.githubUrl)
					}}
					query={query}
				/>
			</div>
		</Card.Root>
	)
}

function TargetColumn({
	source,
	targetUrl,
	locale,
	sharpening,
	onReset,
}: {
	source: Item
	targetUrl: string
	locale: Locale
	sharpening: number
	onReset: () => void
}) {
	const t = useTranslations()
	const { data, isPending, isError, refetch, isFetching } = useQuery(
		itemQueries.byGithubUrl(targetUrl)
	)

	if (isPending) {
		return (
			<div aria-busy="true" className="space-y-2">
				<p className="font-medium text-sm">
					{t('items.comparison.itemLoading')}
				</p>
				<Skeleton className="h-24" />
				<Skeleton className="h-48" />
			</div>
		)
	}

	if (isError || !data) {
		return (
			<div className="space-y-2">
				<Notice
					icon="lucide:triangle-alert"
					loading={isFetching}
					onRetry={() => void refetch()}
					text={t('items.comparison.itemError')}
				/>
				<Button onClick={onReset} variant="ghost">
					{t('items.comparison.change')}
				</Button>
			</div>
		)
	}

	if (validateComparisonTarget(source, data) !== 'ok') {
		return (
			<div className="space-y-2">
				<Notice
					icon="lucide:ban"
					text={t('items.comparison.categoryMismatch')}
				/>
				<Button onClick={onReset} variant="ghost">
					{t('items.comparison.change')}
				</Button>
			</div>
		)
	}

	return (
		<div className="space-y-4">
			<ItemSummary item={data} locale={locale} onChange={onReset} />
			<ItemStats item={data} locale={locale} sharpening={sharpening} />
		</div>
	)
}

function ComparisonPanel({
	source,
	selection,
	onChange,
}: {
	source: Item
	selection: ComparisonSelection
	onChange: (next: ComparisonSelection) => void
}) {
	const t = useTranslations()
	const locale = getLocale()

	const targetPath = parseListingPath(selection.targetUrl)
	const targetUrl =
		targetPath && validateComparisonTarget(source, targetPath) === 'ok'
			? targetPath.githubUrl
			: null

	return (
		<div className="space-y-4">
			<Card.Root className="py-1">
				<NumericVariantsCard
					numericVariants={selection.sharpening}
					onChange={(v) =>
						onChange({
							...selection,
							sharpening: clampSharpening(v),
						})
					}
					withCard={false}
				/>
				<p className="pb-2 text-muted-foreground text-xs">
					{t('items.comparison.sharpeningNote')}
				</p>
			</Card.Root>

			<div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
				<div className="min-w-0 space-y-4">
					<ItemSummary item={source} locale={locale} pinned />
					<ItemStats
						item={source}
						locale={locale}
						sharpening={selection.sharpening}
					/>
				</div>

				<div className="min-w-0">
					{targetUrl ? (
						<TargetColumn
							locale={locale}
							onReset={() =>
								onChange({ ...selection, targetUrl: null })
							}
							sharpening={selection.sharpening}
							source={source}
							targetUrl={targetUrl}
						/>
					) : (
						<TargetPicker
							locale={locale}
							onPick={(url) =>
								onChange({ ...selection, targetUrl: url })
							}
							source={source}
						/>
					)}
				</div>
			</div>
		</div>
	)
}

export function ItemComparison({
	item,
	githubUrl,
	initialSharpening = 0,
}: ItemComparisonProps) {
	const t = useTranslations()
	const [stored, setStored] = useState<ComparisonSelection>(() =>
		createSelection(githubUrl, initialSharpening)
	)
	const selection = resolveSelection(stored, githubUrl, initialSharpening)

	return (
		<Modal.Root>
			<Modal.Trigger className="w-full" variant="outline">
				<Icon
					className="mr-2 text-lg"
					icon="lucide:git-compare-arrows"
				/>
				{t('items.comparison.button')}
			</Modal.Trigger>
			<Modal.Content className="flex flex-col sm:max-h-[90dvh] sm:w-full sm:max-w-6xl">
				<Modal.Header className="pr-12">
					<Modal.Title>{t('items.comparison.title')}</Modal.Title>
				</Modal.Header>
				<Modal.Body className="min-h-0 flex-1 overflow-y-auto">
					<ComparisonPanel
						onChange={setStored}
						selection={selection}
						source={item}
					/>
				</Modal.Body>
			</Modal.Content>
		</Modal.Root>
	)
}
