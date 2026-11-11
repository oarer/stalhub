'use client'

import { Icon } from '@iconify/react'
import Image from 'next/image'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useState } from 'react'
import { mtsExtended } from '@/app/fonts'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Skeleton'
import { useSearchItem } from '@/hooks/useSearchItem'
import { getLocale } from '@/lib/getLocale'
import { getItemIcon } from '@/lib/itemIcon'
import type { ItemListing } from '@/types/api.type'
import { infoColorMap } from '@/types/item.type'

const CATEGORY_ORDER = [
	'weapon',
	'armor',
	'artefact',
	'attachment',
	'device',
	'containers',
	'supply',
	'other',
	'backpacks',
	'weapon_modules',
	'bullet',
	'grenade',
	'medicine',
] as const

const GROUPED_CATEGORIES = new Set(['misc', 'custom', 'other'])

const CATEGORY_ICONS: Record<string, string> = {
	weapon: 'lucide:crosshair',
	armor: 'lucide:shield',
	attachment: 'lucide:puzzle',
	artefact: 'lucide:gem',
	supply: 'lucide:flask-conical',
	bullet: 'lucide:target',
	grenade: 'lucide:bomb',
	containers: 'lucide:box',
	backpacks: 'lucide:backpack',
	weapon_modules: 'lucide:cog',
	medicine: 'lucide:pill',
	device: 'lucide:cpu',
	other: 'lucide:package',
}

const CATEGORY_FALLBACK_LABELS: Record<string, string> = {
	weapon: 'Оружие',
	armor: 'Броня',
	attachment: 'Обвесы',
	artefact: 'Артефакты',
	supply: 'Расходуемые предметы',
	bullet: 'Патроны',
	grenade: 'Гранаты',
	containers: 'Контейнеры',
	backpacks: 'Рюкзаки',
	weapon_modules: 'Модули на оружие',
	medicine: 'Медицина',
	device: 'Устройства',
	other: 'Другое',
}

function itemName(item: ItemListing, locale: ReturnType<typeof getLocale>) {
	return (
		item.name?.[locale] ??
		item.data
			.replace(/\.json$/, '')
			.split('/')
			.pop() ??
		'—'
	)
}

function itemCategory(item: ItemListing) {
	const parts = item.data
		.replace(/\.json$/, '')
		.split('/')
		.filter(Boolean)
	const itemsIndex = parts.indexOf('items')
	const key = (itemsIndex >= 0 ? parts[itemsIndex + 1] : parts[0]) ?? 'other'
	return GROUPED_CATEGORIES.has(key) ? 'other' : key
}

function itemHref(item: ItemListing) {
	const path = item.data.replace(/\.json$/, '')
	return path.startsWith('/') ? path : `/${path}`
}

function ItemCard({
	categoryLabel,
	item,
	locale,
}: {
	categoryLabel: string
	item: ItemListing
	locale: ReturnType<typeof getLocale>
}) {
	const name = itemName(item, locale)

	return (
		<Card.Link
			className="group h-full gap-0 overflow-hidden p-1 ring-1"
			href={itemHref(item)}
		>
			<div className="flex items-center gap-3 p-3">
				<div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-muted/60 p-1">
					<Image
						alt={name}
						className="size-12 object-contain transition-transform duration-300 group-hover:scale-110"
						height={48}
						loading="lazy"
						src={`https://cdn.stalhub.dev/db${getItemIcon(item)}`}
						width={48}
					/>
				</div>
				<div className="min-w-0 flex-1">
					<p
						className="truncate font-semibold text-sm"
						style={{ color: infoColorMap[item.color] }}
					>
						{name}
					</p>
					<p className="text-muted-foreground text-xs">
						{categoryLabel}
					</p>
				</div>
				<Icon
					className="shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
					icon="lucide:arrow-up-right"
				/>
			</div>
		</Card.Link>
	)
}

