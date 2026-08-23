'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'
import type { BuildApi } from '@/types/build-api.type'
import type { ClanSquadMember } from '@/types/clan/clan.type'
import type { Item } from '@/types/item.type'
import type { UserLoadout } from '@/types/loadout/loadout.type'
import { BuildCell, ItemCell } from './ItemCell'

const GRID_TEMPLATE = 'minmax(6rem, 1.2fr) repeat(7, minmax(5.5rem, 1fr)) 2rem'

const HEADERS = [
	'clan.squads.loadoutHeaders.player',
	'clan.squads.loadoutHeaders.primary',
	'clan.squads.loadoutHeaders.secondary',
	'clan.squads.loadoutHeaders.pistol',
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
	onEditLoadout: (memberId: number) => void
}

export function SquadLoadoutTable({
	members,
	loadoutByUserId,
	weapons,
	armors,
	buildById,
	currentUserId,
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
				{members.map(({ member }) => {
					const loadout =
						member.user_id != null
							? loadoutByUserId.get(member.user_id)
							: null
					const data = loadout?.data
					const isSelf =
						member.user_id != null && member.user_id === currentUserId
					return (
						<div
							className="grid min-w-160 items-center gap-2 border-primary border-b px-2 py-2 last:border-b-0"
							key={member.id}
							style={{ gridTemplateColumns: GRID_TEMPLATE }}
						>
							<span className="min-w-0 truncate font-medium text-sm">
								{member.name}
							</span>
							<ItemCell
								item={weapons?.find(
									(w) => w.id === data?.weapon_primary
								)}
							/>
							<ItemCell
								item={weapons?.find(
									(w) => w.id === data?.weapon_secondary
								)}
							/>
							<ItemCell
								item={weapons?.find(
									(w) => w.id === data?.weapon_pistol
								)}
							/>
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
							{isSelf ? (
								<Button
									className="p-2"
									onClick={() => onEditLoadout(member.id)}
									title={t('clan.squads.editLoadout')}
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
