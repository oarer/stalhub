'use client'

import { Icon } from '@iconify/react'
import { useQueries } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import {
	type ReactNode,
	useCallback,
	useEffect,
	useId,
	useMemo,
	useState,
} from 'react'
import { mtsExtended } from '@/app/fonts'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Skeleton'
import { Switch } from '@/components/ui/Switch'
import { itemQueries } from '@/queries/item/item.queries'
import type { Locale } from '@/types/item.type'
import { messageToString } from '@/utils/itemUtils'
import { ComparisonTable } from './components/comparison/ComparisonTable'
import {
	buildComparisonSections,
	countDifferences,
} from './components/comparison/comparisonStats'
import { ItemPickerDialog } from './components/comparison/ItemPickerDialog'
import { ItemSlot } from './components/comparison/ItemSlot'
import {
	type ComparisonState,
	clampSharpening,
	type ListingPath,
	MAX_COMPARISON_ITEMS,
	MAX_SHARPENING,
	parseComparisonState,
	serializeComparisonState,
} from './components/itemComparisonUtils'

type PickerTarget = number | 'new' | null

function Notice({
	icon,
	text,
	onRetry,
	onAction,
	actionLabel,
}: {
	icon: string
	text: string
	onRetry?: () => void
	onAction?: () => void
	actionLabel?: string
}) {
	const t = useTranslations()

	return (
		<Card.Root className="items-center justify-center gap-3 py-12 text-center">
			<Icon className="text-4xl text-muted-foreground" icon={icon} />
			<p className="max-w-md font-medium text-sm">{text}</p>
			{(onRetry || onAction) && (
				<div className="flex flex-wrap justify-center gap-2">
					{onAction && actionLabel && (
						<Button onClick={onAction} size="sm">
							<Icon className="mr-2" icon="lucide:plus" />
							{actionLabel}
						</Button>
					)}
					{onRetry && (
						<Button onClick={onRetry} size="sm" variant="outline">
							<Icon className="mr-2" icon="lucide:refresh-cw" />
							{t('items.comparison.retry')}
						</Button>
					)}
				</div>
			)}
		</Card.Root>
	)
}

const SKELETON_KEYS = ['a', 'b', 'c', 'd']

function ComparisonSkeleton({ count }: { count: number }) {
	return (
		<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
			{SKELETON_KEYS.slice(0, count).map((key) => (
				<Card.Root key={key}>
					<Skeleton className="h-5 w-32" />
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-4/5" />
					<Skeleton className="h-4 w-3/5" />
				</Card.Root>
			))}
		</div>
	)
}

