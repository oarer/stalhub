'use client'

import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { HoverCard } from '@/components/ui/HoverCard'
import { cn } from '@/lib/cn'
import { roundNumber } from '@/utils/itemUtils'
import type {
	ComparisonRow,
	ComparisonSection,
	ComparisonSideValue,
} from './comparisonStats'

type ComparisonColumn = {
	key: string
	name: string
}

type ComparisonTableProps = {
	sections: ComparisonSection[]
	items: ComparisonColumn[]
	onlyDifferences: boolean
}

type Highlight = 'best' | 'worst' | null

type Difference = {
	key: string
	name: string
	delta: number
	better: boolean | null
}

const getHighlight = (row: ComparisonRow, index: number): Highlight => {
	if (row.best.includes(index)) return 'best'
	if (row.worst.includes(index)) return 'worst'
	return null
}

const getDifferences = (
	row: ComparisonRow,
	index: number,
	items: ComparisonColumn[]
): Difference[] => {
	const current = row.values[index]?.numeric
	if (current === null || current === undefined) return []

	const differences: Difference[] = []

	for (const [otherIndex, value] of row.values.entries()) {
		if (otherIndex === index) continue
		if (value?.numeric === null || value?.numeric === undefined) continue

		const item = items[otherIndex]
		if (!item) continue

		const rawDelta = value.numeric - current
		const isZero = Math.abs(rawDelta) < 0.005

		differences.push({
			key: item.key,
			name: item.name,
			delta: isZero ? 0 : rawDelta,
			better:
				row.direction === null || isZero
					? null
					: row.direction === 'higher'
						? rawDelta > 0
						: rawDelta < 0,
		})
	}

	return differences
}

const formatDelta = (delta: number): string => {
	if (delta === 0) return '0'
	return `${delta > 0 ? '+' : '-'}${roundNumber(Math.abs(delta))}`
}

const ValueCell = ({
	value,
	highlight,
	label,
	itemName,
	differences,
}: {
	value: ComparisonSideValue | null
	highlight: Highlight
	label: string
	itemName: string
	differences: Difference[]
}) => {
	const t = useTranslations()
	const highlightLabel =
		highlight === 'best'
			? t('items.comparison.best')
			: highlight === 'worst'
				? t('items.comparison.worst')
				: ''

	const cell = (
		<div
			className={cn(
				'flex min-w-0 items-center justify-end rounded-md px-1.5 py-1',
				highlight === 'best' &&
					'bg-emerald-500/10 font-semibold text-emerald-600 dark:text-emerald-400',
				highlight === 'worst' &&
					'bg-destructive/10 font-semibold text-destructive'
			)}
			data-highlight={highlight ?? undefined}
			title={
				differences.length > 0
					? undefined
					: value
						? highlightLabel
							? `${highlightLabel}: ${value.text}`
							: value.text
						: undefined
			}
		>
			<span
				className={cn(
					'min-w-0 truncate font-mono font-semibold text-sm',
					!value && 'text-muted-foreground'
				)}
			>
				{value?.text ?? '—'}
			</span>
			{highlight && <span className="sr-only">{highlightLabel}</span>}
		</div>
	)

	if (differences.length === 0) return cell

	return (
		<HoverCard.Root className="w-full min-w-0">
			<HoverCard.Trigger asChild>{cell}</HoverCard.Trigger>
			<HoverCard.Content align="center" className="w-72" side="bottom">
				<div className="space-y-2">
					<div className="space-y-0.5">
						<p className="font-medium text-sm">{label}</p>
						<p className="text-muted-foreground text-xs">
							{itemName}:{' '}
							<span className="font-mono font-semibold text-foreground">
								{value?.text}
							</span>
						</p>
					</div>

					<div className="border-muted border-t pt-2">
						<p className="mb-1.5 font-medium text-[11px] text-muted-foreground uppercase tracking-wide">
							{t('items.comparison.deltaHint')}
						</p>
						<div className="space-y-1">
							{differences.map((difference) => {
								const betterLabel =
									difference.better === null
										? ''
										: t(
												difference.better
													? 'items.comparison.better'
													: 'items.comparison.worse'
											)

								return (
									<div
										className="flex items-center justify-between gap-3 text-xs"
										key={difference.key}
									>
										<span
											className="truncate text-muted-foreground"
											title={difference.name}
										>
											{difference.name}
										</span>
										<span
											className={cn(
												'shrink-0 font-mono font-semibold',
												difference.better === true &&
													'text-emerald-600 dark:text-emerald-400',
												difference.better === false &&
													'text-destructive'
											)}
										>
											{formatDelta(difference.delta)}
											{betterLabel && (
												<span className="sr-only">
													{' '}
													{betterLabel}
												</span>
											)}
										</span>
									</div>
								)
							})}
						</div>
					</div>
				</div>
			</HoverCard.Content>
		</HoverCard.Root>
	)
}

export function ComparisonTable({
	sections,
	items,
	onlyDifferences,
}: ComparisonTableProps) {
	const t = useTranslations()
	const columns = `minmax(150px, 1.4fr) repeat(${items.length}, minmax(96px, 1fr))`
	const gridStyle = { gridTemplateColumns: columns }

	return (
		<div className="space-y-4">
			{sections.map((section) => {
				const rows = onlyDifferences
					? section.rows.filter((row) => row.changed)
					: section.rows

				if (rows.length === 0) return null

				return (
					<Card.Root className="gap-3" key={section.key}>
						<div className="flex items-center justify-between gap-3">
							<h2 className="font-semibold text-base">
								{section.title ||
									t('items.comparison.statsTitle')}
							</h2>
							<Badge variant="secondary">
								{rows.filter((row) => row.changed).length} /{' '}
								{rows.length}
							</Badge>
						</div>

						<div className="relative overflow-x-auto pb-1">
							<div
								className="min-w-full space-y-1"
								style={{ minWidth: 180 + items.length * 110 }}
							>
								<div
									className="grid items-center gap-2 border-muted border-b px-2 pb-1"
									style={gridStyle}
								>
									<span className="font-medium text-muted-foreground text-xs">
										{t('items.comparison.statsTitle')}
									</span>
									{items.map((item) => (
										<span
											className="truncate text-right font-medium text-muted-foreground text-xs"
											key={item.key}
											title={item.name}
										>
											{item.name}
										</span>
									))}
								</div>

								{rows.map((row) => (
									<div
										className={cn(
											'grid items-center gap-2 rounded-lg px-2 py-1.5 transition-colors',
											row.changed && 'bg-primary/5'
										)}
										data-row={row.key}
										data-stat-key={row.statKey || undefined}
										key={row.key}
										style={gridStyle}
									>
										<p
											className="min-w-0 truncate font-medium text-sm"
											title={row.label}
										>
											{row.label}
										</p>
										{row.values.map((value, index) => (
											<ValueCell
												differences={getDifferences(
													row,
													index,
													items
												)}
												highlight={getHighlight(
													row,
													index
												)}
												itemName={
													items[index]?.name ?? ''
												}
												key={items[index].key}
												label={row.label}
												value={value}
											/>
										))}
									</div>
								))}
							</div>
						</div>
					</Card.Root>
				)
			})}
		</div>
	)
}
