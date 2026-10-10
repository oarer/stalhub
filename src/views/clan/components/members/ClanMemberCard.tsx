'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import type { ReactNode } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { HoverCard, type HoverCardSide } from '@/components/ui/HoverCard'
import { getLocale } from '@/lib/getLocale'
import type { BuildApi } from '@/types/build-api.type'
import type { ClanMember } from '@/types/clan/clan.type'
import { type InfoColor, type Item, infoColorMap } from '@/types/item.type'
import type { LoadoutData } from '@/types/loadout/loadout.type'
import { messageToString } from '@/utils/itemUtils'
import { RANK_COLORS } from '../../clan.const'
import { type GearLookups, useGearLookups } from '../../hooks/useClanGear'
import { SLEDGEHAMMER_ID } from '../squads/ItemCell'

export type { GearLookups }

function itemName(item: Item | undefined): ReactNode {
	if (!item) return <span className="text-muted-foreground">—</span>
	return (
		<span
			className="truncate"
			style={{ color: infoColorMap[item.color as InfoColor] }}
		>
			{messageToString(item.name, getLocale())}
		</span>
	)
}

function buildTitle(
	buildById: Map<string, BuildApi>,
	id: string | number | null | undefined
): ReactNode {
	if (id == null) return <span className="text-muted-foreground">—</span>
	const title = buildById.get(String(id))?.title
	if (!title) return <span className="text-muted-foreground">—</span>
	return <span className="truncate text-primary">{title}</span>
}

export function ClanMemberGear({
	gear,
	lookups,
	hasOverride = false,
}: {
	gear: LoadoutData | null | undefined
	lookups?: GearLookups | null
	hasOverride?: boolean
}) {
	const t = useTranslations()
	const fallback = useGearLookups()
	const { weapons, armors, buildById } = lookups ?? fallback

	if (!gear) {
		return (
			<p className="py-2 text-center font-semibold text-muted-foreground text-xs">
				{t('clan.memberCard.noGear')}
			</p>
		)
	}

	const rows: { label: string; value: ReactNode }[] = [
		{
			label: t('clan.squads.loadoutFields.primaryWeapon'),
			value: itemName(weapons?.find((w) => w.id === gear.weapon_primary)),
		},
		{
			label: t('clan.squads.loadoutFields.secondaryWeapon'),
			value: itemName(
				weapons?.find((w) => w.id === gear.weapon_secondary)
			),
		},
		{
			label: t('clan.squads.loadoutFields.pistol'),
			value: itemName(weapons?.find((w) => w.id === gear.weapon_pistol)),
		},
		{
			label: t('clan.squads.loadoutFields.meleeWeapon'),
			value:
				gear.weapon_melee === SLEDGEHAMMER_ID ? (
					<Icon
						className="text-lg text-primary"
						icon="lucide:check"
					/>
				) : (
					itemName(weapons?.find((w) => w.id === gear.weapon_melee))
				),
		},
		{
			label: t('clan.squads.loadoutFields.fatBuild'),
			value: buildTitle(buildById, gear.build_fat),
		},
		{
			label: t('clan.squads.loadoutFields.speedBuild'),
			value: buildTitle(buildById, gear.build_speed),
		},
		{
			label: t('clan.squads.loadoutFields.armor'),
			value: itemName(armors?.find((a) => a.id === gear.armor)),
		},
		{
			label: t('clan.squads.loadoutFields.bioArmor'),
			value: itemName(armors?.find((a) => a.id === gear.bio_armor)),
		},
	]

	return (
		<div className="flex flex-col">
			{hasOverride && (
				<p className="mb-1 flex items-center gap-1 font-semibold text-primary text-xs">
					<Icon className="text-sm" icon="lucide:shield-check" />
					{t('clan.squads.editGearOverride')}
				</p>
			)}
			{rows.map((row) => (
				<div
					className="flex items-center justify-between gap-3 border-primary/40 border-b py-1 font-semibold text-xs last:border-b-0"
					key={row.label}
				>
					<span className="shrink-0 text-muted-foreground">
						{row.label}
					</span>
					<span className="flex min-w-0 items-center justify-end gap-1 truncate text-right">
						{row.value}
					</span>
				</div>
			))}
		</div>
	)
}

interface ClanMemberHoverCardProps {
	member: ClanMember
	gear?: LoadoutData | null
	hasOverride?: boolean
	kd?: number | null
	kdLabel?: string | null
	lookups?: GearLookups | null
	onEditGear?: () => void
	editGearTitle?: string
	side?: HoverCardSide
	children: ReactNode
}

export function ClanMemberHoverCard({
	member,
	gear,
	hasOverride = false,
	kd,
	kdLabel,
	lookups,
	onEditGear,
	editGearTitle,
	side,
	children,
}: ClanMemberHoverCardProps) {
	const t = useTranslations()

	return (
		<HoverCard.Root closeDelay={150} openDelay={250}>
			<HoverCard.Trigger asChild className="cursor-pointer">
				{children}
			</HoverCard.Trigger>
			<HoverCard.Content className="w-72" side={side}>
				<div className="flex flex-col gap-2">
					<div className="flex items-center gap-2">
						<div className="flex size-9 flex-none items-center justify-center rounded-full bg-accent font-semibold text-sm">
							{member.name.charAt(0).toUpperCase()}
						</div>
						<div className="flex min-w-0 gap-2">
							<p className="truncate font-semibold text-sm">
								{member.name}
								{hasOverride && (
									<Icon
										className="ml-1 inline text-md text-primary"
										icon="lucide:shield-check"
									/>
								)}
							</p>
							<div className="flex items-center gap-1.5">
								<Badge
									className={RANK_COLORS[member.rank] ?? ''}
									variant="secondary"
								>
									{t(`player.rank.${member.rank}`)}
								</Badge>
								{kd != null && (
									<Badge
										className="font-mono"
										title={kdLabel ?? undefined}
										variant="secondary"
									>
										{t('clan.common.kd')}: {kd.toFixed(2)}
									</Badge>
								)}
							</div>
						</div>
						{onEditGear && (
							<Button
								className="ml-auto p-2"
								onClick={onEditGear}
								title={
									editGearTitle ??
									t('clan.memberCard.editGear')
								}
								variant="ghost"
							>
								<Icon
									className="text-lg"
									icon="lucide:pencil"
								/>
							</Button>
						)}
					</div>
					<ClanMemberGear
						gear={gear}
						hasOverride={hasOverride}
						lookups={lookups}
					/>
				</div>
			</HoverCard.Content>
		</HoverCard.Root>
	)
}
