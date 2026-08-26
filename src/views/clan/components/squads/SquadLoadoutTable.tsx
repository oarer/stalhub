'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'
import type { BuildApi } from '@/types/build-api.type'
import type { ClanSquadMember } from '@/types/clan/clan.type'
import type { Item } from '@/types/item.type'
import type { LoadoutData, UserLoadout } from '@/types/loadout/loadout.type'
import { BuildCell, ItemCell, SLEDGEHAMMER_ID } from './ItemCell'

const GRID_TEMPLATE = 'minmax(6rem, 1.2fr) repeat(8, minmax(5.5rem, 1fr)) 2rem'

const HEADERS = [
	'clan.squads.loadoutHeaders.player',
	'clan.squads.loadoutHeaders.primary',
	'clan.squads.loadoutHeaders.secondary',
	'clan.squads.loadoutHeaders.pistol',
	'Кувалда',
	'clan.squads.loadoutHeaders.fatBuild',
	'clan.squads.loadoutHeaders.speedBuild',
	'clan.squads.loadoutHeaders.armor',
	'clan.squads.loadoutHeaders.bioArmor',
]

interface SquadLoadoutTableProps {
	members: ClanSquadMember[]
	loadoutByUserId: Map<number, UserLoadout | null | undefined>
	weapons: Item[]
	armors: Item[]
	buildById: Map<string, BuildApi>
	currentUserId?: number
	isOfficer: boolean
	onEditLoadout: (
		memberId: number,
		squadMemberId: number,
		slot: number
	) => void
}

function resolveData(
	gear_override: LoadoutData | null,
	userLoadout: UserLoadout | null | undefined
): LoadoutData | null {
	if (gear_override) return gear_override
	return userLoadout?.data ?? null
}

export function SquadLoadoutTable({
	members,
	loadoutByUserId,
	weapons,
	armors,
	buildById,
	currentUserId,
	isOfficer,
	onEditLoadout,
}: SquadLoadoutTableProps) {
	const t = useTranslations()

	return (
		<div className="mt-4">
			<p className="mb-2 flex items-center gap-2 font-semibold text-muted-foreground text-sm">
				<Icon className="text-base" icon="lucide:shirt" />
				{t('clan.squads.loadoutTitle')}
			</p>
			<div className="overflow-x-auto">
				<div
					className="grid min-w-160 items-center gap-2 border-primary border-b px-2 pb-1 font-semibold text-muted-foreground text-xs"
					style={{ gridTemplateColumns: GRID_TEMPLATE }}
				>
					{HEADERS.map((h) => (
						<span key={h}>{t(h)}</span>
					))}
					<span />
				</div>
				{members.map((squadMember) => {
					const { member, gear_override } = squadMember
					const loadout =
						member.user_id != null
							? loadoutByUserId.get(member.user_id)
							: null
					const data = resolveData(gear_override, loadout)
					const hasOverride = gear_override != null
					const isSelf =
						member.user_id != null &&
						member.user_id === currentUserId

					const primary = weapons?.find(
						(w) => w.id === data?.weapon_primary
					)
					const secondary = weapons?.find(
						(w) => w.id === data?.weapon_secondary
					)
					const pistol = weapons?.find(
						(w) => w.id === data?.weapon_pistol
					)

					const hasSledgehammer =
						data?.weapon_melee === SLEDGEHAMMER_ID

					return (
						<div
							className={`grid min-w-160 items-center gap-2 border-primary border-b px-2 py-2 last:border-b-0 ${hasOverride ? 'bg-primary/5' : ''}`}
							key={member.id}
							style={{ gridTemplateColumns: GRID_TEMPLATE }}
						>
							<span className="min-w-0 truncate font-medium text-sm">
								{member.name}
								{hasOverride && (
									<Icon
										className="ml-1 inline text-md text-primary"
										icon="lucide:shield-check"
									/>
								)}
							</span>
							<ItemCell item={primary} />
							<ItemCell item={secondary} />
							<ItemCell item={pistol} />
							{hasSledgehammer ? (
								<Icon
									className="text-lg text-primary"
									icon="lucide:check-circle-2"
								/>
							) : (
								<span className="text-muted-foreground">—</span>
							)}
							<BuildCell
								title={
									data?.build_fat != null
										? buildById.get(String(data.build_fat))
												?.title
										: undefined
								}
							/>
							<BuildCell
								title={
									data?.build_speed != null
										? buildById.get(
												String(data.build_speed)
											)?.title
										: undefined
								}
							/>
							<ItemCell
								item={armors?.find((a) => a.id === data?.armor)}
							/>
							<ItemCell
								item={armors?.find(
									(a) => a.id === data?.bio_armor
								)}
							/>
							{isSelf || isOfficer ? (
								<Button
									className="p-2"
									onClick={() =>
										onEditLoadout(
											member.id,
											squadMember.id,
											squadMember.slot
										)
									}
									title={
										isOfficer && !isSelf
											? t('clan.squads.editGearOverride')
											: t('clan.squads.editLoadout')
									}
									variant={'ghost'}
								>
									<Icon
										className="text-lg"
										icon="lucide:pencil"
									/>
								</Button>
							) : (
								<span />
							)}
						</div>
					)
				})}
			</div>
		</div>
	)
}
