'use client'

import { Icon } from '@iconify/react'
import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { montserrat, unbounded } from '@/app/fonts'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { CLink } from '@/components/ui/Link'
import { Pagination } from '@/components/ui/Pagination'
import { Skeleton } from '@/components/ui/Skeleton'
import { tierListQueries } from '@/queries/tier-list/tier-list.queries'
import { useAuthStore } from '@/stores/useAuth.store'
import { TierItemKind, TierListKind } from '@/types/tier-list.type'

const WEAPON_CATEGORIES: Array<{ key: string; labelKey: string }> = [
	{ key: 'general', labelKey: 'tierlists.categories.general' },
	{ key: 'assault_rifle', labelKey: 'tierlists.categories.assault_rifle' },
	{ key: 'sniper_rifle', labelKey: 'tierlists.categories.sniper_rifle' },
	{ key: 'shotgun_rifle', labelKey: 'tierlists.categories.shotgun_rifle' },
	{ key: 'submachine_gun', labelKey: 'tierlists.categories.submachine_gun' },
	{ key: 'machine_gun', labelKey: 'tierlists.categories.machine_gun' },
	{ key: 'pistol', labelKey: 'tierlists.categories.pistol' },
]

export default function TierListsView({ mine = false }: { mine?: boolean }) {
	const t = useTranslations()
	const user = useAuthStore((s) => s.user)
	const [page, setPage] = useState(1)
	const [kindFilter, setKindFilter] = useState<string | undefined>()
	const [itemKindFilter, setItemKindFilter] = useState<string | undefined>()
	const [categoryFilter, setCategoryFilter] = useState<string | undefined>()

	const updateFilter = (
		setter: (value: undefined | string) => void,
		value: undefined | string
	) => {
		setter(value)
		setPage(1)
	}

	const { data, isLoading } = useQuery(
		mine
			? tierListQueries.listMine({ take: 50, page })
			: tierListQueries.list({
					take: 24,
					page,
					kind: kindFilter,
					item_kind: itemKindFilter,
					category: categoryFilter,
				})
	)

	return (
		<section
			className={
				mine
					? 'flex flex-col gap-8'
					: 'mx-auto flex max-w-380 flex-col gap-8 px-4 pt-32 pb-12 md:px-8 xl:pt-36'
			}
		>
			<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
				<h1 className={`${unbounded.className} font-bold text-3xl`}>
					{t('tierlists.title')}
				</h1>
				{(user || mine) && (
					<CLink
						className="gap-2"
						href="/me/tierlists/new"
						variant={'outline'}
					>
						<Icon className="size-4" icon="lucide:plus" />
						{t('tierlists.create')}
					</CLink>
				)}
			</div>

			<div className="flex flex-wrap gap-3">
				<div className="flex gap-2">
					<Button
						onClick={() => updateFilter(setKindFilter, undefined)}
						size="sm"
						variant={!kindFilter ? 'primary' : 'outline'}
					>
						{t('tierlists.all')}
					</Button>
					<Button
						onClick={() =>
							updateFilter(setKindFilter, TierListKind.SYSTEM)
						}
						size="sm"
						variant={
							kindFilter === TierListKind.SYSTEM
								? 'primary'
								: 'outline'
						}
					>
						{t('tierlists.system')}
					</Button>
					<Button
						onClick={() =>
							updateFilter(setKindFilter, TierListKind.USER)
						}
						size="sm"
						variant={
							kindFilter === TierListKind.USER
								? 'primary'
								: 'outline'
						}
					>
						{t('tierlists.user')}
					</Button>
				</div>
				<div className="flex gap-2">
					<Button
						onClick={() =>
							updateFilter(setItemKindFilter, undefined)
						}
						size="sm"
						variant={!itemKindFilter ? 'primary' : 'outline'}
					>
						{t('tierlists.allItems')}
					</Button>
					<Button
						onClick={() =>
							updateFilter(setItemKindFilter, TierItemKind.WEAPON)
						}
						size="sm"
						variant={
							itemKindFilter === TierItemKind.WEAPON
								? 'primary'
								: 'outline'
						}
					>
						{t('tierlists.weapons')}
					</Button>
					<Button
						onClick={() =>
							updateFilter(setItemKindFilter, TierItemKind.ARMOR)
						}
						size="sm"
						variant={
							itemKindFilter === TierItemKind.ARMOR
								? 'primary'
								: 'outline'
						}
					>
						{t('tierlists.armor')}
					</Button>
				</div>
			</div>

			<div className="flex flex-wrap gap-2">
				<Button
					onClick={() => updateFilter(setCategoryFilter, undefined)}
					size="sm"
					variant={!categoryFilter ? 'primary' : 'outline'}
				>
					{t('tierlists.allCategories')}
				</Button>
				{WEAPON_CATEGORIES.map((cat) => (
					<Button
						key={cat.key}
						onClick={() => updateFilter(setCategoryFilter, cat.key)}
						size="sm"
						variant={
							categoryFilter === cat.key ? 'primary' : 'outline'
						}
					>
						{t(cat.labelKey)}
					</Button>
				))}
			</div>

			{isLoading ? (
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{Array.from({ length: 6 }).map((_, i) => (
						<Skeleton className="h-48 rounded-xl" key={i} />
					))}
				</div>
			) : data?.data.length === 0 ? (
				<div className="flex flex-col items-center gap-3 py-16">
					<Icon
						className="size-10 text-text-accent"
						icon="lucide:layout-list"
					/>
					<p className="font-semibold text-sm text-text-accent">
						{t('tierlists.empty')}
					</p>
				</div>
			) : (
				<>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{data?.data.map((tierList) => (
							<CLink
								className="group flex flex-col items-start gap-3 rounded-lg border-2 border-primary/50 bg-card p-4 transition-colors hover:bg-muted"
								href={`/tierlists/${tierList.external_id}`}
								key={tierList.id}
							>
								<div className="flex items-center justify-between gap-2">
									<h2 className="max-w-50 truncate font-semibold text-lg text-text transition-colors group-hover:text-primary">
										{tierList.title}
									</h2>
									{tierList.kind === TierListKind.SYSTEM && (
										<Badge className="shrink-0 gap-2 bg-primary/10 text-primary">
											<Icon
												className="size-3"
												icon="lucide:bot"
											/>
											{t('tierlists.auto')}
										</Badge>
									)}
								</div>
								<div className="flex flex-wrap items-center gap-2 text-text-accent text-xs">
									<Badge variant="secondary">
										{tierList.item_kind ===
										TierItemKind.WEAPON
											? t('tierlists.weapons')
											: t('tierlists.armor')}
									</Badge>
									{tierList.category &&
										WEAPON_CATEGORIES.find(
											(c) => c.key === tierList.category
										) && (
											<Badge variant="secondary">
												{t(
													`tierlists.categories.${tierList.category}`
												)}
											</Badge>
										)}
									<span className="flex items-center gap-1">
										<Icon
											className="size-4"
											icon="lucide:list"
										/>
										{tierList.entry_count ??
											tierList.entries?.length ??
											0}
									</span>
									{tierList.author && (
										<span className="flex items-center gap-1">
											<Icon
												className="size-3"
												icon="lucide:user"
											/>
											{tierList.author.name ||
												tierList.author.username}
										</span>
									)}
									<div className="flex items-center gap-1 text-text-accent">
										<Icon icon="lucide:eye" />
										<span
											className={`${montserrat.className} font-semibold text-xs`}
										>
											{tierList.views}
										</span>
									</div>
								</div>
							</CLink>
						))}
					</div>

					{data && data.total_count > (mine ? 50 : 24) && (
						<div className="flex justify-center">
							<Pagination
								onPageChange={setPage}
								page={page}
								totalPages={Math.ceil(
									data.total_count / (mine ? 50 : 24)
								)}
							/>
						</div>
					)}
				</>
			)}
		</section>
	)
}
