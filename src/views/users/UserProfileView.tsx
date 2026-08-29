'use client'

import { useSuspenseQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { Icon } from '@iconify/react'
import ClanCard from '@/components/ui/clan/ClanCard'
import { CLink } from '@/components/ui/Link'
import { itemsQueries } from '@/queries/calcs/items.queries'
import { loadoutQueries } from '@/queries/loadout/loadout.queries'
import { tierListQueries } from '@/queries/tier-list/tier-list.queries'
import { userQueries } from '@/queries/user/user.queries'
import type { Item } from '@/types/item.type'
import { ItemCell } from '@/views/clan/components/squads/ItemCell'
import UserCard from '@/views/me/components/UserCard'
import { ArticleCard } from '../me/components/article/ArticleCard'
import { BuildCard } from '../me/components/BuildCard'
import { HoverBuildCard } from '../me/components/HoverBuildCard'
import UserComments from './components/UserComments'

interface UserProfileViewProps {
	id: number | null
	username: string | null
}

export default function UserProfileView({
	id,
	username,
}: UserProfileViewProps) {
	const t = useTranslations()
	const { data: user } = useSuspenseQuery(
		id !== null
			? userQueries.getUser(id)
			: userQueries.getUserByUsername(username ?? '')
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
	const { data: weapons } = useSuspenseQuery(
		itemsQueries.get({ type: 'weapons' })
	)
	const { data: loadouts } = useSuspenseQuery(
		loadoutQueries.getMany([user.id])
	)
	const { data: tierLists } = useSuspenseQuery(
		tierListQueries.listMine({ take: 10 })
	)
	const loadout = loadouts[0] ?? null

	const bgVariant = user.customization?.card_background ?? 'NONE'
	const bgColor = user.customization?.card_color ?? '#000000'

	const allItems = [...(weapons ?? []), ...(armorItems ?? [])]
	const renderItem = (itemId: string | null) => (
		<ItemCell item={allItems.find((i: Item) => i.id === itemId)} />
	)
	const buildById = new Map((user.builds ?? []).map((b) => [String(b.id), b]))

	return (
		<section className="mx-auto grid max-w-285 grid-cols-1 gap-6 px-4 pt-42 pb-12 md:grid-cols-[27%_70%] md:px-8 xl:pt-36">
			<div className="flex h-fit flex-col gap-4">
				<UserCard
					cardBackground={bgVariant}
					cardColor={bgColor}
					user={user}
				/>
				{user.clan && <ClanCard clan={user.clan} />}
			</div>
			<div className="flex flex-col gap-4">
				{loadout?.data && (
					<section className="flex flex-col gap-3">
						<h2 className="font-semibold text-xl">
							{t('clan.squads.loadoutTitle')}
						</h2>
						<div className="grid grid-cols-1 gap-2 md:grid-cols-2">
							<div className="flex items-center justify-between rounded-lg bg-card p-3">
								<span className="font-semibold text-sm text-text-accent">
									{t(
										'clan.squads.loadoutFields.primaryWeapon'
									)}
								</span>
								{renderItem(loadout.data.weapon_primary)}
							</div>
							<div className="flex items-center justify-between rounded-lg bg-card p-3">
								<span className="font-semibold text-sm text-text-accent">
									{t('users.secondaryWeapon')}
								</span>
								{renderItem(loadout.data.weapon_secondary)}
							</div>
						<div className="flex items-center justify-between rounded-lg bg-card p-3">
							<span className="font-semibold text-sm text-text-accent">
								{t('clan.squads.loadoutFields.pistol')}
							</span>
							{renderItem(loadout.data.weapon_pistol)}
						</div>
						<div className="flex items-center justify-between rounded-lg bg-card p-3">
							<span className="font-semibold text-sm text-text-accent">
								{t('clan.squads.loadoutFields.meleeWeapon')}
							</span>
							{renderItem(loadout.data.weapon_melee)}
						</div>
						<div className="flex items-center justify-between rounded-lg bg-card p-3">
							<span className="font-semibold text-sm text-text-accent">
								{t('clan.squads.loadoutFields.armor')}
								</span>
								{renderItem(loadout.data.armor)}
							</div>
							<div className="flex items-center justify-between rounded-lg bg-card p-3">
								<span className="font-semibold text-sm text-text-accent">
									{t('users.bioArmor')}
								</span>
								{renderItem(loadout.data.bio_armor)}
							</div>
							<div className="flex items-center justify-between rounded-lg bg-card p-3">
								<span className="font-semibold text-sm text-text-accent">
									{t('users.fatBuild')}
								</span>
								{loadout.data.build_fat != null &&
								buildById.get(
									String(loadout.data.build_fat)
								) ? (
									<HoverBuildCard
										armorItems={armorItems}
										artifacts={artifacts}
										build={
											buildById.get(
												String(loadout.data.build_fat)
											)!
										}
										containers={containers}
									>
										<span className="cursor-pointer truncate font-semibold text-primary transition-colors hover:text-text-accent">
											{
												buildById.get(
													String(
														loadout.data.build_fat
													)
												)!.title
											}
										</span>
									</HoverBuildCard>
								) : (
									<span className="text-muted-foreground">
										—
									</span>
								)}
							</div>
							<div className="flex items-center justify-between rounded-lg bg-card p-3">
								<span className="font-semibold text-sm text-text-accent">
									{t('users.speedBuild')}
								</span>
								{loadout.data.build_speed != null &&
								buildById.get(
									String(loadout.data.build_speed)
								) ? (
									<HoverBuildCard
										armorItems={armorItems}
										artifacts={artifacts}
										build={
											buildById.get(
												String(loadout.data.build_speed)
											)!
										}
										containers={containers}
									>
										<span className="cursor-pointer truncate font-semibold text-primary transition-colors hover:text-text-accent">
											{
												buildById.get(
													String(
														loadout.data.build_speed
													)
												)!.title
											}
										</span>
									</HoverBuildCard>
								) : (
									<span className="text-muted-foreground">
										—
									</span>
								)}
							</div>
						</div>
					</section>
				)}

				{user.clan_history?.length > 0 && (
					<section className="flex flex-col gap-3">
						<h2 className="font-semibold text-xl">
							{t('player.clanHistory.title')}
						</h2>
						<div className="flex flex-col gap-2">
							{user.clan_history.map((h) => (
								<div
									className="flex items-center justify-between rounded-lg bg-card p-3"
									key={h.id}
								>
									<div className="flex flex-col gap-0.5">
										<span className="font-semibold text-sm">
											{h.clan_name}
											{h.clan_tag
												? ` [${h.clan_tag}]`
												: ''}
										</span>
										<span className="text-text-accent text-xs">
											{h.rank} · {h.region}
										</span>
									</div>
									<span className="text-text-accent text-xs">
										{h.seen_at.slice(0, 10)}
									</span>
								</div>
							))}
						</div>
					</section>
				)}

				<section className="flex flex-col gap-3">
					<div className="flex items-center justify-between">
						<h2 className="font-semibold text-xl">
							{t('me.builds.title')}
						</h2>
					</div>

					{user.builds.length === 0 ? (
						<p className="font-semibold text-sm text-text-accent">
							{t('me.builds.noBuilds')}
						</p>
					) : (
						<div className="grid grid-cols-1 gap-2 md:grid-cols-2">
							{user.builds.map((build) => (
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
				</section>

				{user.articles.length > 0 && (
					<section className="flex flex-col gap-3">
						<div className="flex items-center justify-between">
							<h2 className="font-semibold text-xl">
								{t('me.home.publishedArticles')}
							</h2>
						</div>

						<div className="grid grid-cols-1 gap-2">
							{user.articles.map((article) => (
								<ArticleCard
									article={article}
									key={article.id}
								/>
							))}
						</div>
					</section>
				)}

				{tierLists && tierLists.data.length > 0 && (
					<section className="flex flex-col gap-3">
						<div className="flex items-center justify-between">
							<h2 className="font-semibold text-xl">
								{t('tierlists.title')}
							</h2>
							<CLink className="text-primary text-sm hover:underline" href="/tierlists">
								{t('tierlists.viewAll')}
							</CLink>
						</div>

						<div className="grid grid-cols-1 gap-2 md:grid-cols-2">
							{tierLists.data.map((tl) => (
								<CLink href={`/tierlists/${tl.external_id}`} key={tl.id}>
									<div className="flex items-center gap-3 rounded-lg border border-muted bg-card p-3 transition-colors hover:border-primary/30">
										<div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-bold text-primary text-lg">
											<Icon className="size-5" icon="lucide:layout-list" />
										</div>
										<div className="min-w-0 flex-1">
											<p className="truncate font-semibold text-sm">
												{tl.title}
											</p>
											<p className="text-text-accent text-xs">
												{tl.entry_count ?? tl.entries?.length ?? 0} items · {tl.item_kind}
											</p>
										</div>
									</div>
								</CLink>
							))}
						</div>
					</section>
				)}

				<UserComments userId={user.id} />
			</div>
		</section>
	)
}
