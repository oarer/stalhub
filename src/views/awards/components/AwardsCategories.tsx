'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { mtsExtended } from '@/app/fonts'
import type { AwardCategory, AwardResults } from '@/types/awards.type'
import { CategoryCard } from './CategoryCard'
import ResultsShowcase from './ResultsShowcase'

export function AwardsCategories({
	published,
	categories,
	activeSlug,
	onSelect,
	onActiveChange,
	results,
	resultsPending,
	resultsError,
}: {
	published: boolean
	categories: AwardCategory[]
	activeSlug: string
	onSelect: (slug: string) => void
	onActiveChange: (slug: string) => void
	results: AwardResults | undefined
	resultsPending: boolean
	resultsError: boolean
}) {
	const t = useTranslations()
	const featured = categories.slice(0, 3)
	const rest = categories.slice(3)

	return (
		<div className="flex w-full flex-col gap-5">
			<div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
				<p className="text-primary text-xs font-semibold tracking-[0.2em] uppercase">
					{published
						? t('awards.results.title')
						: t('awards.categories')}
				</p>
				<h2
					className={`${mtsExtended.className} mt-1 text-2xl font-semibold tracking-tight sm:text-3xl`}
				>
					{published
						? t('awards.results.categoriesTitle')
						: t('awards.chooseCategory')}
				</h2>
			</div>

			{published ? (
				resultsPending ? (
					<div className="text-muted-foreground flex min-h-48 items-center justify-center gap-3">
						<Icon
							className="text-primary animate-spin text-2xl"
							icon="lucide:loader-circle"
						/>
						{t('awards.loading')}
					</div>
				) : resultsError ? (
					<p className="text-muted-foreground rounded-2xl border p-6 text-center">
						{t('awards.loadError')}
					</p>
				) : results ? (
					<ResultsShowcase
						activeSlug={activeSlug}
						onSelect={onSelect}
						results={results}
					/>
				) : null
			) : (
				<>
					<div className="grid gap-4 md:grid-cols-3">
						{featured.map((category) => (
							<CategoryCard
								active={category.slug === activeSlug}
								category={category}
								key={category.id}
								onCardClick={() =>
									onActiveChange(category.slug)
								}
								onVote={() => onSelect(category.slug)}
							/>
						))}
					</div>
					{rest.length > 0 && (
						<div className="border-border/70 mt-2 border-t pt-8">
							<p className="text-muted-foreground mb-6 text-center text-xs font-semibold tracking-[0.2em] uppercase">
								{t('awards.otherCategories')}
							</p>
							<div className="flex w-full flex-wrap gap-x-4 gap-y-6 sm:gap-x-5">
								{rest.map((category) => (
									<CategoryCard
										active={category.slug === activeSlug}
										category={category}
										className="min-w-0 grow basis-[calc(50%_-_0.5rem)] sm:basis-[calc(33.333%_-_0.833rem)] lg:basis-[calc(25%_-_0.9375rem)]"
										key={category.id}
										onCardClick={() =>
											onActiveChange(category.slug)
										}
										onVote={() => onSelect(category.slug)}
										variant="compact"
									/>
								))}
							</div>
						</div>
					)}
				</>
			)}
		</div>
	)
}
