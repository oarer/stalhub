'use client'

import { Icon } from '@iconify/react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { mtsExtended } from '@/app/fonts'
import { Button } from '@/components/ui/Button'
import { resolveImageUrl } from '@/lib/imageUrl'
import type { AwardResultsCategory } from '@/types/awards.type'

export function ResultsCategorySelect({
	categories,
	onStartCategory,
	onStartOverall,
}: {
	categories: AwardResultsCategory[]
	onStartCategory: (slug: string) => void
	onStartOverall: () => void
}) {
	const t = useTranslations('awards')

	return (
		<div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
			<div className="flex flex-col gap-2 text-center">
				<span className="text-primary text-xs font-semibold tracking-[0.24em] uppercase">
					{t('results.ceremony')}
				</span>
				<h2
					className={`${mtsExtended.className} text-3xl font-semibold tracking-tight sm:text-4xl`}
				>
					{t('results.selectStart')}
				</h2>
			</div>

			<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
				{categories.map((category) => {
					const image = resolveImageUrl(category.image_url)

					return (
						<button
							className="group border-border/70 bg-card/60 hover:border-primary/50 flex flex-col overflow-hidden rounded-2xl border text-left transition-colors"
							key={category.id}
							onClick={() => onStartCategory(category.slug)}
							type="button"
						>
							<div className="bg-muted relative aspect-video w-full overflow-hidden">
								{image ? (
									<Image
										alt={category.title}
										className="object-cover transition-transform duration-500 group-hover:scale-105"
										fill
										sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
										src={image}
									/>
								) : (
									<div className="flex size-full items-center justify-center">
										<Icon
											className="text-primary text-4xl"
											icon="lucide:trophy"
										/>
									</div>
								)}
							</div>
							<div className="flex items-center justify-between gap-3 p-4">
								<p className="truncate text-sm font-medium">
									{category.title}
								</p>
								<Icon
									className="text-muted-foreground shrink-0 transition-transform group-hover:translate-x-0.5"
									icon="lucide:chevron-right"
								/>
							</div>
						</button>
					)
				})}
			</div>

			<Button
				className="mx-auto"
				onClick={onStartOverall}
				variant="secondary"
			>
				<Icon icon="lucide:trophy" />
				{t('results.overall')}
			</Button>
		</div>
	)
}
