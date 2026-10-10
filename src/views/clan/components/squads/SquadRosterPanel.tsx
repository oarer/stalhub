'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import type { ClanMember } from '@/types/clan/clan.type'
import type { LoadoutData, UserLoadout } from '@/types/loadout/loadout.type'
import { RANK_ORDER } from '../../clan.const'
import { useGearLookups } from '../../hooks/useClanGear'
import type { AssignTarget } from '../../hooks/useClanSquadModals'
import { ClanMemberHoverCard } from '../members/ClanMemberCard'
import { type DragSource, useDraggable, useDroppable } from './SquadDnd'

export interface RosterKd {
	kd: number
	kills: number
	deaths: number
	games: number
}

interface SquadRosterPanelProps {
	members: ClanMember[]
	assignedMemberIds: Set<number>
	kdByName: Map<string, RosterKd>
	loadoutByUserId: Map<number, UserLoadout | null | undefined>
	absentUserIds: Set<number>
	canManage: boolean
	selectedTarget: AssignTarget | null
	targetSquadName: string | null
	isAssignPending: boolean
	onPick: (member: ClanMember) => void
	onClearTarget: () => void
	onUnassign: (source: { squadId: number; slot: number }) => void
	canEditGear?: (member: ClanMember) => boolean
	onEditGear?: (member: ClanMember) => void
}

export function SquadRosterPanel({
	members,
	assignedMemberIds,
	kdByName,
	loadoutByUserId,
	absentUserIds,
	canManage,
	selectedTarget,
	targetSquadName,
	isAssignPending,
	onPick,
	onClearTarget,
	onUnassign,
	canEditGear,
	onEditGear,
}: SquadRosterPanelProps) {
	const t = useTranslations()
	const [query, setQuery] = useState('')

	const { isOver, droppableProps } = useDroppable({
		disabled: !canManage,
		accepts: (item) => item.squadId >= 0,
		onDrop: (item) =>
			onUnassign({ squadId: item.squadId, slot: item.slot }),
	})

	const free = useMemo(() => {
		const q = query.trim().toLowerCase()
		const list = (members ?? []).filter(
			(m) =>
				!assignedMemberIds.has(m.id) &&
				(q ? m.name.toLowerCase().includes(q) : true)
		)
		return list.sort((a, b) => {
			const aKd = kdByName.get(a.name.trim().toLowerCase())?.kd ?? -1
			const bKd = kdByName.get(b.name.trim().toLowerCase())?.kd ?? -1
			if (aKd !== bKd) return bKd - aKd
			return (
				(RANK_ORDER[a.rank] ?? 99) - (RANK_ORDER[b.rank] ?? 99) ||
				a.name.localeCompare(b.name)
			)
		})
	}, [members, query, assignedMemberIds, kdByName])

	return (
		<Card.Root
			{...droppableProps}
			className={`lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)] ${
				isOver ? 'ring-sky-500/70' : ''
			}`}
		>
			<div className="flex items-center justify-between gap-2">
				<p className="font-semibold text-sm uppercase tracking-wide">
					{t('clan.squads.bench.title')}
				</p>
				<Badge className="font-mono" variant="secondary">
					{free.length}
				</Badge>
			</div>

			{canManage && (
				<div
					className={`rounded-lg border px-3 py-2 font-semibold text-xs ${
						selectedTarget
							? 'border-primary bg-primary/10'
							: 'border-primary border-dashed text-muted-foreground'
					}`}
				>
					{selectedTarget ? (
						<div className="flex items-center justify-between gap-2">
							<span>
								{t('clan.squads.roster.targetSet', {
									slot: selectedTarget.slot + 1,
									squad: targetSquadName ?? '',
								})}
							</span>
							<Button
								className="p-1"
								onClick={onClearTarget}
								size="sm"
								variant="ghost"
							>
								<Icon className="text-base" icon="lucide:x" />
							</Button>
						</div>
					) : (
						t('clan.squads.roster.pickHint')
					)}
				</div>
			)}

			<Input
				onChange={(e) => setQuery(e.target.value)}
				placeholder={t('clan.squads.roster.search')}
				value={query}
			/>

			<div className="flex max-h-[40vh] flex-col gap-1.5 overflow-y-auto pr-1 lg:max-h-none lg:flex-1">
				{free.length === 0 && (
					<p className="py-4 text-center font-semibold text-muted-foreground text-xs">
						{t('clan.squads.bench.empty')}
					</p>
				)}
				{free.map((m) => (
					<BenchRow
						absent={
							m.user_id != null && absentUserIds.has(m.user_id)
						}
						canEditGear={canEditGear}
						canManage={canManage}
						isAssignPending={isAssignPending}
						kd={kdByName.get(m.name.trim().toLowerCase())}
						key={m.id}
						loadout={
							m.user_id != null
								? (loadoutByUserId.get(m.user_id)?.data ?? null)
								: null
						}
						member={m}
						onEditGear={onEditGear}
						onPick={onPick}
						targetActive={selectedTarget != null}
					/>
				))}
			</div>
		</Card.Root>
	)
}

