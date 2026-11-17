'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'
import { CheckBox } from '@/components/ui/CheckBox'
import { Combobox } from '@/components/ui/Combobox'
import type { FeedCategory, FeedContentType, FeedSort } from '@/types/feed.type'
import { FEED_CONTENT_TYPES } from '@/types/feed.type'

interface FeedFiltersProps {
	categories: FeedCategory[]
	categoryIds: number[]
	sort: FeedSort
	types: FeedContentType[]
	onCategoriesChange: (ids: number[]) => void
	onSortChange: (sort: FeedSort) => void
	onTypeChange: (type: FeedContentType, checked: boolean) => void
}

export function FeedFilters({
	categories,
	categoryIds,
	sort,
	types,
	onCategoriesChange,
	onSortChange,
	onTypeChange,
}: FeedFiltersProps) {
	const t = useTranslations()

	return (
		<aside className="flex flex-col gap-4 lg:sticky lg:top-32 lg:self-start">
			<div className="rounded-2xl border border-primary/20 bg-card/40 p-5">
				<h2 className="mb-4 font-semibold text-base">
					{t('feed.filters.title')}
				</h2>
				<div className="flex flex-col gap-3">
					<span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
						{t('feed.filters.label')}
					</span>
					{FEED_CONTENT_TYPES.map((value) => (
						<CheckBox
							checked={types.includes(value)}
							id={`feed-type-${value}`}
							key={value}
							label={t(`feed.filters.${value}`)}
							onCheckedChange={(checked) =>
								onTypeChange(value, checked)
							}
							size="sm"
						/>
					))}
				</div>
				{categories.length > 0 && (
					<div className="mt-5 flex flex-col gap-2 border-primary/10 border-t pt-4">
						<span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
							{t('feed.categories.label')}
						</span>
						<Combobox
							emptyText="feed.categories.empty"
							maxTagCount={1}
							multiple
							onValuesChange={(values) =>
								onCategoriesChange(values.map(Number))
							}
							options={categories.map((category) => ({
								value: String(category.id),
								label: category.name,
							}))}
							placeholder="feed.categories.placeholder"
							searchPlaceholder="feed.categories.search"
							translateOptions={false}
							values={categoryIds.map(String)}
						/>
					</div>
				)}
				<div className="mt-5 flex flex-col gap-2 border-primary/10 border-t pt-4">
					<span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
						{t('feed.sort.label')}
					</span>
					<div className="grid grid-cols-2 gap-2">
						{(['new', 'top'] as const).map((value) => (
							<Button
								key={value}
								onClick={() => onSortChange(value)}
								size="sm"
								variant={sort === value ? 'secondary' : 'ghost'}
							>
								{t(`feed.sort.${value}`)}
							</Button>
						))}
					</div>
				</div>
			</div>
		</aside>
	)
}
