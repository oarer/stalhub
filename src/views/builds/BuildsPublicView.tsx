'use client'

import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { mtsExtended } from '@/app/fonts'
import { Button } from '@/components/ui/Button'
import { Combobox } from '@/components/ui/Combobox'
import Input from '@/components/ui/Input'
import { Pagination } from '@/components/ui/Pagination'
import {
	BUILD_QUALITY_TIERS,
	BUILD_SORTS,
	BUILD_TAGS,
	type BuildSort,
} from '@/constants/builds.const'
import { getLocale } from '@/lib/getLocale'
import { buildApiQueries } from '@/queries/build-api/build-api.queries'
import { itemsQueries } from '@/queries/calcs/items.queries'
import type { Item } from '@/types/item.type'
import { messageToString } from '@/utils/itemUtils'
import { BuildCard } from '@/views/me/components/BuildCard'

export default function BuildsPublicView() {
	const [page, setPage] = useState(1)
	const [selectedTags, setSelectedTags] = useState<string[]>([])
	const [sort, setSort] = useState<BuildSort>('newest')
	const [priceMinDraft, setPriceMinDraft] = useState('')
	const [priceMaxDraft, setPriceMaxDraft] = useState('')
	const [priceMin, setPriceMin] = useState<number | undefined>()
	const [priceMax, setPriceMax] = useState<number | undefined>()
	const [armorFilter, setArmorFilter] = useState<string[]>([])
	const [containerFilter, setContainerFilter] = useState<string[]>([])
	const [artFilter, setArtFilter] = useState<string[]>([])
	const [qualityMinDraft, setQualityMinDraft] = useState('')
	const [qualityMaxDraft, setQualityMaxDraft] = useState('')
	const take = 20
	const locale = getLocale()
	const t = useTranslations()

	const tagOptions = BUILD_TAGS.map((tag) => ({
		value: tag,
		label: `builds.tags.${tag}`,
	}))

	const itemOptions = (items: Item[] | undefined) =>
		(items ?? []).map((item) => ({
			value: item.id,
			label: messageToString(item.name, locale),
		}))

	const qualityOptions = BUILD_QUALITY_TIERS.map((tier, i) => ({
		value: String(i + 1),
		label: `arts.${tier}`,
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
			armor: armorFilter,
			container: containerFilter,
			arts: artFilter,
			qualityMin: qualityMinDraft ? Number(qualityMinDraft) : undefined,
			qualityMax: qualityMaxDraft ? Number(qualityMaxDraft) : undefined,
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
	const totalPages = data ? Math.ceil(data.total_count / take) : 1

	return (
		<section className="mx-auto max-w-380 space-y-6 px-4 pt-32 pb-12 sm:px-6">
			<>
				<h1
					className={`${mtsExtended.className} font-semibold text-[28px] leading-none`}
				>
					{t('buildsPublic.title')}
				</h1>
				<p className="font-medium text-muted-foreground text-sm">
					{t('buildsPublic.total', {
						count: data?.total_count ?? 0,
					})}
				</p>
			</>

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
						<span className="font-medium text-foreground text-sm">
							{t('buildsPublic.price')}
						</span>
						<Input
							className="w-28"
							label="buildsPublic.priceFrom"
							min={0}
							onChange={(e) => setPriceMinDraft(e.target.value)}
							type="number"
						/>
						<span className="text-foreground text-sm">—</span>
						<Input
							className="w-28"
							label="buildsPublic.priceTo"
							min={0}
							onChange={(e) => setPriceMaxDraft(e.target.value)}
							type="number"
						/>
					</div>

					<Combobox
						className="w-48"
						multiple
						onValuesChange={(values) => {
							setPage(1)
							setArmorFilter(values)
						}}
						options={itemOptions(armorItems)}
						placeholder="buildsPublic.filter_armor"
						translateOptions={false}
						values={armorFilter}
					/>

					<Combobox
						className="w-48"
						multiple
						onValuesChange={(values) => {
							setPage(1)
							setContainerFilter(values)
						}}
						options={itemOptions(containers)}
						placeholder="buildsPublic.filter_container"
						translateOptions={false}
						values={containerFilter}
					/>

					<Combobox
						className="w-48"
						multiple
						onValuesChange={(values) => {
							setPage(1)
							setArtFilter(values)
						}}
						options={itemOptions(artifacts)}
						placeholder="buildsPublic.filter_arts"
						translateOptions={false}
						values={artFilter}
					/>

					<div className="flex items-center gap-2">
						<span className="font-medium text-foreground text-sm">
							{t('buildsPublic.quality')}
						</span>
						<Combobox
							className="w-32"
							onValueChange={(value) => {
								setPage(1)
								setQualityMinDraft(value)
							}}
							options={qualityOptions}
							placeholder="buildsPublic.qualityFrom"
							value={qualityMinDraft}
						/>
						<span className="text-foreground text-sm">—</span>
						<Combobox
							className="w-32"
							onValueChange={(value) => {
								setPage(1)
								setQualityMaxDraft(value)
							}}
							options={qualityOptions}
							placeholder="buildsPublic.qualityTo"
							value={qualityMaxDraft}
						/>
					</div>
				</div>

				<div className="flex items-center gap-2">
					<span className="font-medium text-foreground text-sm">
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
				<p className="font-medium text-foreground text-sm">
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

			<Pagination
				labelClassName="font-mono text-foreground text-sm"
				onPageChange={setPage}
				page={page}
				totalPages={totalPages}
			/>
		</section>
	)
}