function BenchRow({
	member,
	kd,
	loadout,
	absent,
	canManage,
	targetActive,
	isAssignPending,
	onPick,
	canEditGear,
	onEditGear,
}: {
	member: ClanMember
	kd: RosterKd | undefined
	loadout: LoadoutData | null
	absent: boolean
	canManage: boolean
	targetActive: boolean
	isAssignPending: boolean
	onPick: (member: ClanMember) => void
	canEditGear?: (member: ClanMember) => boolean
	onEditGear?: (member: ClanMember) => void
}) {
	const t = useTranslations()
	const lookups = useGearLookups()
	const pickable = canManage && targetActive && !isAssignPending

	const source: DragSource = {
		squadId: -1,
		slot: -1,
		memberId: member.id,
		name: member.name,
	}
	const { isDragging, draggableProps } = useDraggable(source, {
		disabled: !canManage,
	})

	return (
		<ClanMemberHoverCard
			gear={loadout}
			kd={kd?.kd}
			kdLabel={
				kd
					? t('clan.squads.roster.kdHint', {
							kills: kd.kills,
							deaths: kd.deaths,
							games: kd.games,
						})
					: undefined
			}
			lookups={lookups}
			member={member}
			onEditGear={
				onEditGear && canEditGear?.(member)
					? () => onEditGear(member)
					: undefined
			}
		>
			<div
				{...draggableProps}
				className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 transition-colors ${
					absent
						? 'border-destructive/50 bg-destructive/5'
						: 'border-primary/50'
				} ${isDragging ? 'opacity-40' : ''} ${
					pickable
						? 'cursor-pointer hover:border-primary hover:bg-primary/10'
						: canManage
							? 'cursor-pointer'
							: ''
				}`}
				onClick={() => {
					if (pickable) onPick(member)
				}}
				title={absent ? t('clan.squads.roster.absent') : member.name}
			>
				<div className="min-w-0 flex-1">
					<p
						className={`truncate font-semibold text-sm ${absent ? 'text-destructive' : ''}`}
					>
						{member.name}
					</p>
					<p className="truncate font-semibold text-[11px] text-muted-foreground">
						{t(`player.rank.${member.rank}`)}
					</p>
				</div>
				{kd ? (
					<Badge className="shrink-0 font-mono" variant="secondary">
						{kd.kd.toFixed(2)}
					</Badge>
				) : (
					<Badge className="shrink-0 font-mono" variant="secondary">
						—
					</Badge>
				)}
				{absent && (
					<Icon
						className="shrink-0 text-base text-destructive"
						icon="lucide:calendar-x"
					/>
				)}
			</div>
		</ClanMemberHoverCard>
	)
}
