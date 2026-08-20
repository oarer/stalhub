'use client'

import { Icon } from '@iconify/react'
import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { unbounded } from '@/app/fonts'
import { Button } from '@/components/ui/Button'
import { Combobox } from '@/components/ui/Combobox'
import Input from '@/components/ui/Input'
import {
	BUILD_SORTS,
	BUILD_TAGS,
	type BuildSort,
} from '@/constants/builds.const'
import { buildApiQueries } from '@/queries/build-api/build-api.queries'
import { itemsQueries } from '@/queries/calcs/items.queries'
import { BuildCard } from '@/views/me/components/BuildCard'

export default function BuildsPublicView() {
	const [page, setPage] = useState(1)
	const [selectedTags, setSelectedTags] = useState<string[]>([])
	const [sort, setSort] = useState<BuildSort>('newest')
	const [priceMinDraft, setPriceMinDraft] = useState('')
	const [priceMaxDraft, setPriceMaxDraft] = useState('')
	const [priceMin, setPriceMin] = useState<number | undefined>()
	const [priceMax, setPriceMax] = useState<number | undefined>()
	const take = 20
	const t = useTranslations()

	const tagOptions = BUILD_TAGS.map((tag) => ({
		value: tag,
		label: `builds.tags.${tag}`,
	}))

	useEffect(() => {
		const timeout = setTimeout(() => {
			setPage(1)
			setPriceMin(priceMinDraft ? Number(priceMinDraft) : undefined)
			setPriceMax(priceMaxDraft ? Number(priceMaxDraft) : undefined)
		}, 500)
		return () => clearTimeout(timeout)
	}, [priceMinDraft, priceMaxDraft])

	const { data } = useQuery(
		buildApiQueries.list({
			take,
			page,
			tags: selectedTags,
			sort,
			priceMin,
			priceMax,
		})
	)
	const { data: artifacts } = useSuspenseQuery(
		itemsQueries.get({ type: 'artefact' })
	)
	const { data: armorItems } = useSuspenseQuery(
		itemsQueries.get({ type: 'armor' })
	)
	const { data: containers } = useSuspenseQuery(
		itemsQueries.get({ type: 'containers' })
	)

	const builds = data?.data ?? []
	const totalPages = data ? Math.ceil(data.total / take) : 1

	return (
		<section className="mx-auto max-w-380 space-y-6 px-4 pt-32 pb-12 sm:px-6">
			<div className="flex items-center justify-between">
				<h1 className={`${unbounded.className} font-bold text-3xl`}>
					{t('buildsPublic.title')}
				</h1>
				<span className="font-semibold text-sm text-text-accent">
					{t('buildsPublic.total', { count: data?.total ?? 0 })}
				</span>
			</div>

			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="flex flex-wrap items-center gap-3">
					<Combobox
						className="w-44"
						multiple
						onValuesChange={(values) => {
							setPage(1)
							setSelectedTags(values)
						}}
						options={tagOptions}
						placeholder="buildsPublic.tagsPlaceholder"
						values={selectedTags}
					/>

					<div className="flex items-center gap-2">
						<span className="font-semibold text-sm text-text-accent">
							{t('buildsPublic.price')}
						</span>
						<Input
							className="w-28"
							label="buildsPublic.priceFrom"
							min={0}
							onChange={(e) => setPriceMinDraft(e.target.value)}
							type="number"
						/>
						<span className="text-sm text-text-accent">—</span>
						<Input
							className="w-28"
							label="buildsPublic.priceTo"
							min={0}
							onChange={(e) => setPriceMaxDraft(e.target.value)}
							type="number"
						/>
					</div>
				</div>

				<div className="flex items-center gap-2">
					<span className="font-semibold text-sm text-text-accent">
						{t('buildsPublic.sort')}
					</span>
					{BUILD_SORTS.map((value) => (
						<Button
							key={value}
							onClick={() => {
								setPage(1)
								setSort(value)
							}}
							size="sm"
							variant={sort === value ? 'primary' : 'secondary'}
						>
							{t(`buildsPublic.sort_${value}`)}
						</Button>
					))}
				</div>
			</div>

			{builds.length === 0 ? (
				<p className="font-semibold text-sm text-text-accent">
					{t('me.builds.noBuilds')}
				</p>
			) : (
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
					{builds.map((build) => (
						<BuildCard
							armorItems={armorItems}
							artifacts={artifacts}
							build={build}
							containers={containers}
							key={build.id}
						/>
					))}
				</div>
			)}

			{totalPages > 1 && (
				<div className="flex items-center justify-center gap-2">
					<Button
						disabled={page <= 1}
						onClick={() => setPage((p) => p - 1)}
						size="sm"
						variant="outline"
					>
						<Icon icon="lucide:chevron-left" />
					</Button>
					<span className="text-sm text-text-accent">
						{page} / {totalPages}
					</span>
					<Button
						disabled={page >= totalPages}
						onClick={() => setPage((p) => p + 1)}
						size="sm"
						variant="outline"
					>
						<Icon icon="lucide:chevron-right" />
					</Button>
				</div>
			)}
		</section>
	)
}