export default function ItemCatalogView() {
	const t = useTranslations()
	const locale = getLocale()
	const router = useRouter()
	const pathname = usePathname()
	const searchParams = useSearchParams()
	const { items, loading, error, retry } = useSearchItem()

	const selectedCategory = searchParams.get('category')
	const urlQuery = searchParams.get('q') ?? ''
	const [query, setQuery] = useState(urlQuery)

	useEffect(() => {
		setQuery(urlQuery)
	}, [urlQuery])

	const normalizedQuery = query.trim().toLocaleLowerCase()
	const searchParamsString = searchParams.toString()

	const categoryLabel = useMemo(
		() => (key: string) => {
			const labelKey = `items.catalog.categories.${key}`
			return t.has(labelKey)
				? t(labelKey)
				: (CATEGORY_FALLBACK_LABELS[key] ?? key)
		},
		[t]
	)

	const categories = useMemo(() => {
		const grouped = new Map<
			string,
			{ key: string; count: number; icon: string | null }
		>()
		for (const item of items ?? []) {
			const key = itemCategory(item)
			const entry = grouped.get(key)
			if (entry) {
				entry.count += 1
			} else {
				grouped.set(key, {
					key,
					count: 1,
					icon: getItemIcon(item) || null,
				})
			}
		}
		return [...grouped.values()].sort((a, b) => {
			const aIndex = CATEGORY_ORDER.indexOf(
				a.key as (typeof CATEGORY_ORDER)[number]
			)
			const bIndex = CATEGORY_ORDER.indexOf(
				b.key as (typeof CATEGORY_ORDER)[number]
			)
			if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex
			if (aIndex !== -1) return -1
			if (bIndex !== -1) return 1
			return b.count - a.count || a.key.localeCompare(b.key)
		})
	}, [items])

	const searchResults = useMemo(() => {
		if (!normalizedQuery) return []
		return (items ?? []).filter((item) =>
			`${itemName(item, locale)} ${item.data}`
				.toLocaleLowerCase()
				.includes(normalizedQuery)
		)
	}, [items, locale, normalizedQuery])

	const selectedItems = useMemo(() => {
		if (!selectedCategory) return []
		return (items ?? []).filter(
			(item) => itemCategory(item) === selectedCategory
		)
	}, [items, selectedCategory])

	const navigate = (params: URLSearchParams, replace: boolean) => {
		const queryString = params.toString()
		const url = queryString ? `${pathname}?${queryString}` : pathname
		if (replace) {
			router.replace(url, { scroll: false })
		} else {
			router.push(url)
		}
	}

	const selectCategory = (category: string) => {
		const params = new URLSearchParams(searchParamsString)
		params.set('category', category)
		params.delete('q')
		setQuery('')
		navigate(params, false)
	}

	const resetCatalog = () => {
		setQuery('')
		navigate(new URLSearchParams(), false)
	}

	const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const value = event.target.value
		setQuery(value)
		const params = new URLSearchParams(searchParamsString)
		if (value.trim()) {
			params.set('q', value)
			params.delete('category')
		} else {
			params.delete('q')
		}
		navigate(params, true)
	}

	const renderItems = (list: ItemListing[]) => (
		<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{list.map((item) => (
				<ItemCard
					categoryLabel={categoryLabel(itemCategory(item))}
					item={item}
					key={item.data}
					locale={locale}
				/>
			))}
		</div>
	)

	const emptyState = (
		<Card.Root className="items-center gap-2 py-16 text-center">
			<Icon
				className="text-4xl text-muted-foreground"
				icon="lucide:search-x"
			/>
			<p className="font-semibold">{t('items.catalog.empty')}</p>
		</Card.Root>
	)

	return (
		<section className="mx-auto flex max-w-380 flex-col gap-6 px-4 pt-32 pb-12 md:px-8 xl:pt-36">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<h1
					className={`${mtsExtended.className} font-semibold text-3xl`}
				>
					{t('items.catalog.title')}
				</h1>
				{selectedCategory && (
					<Button
						className="gap-2"
						onClick={resetCatalog}
						variant={'secondary'}
					>
						<Icon icon="lucide:arrow-left" />
						{t('items.catalog.backToCategories')}
					</Button>
				)}
			</div>

			<div className="relative w-full max-w-sm">
				<Icon
					className="pointer-events-none absolute top-1/2 left-3 z-10 -translate-y-1/2 text-muted-foreground"
					icon="lucide:search"
				/>
				<Input
					aria-label={t('items.catalog.search')}
					className="py-3 pl-10"
					onChange={handleSearchChange}
					placeholder={t('items.catalog.search')}
					value={query}
				/>
			</div>

			{loading && (
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{Array.from({ length: 8 }, (_, index) => (
						<Skeleton className="h-20" key={index} />
					))}
				</div>
			)}

			{error && !loading && (
				<Card.Root className="items-center gap-3 py-12 text-center">
					<Icon
						className="text-4xl text-muted-foreground"
						icon="lucide:database-zap"
					/>
					<p className="font-semibold">{t('items.catalog.error')}</p>
					<button
						className="text-primary text-sm hover:underline"
						onClick={() => retry()}
						type="button"
					>
						{t('items.catalog.retry')}
					</button>
				</Card.Root>
			)}

			{!loading && !error && normalizedQuery && (
				<>
					<div className="flex items-center gap-2">
						<span className="font-semibold">
							{t('items.catalog.searchResults')}
						</span>
						<Badge className="font-mono" variant="secondary">
							{searchResults.length}
						</Badge>
					</div>
					{searchResults.length === 0
						? emptyState
						: renderItems(searchResults)}
				</>
			)}

			{!loading && !error && !normalizedQuery && !selectedCategory && (
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{categories.map(({ key, count, icon }) => (
						<button
							className="group flex items-center gap-4 rounded-xl border border-border/70 bg-card/70 p-4 text-left transition-colors hover:border-primary/60 hover:bg-primary/5"
							key={key}
							onClick={() => selectCategory(key)}
							type="button"
						>
							<div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-muted/50 p-1">
								{icon ? (
									<Image
										alt=""
										className="size-12 object-contain transition-transform duration-300 group-hover:scale-105"
										height={48}
										loading="lazy"
										src={`https://cdn.stalhub.dev/db${icon}`}
										width={48}
									/>
								) : (
									<Icon
										className="text-muted-foreground text-xl"
										icon={
											CATEGORY_ICONS[key] ??
											'lucide:package'
										}
									/>
								)}
							</div>
							<div className="min-w-0">
								<p className="truncate font-semibold text-base">
									{categoryLabel(key)}
								</p>
								<p className="mt-1 truncate text-muted-foreground text-sm">
									{count} {t('items.catalog.itemsCount')}
								</p>
							</div>
						</button>
					))}
				</div>
			)}

			{!loading && !error && !normalizedQuery && selectedCategory && (
				<>
					<div className="flex items-center gap-2">
						<Icon
							className="text-primary"
							icon={
								CATEGORY_ICONS[selectedCategory] ??
								'lucide:package'
							}
						/>
						<span className="font-semibold">
							{categoryLabel(selectedCategory)}
						</span>
						<Badge className="font-mono" variant="secondary">
							{selectedItems.length}
						</Badge>
					</div>
					{selectedItems.length === 0
						? emptyState
						: renderItems(selectedItems)}
				</>
			)}
		</section>
	)
}