export default function ItemComparisonView() {
	const t = useTranslations()
	const searchParams = useSearchParams()
	const locale = useLocale() as Locale
	const sharpeningId = useId()

	const [state, setState] = useState<ComparisonState>(() =>
		parseComparisonState(searchParams)
	)
	const [pickerTarget, setPickerTarget] = useState<PickerTarget>(null)
	const [onlyDifferences, setOnlyDifferences] = useState(false)

	const search = searchParams.toString()

	useEffect(() => {
		setState(parseComparisonState(new URLSearchParams(search)))
	}, [search])

	useEffect(() => {
		const onPopState = () => {
			setState(
				parseComparisonState(
					new URLSearchParams(window.location.search)
				)
			)
		}

		window.addEventListener('popstate', onPopState)
		return () => window.removeEventListener('popstate', onPopState)
	}, [])

	const applyState = useCallback((next: ComparisonState) => {
		setState(next)

		if (typeof window === 'undefined') return

		const query = serializeComparisonState(next)
		window.history.replaceState(
			window.history.state,
			'',
			`${window.location.pathname}${query ? `?${query}` : ''}`
		)
	}, [])

	const queries = useQueries({
		queries: state.items.map((ref) => ({
			...itemQueries.byGithubUrl(ref.githubUrl),
			enabled: true,
		})),
	})
	const items = useMemo(() => queries.map((query) => query.data), [queries])

	const roots = new Set(
		[
			...state.items.map((item) => item.category),
			...items
				.filter((item): item is NonNullable<typeof item> => !!item)
				.map((item) => item.category),
		]
			.filter(Boolean)
			.map((category) => category.split('/')[0])
	)
	const mismatch = roots.size > 1

	const loadedItems = useMemo(
		() => items.filter((item): item is NonNullable<typeof item> => !!item),
		[items]
	)
	const allLoaded = items.length > 0 && loadedItems.length === items.length

	const sections = useMemo(
		() =>
			allLoaded && !mismatch
				? buildComparisonSections(loadedItems, state.sharpening, locale)
				: [],
		[allLoaded, mismatch, loadedItems, state.sharpening, locale]
	)

	const diffCount = useMemo(() => countDifferences(sections), [sections])

	const columns = state.items.map((ref, index) => ({
		key: ref.githubUrl,
		name:
			(items[index] ? messageToString(items[index].name, locale) : '') ||
			ref.id,
	}))

	const pickerSource: ListingPath | null =
		pickerTarget === 'new'
			? (state.items[0] ?? null)
			: typeof pickerTarget === 'number'
				? (state.items.find((_, index) => index !== pickerTarget) ??
					null)
				: null

	const handlePick = (ref: ListingPath) => {
		if (pickerTarget === null) return

		if (pickerTarget === 'new') {
			applyState({
				...state,
				items: [...state.items, ref].slice(0, MAX_COMPARISON_ITEMS),
			})
		} else {
			applyState({
				...state,
				items: state.items.map((item, index) =>
					index === pickerTarget ? ref : item
				),
			})
		}

		setPickerTarget(null)
	}

	const handleRemove = (index: number) => {
		applyState({
			...state,
			items: state.items.filter((_, itemIndex) => itemIndex !== index),
		})
	}

	const handleClear = () => applyState({ items: [], sharpening: 0 })

	const handleSharpening = (value: string) =>
		applyState({
			...state,
			sharpening: clampSharpening(Number(value)),
		})

	const retryItems = () => {
		for (const query of queries) void query.refetch()
	}

	let content: ReactNode

	if (mismatch) {
		content = (
			<Notice
				actionLabel={t('items.comparison.change')}
				icon="lucide:ban"
				onAction={() => setPickerTarget(0)}
				text={t('items.comparison.categoryMismatch')}
			/>
		)
	} else if (state.items.length < 2) {
		content = (
			<Notice
				actionLabel={t('items.comparison.addItem')}
				icon="lucide:git-compare"
				onAction={() => setPickerTarget('new')}
				text={
					state.items.length > 0
						? t('items.comparison.selectSecond')
						: t('items.comparison.selectFirst')
				}
			/>
		)
	} else if (queries.some((query) => query.isPending)) {
		content = <ComparisonSkeleton count={state.items.length} />
	} else if (queries.some((query) => query.isError) || !allLoaded) {
		content = (
			<Notice
				icon="lucide:triangle-alert"
				onRetry={retryItems}
				text={t('items.comparison.itemError')}
			/>
		)
	} else if (sections.length === 0) {
		content = (
			<Notice
				icon="lucide:package-x"
				text={t('items.comparison.noStats')}
			/>
		)
	} else if (onlyDifferences && diffCount === 0) {
		content = (
			<Notice
				icon="lucide:check-check"
				text={t('items.comparison.noDifferences')}
			/>
		)
	} else {
		content = (
			<ComparisonTable
				items={columns}
				onlyDifferences={onlyDifferences}
				sections={sections}
			/>
		)
	}

	return (
		<section className="mx-auto max-w-360 space-y-6 px-4 pt-32 pb-12 md:px-8 lg:pt-36">
			<header className="space-y-2">
				<div className="flex flex-wrap items-end justify-between gap-3">
					<h1
						className={`${mtsExtended.className} font-semibold text-2xl md:text-3xl`}
					>
						{t('items.comparison.title')}
					</h1>
					{state.items.length > 0 && (
						<Button onClick={handleClear} size="sm" variant="ghost">
							<Icon className="mr-2" icon="lucide:trash-2" />
							{t('items.comparison.clear')}
						</Button>
					)}
				</div>
			</header>

			<Card.Root className="gap-4">
				<div className="flex flex-wrap gap-3">
					{state.items.map((ref, index) => (
						<div
							className="min-w-60 flex-1 basis-64"
							key={ref.githubUrl}
						>
							<ItemSlot
								isError={queries[index]?.isError ?? false}
								isFetching={queries[index]?.isFetching ?? false}
								isPending={queries[index]?.isPending ?? false}
								item={items[index]}
								label={t('items.comparison.slotLabel', {
									index: index + 1,
								})}
								locale={locale}
								onPick={() => setPickerTarget(index)}
								onRemove={() => handleRemove(index)}
								onRetry={() => void queries[index]?.refetch()}
								refValue={ref}
							/>
						</div>
					))}

					{state.items.length < MAX_COMPARISON_ITEMS && (
						<div className="min-w-60 flex-1 basis-64">
							<ItemSlot
								isError={false}
								isFetching={false}
								isPending={false}
								item={undefined}
								label={t('items.comparison.slotLabel', {
									index: state.items.length + 1,
								})}
								locale={locale}
								onPick={() => setPickerTarget('new')}
								onRemove={() => undefined}
								onRetry={() => undefined}
								refValue={null}
							/>
						</div>
					)}
				</div>

				<div className="flex flex-wrap items-center justify-between gap-3 border-muted border-t pt-3">
					<label
						className="flex items-center gap-2 font-medium text-sm"
						htmlFor={sharpeningId}
					>
						{t('ui.input_sharpening')}
						<Input
							className="w-20 px-2"
							id={sharpeningId}
							max={MAX_SHARPENING}
							min={0}
							onChange={(e) => handleSharpening(e.target.value)}
							type="number"
							value={state.sharpening}
						/>
					</label>

					<Switch
						checked={onlyDifferences}
						label={t('items.comparison.onlyDifferences')}
						onCheckedChange={setOnlyDifferences}
					/>
				</div>

				<p className="text-muted-foreground text-xs">
					{t('items.comparison.sharpeningNote')}
				</p>
			</Card.Root>

			{content}

			<ItemPickerDialog
				exclude={state.items}
				locale={locale}
				onOpenChange={(open) => {
					if (!open) setPickerTarget(null)
				}}
				onPick={handlePick}
				open={pickerTarget !== null}
				source={pickerSource}
				title={t('items.comparison.pickItem')}
			/>
		</section>
	)
}
