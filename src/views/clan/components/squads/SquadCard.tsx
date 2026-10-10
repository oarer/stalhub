'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Tooltip } from '@/components/ui/Tooltip'
import type { BuildApi } from '@/types/build-api.type'
import type { ClanSquad, ClanSquadMember } from '@/types/clan/clan.type'
import type { Item } from '@/types/item.type'
import type { LoadoutData, UserLoadout } from '@/types/loadout/loadout.type'
import { ClanMemberHoverCard } from '../members/ClanMemberCard'
import { type DragSource, useDnd, useDraggable, useDroppable } from './SquadDnd'
import { SQUAD_MAPS, SQUAD_SIZE } from './squads.const'
import { Card } from '@/components/ui/Card'

interface SquadCardProps {
	squad: ClanSquad
	isOfficer: boolean
	myMemberId: number | null
	pendingRequest: boolean
	absentUserIds: Set<number>
	loadoutByUserId: Map<number, UserLoadout | null | undefined>
	weapons: Item[]
	armors: Item[]
	buildById: Map<string, BuildApi>
	currentUserId?: number
	isJoinPending: boolean
	isApprovePending: boolean
	isRejectPending: boolean
	isDeletePending: boolean
	isLeaderPending: boolean
	isRenamePending: boolean
	selectedTarget?: { squadId: number; slot: number } | null
	kdByName?: Map<
		string,
		{ kd: number; kills: number; deaths: number; games: number }
	>
	onJoin: () => void
	onApprove: (requestId: number) => void
	onReject: (requestId: number) => void
	onDelete: () => void
	onRename: (name: string) => void
	onRemoveMember: (slot: number) => void
	onOpenAssign: (slot: number) => void
	onOpenLeader: () => void
	onOpenMap: () => void
	onEditLoadout: (
		memberId: number,
		squadMemberId: number,
		slot: number
	) => void
	onMove: (
		source: DragSource,
		target: { squadId: number; slot: number }
	) => void
}

export function SquadCard({
	squad,
	isOfficer,
	myMemberId,
	pendingRequest,
	absentUserIds,
	loadoutByUserId,
	weapons,
	armors,
	buildById,
	currentUserId,
	isJoinPending,
	isApprovePending,
	isRejectPending,
	isDeletePending,
	isLeaderPending,
	isRenamePending,
	selectedTarget,
	kdByName,
	onJoin,
	onApprove,
	onReject,
	onDelete,
	onRename,
	onRemoveMember,
	onOpenAssign,
	onOpenLeader,
	onOpenMap,
	onEditLoadout,
	onMove,
}: SquadCardProps) {
	const t = useTranslations()
	const [renaming, setRenaming] = useState(false)
	const [draft, setDraft] = useState(squad.name)
	const inSquad =
		myMemberId != null &&
		squad.members.some((m) => m.member_id === myMemberId)

	return (
		<Card.Root>
			<div className="flex items-center gap-2">
				<Icon className="shrink-0 text-xl" icon="lucide:swords" />
				{renaming ? (
					<>
						<input
							autoFocus
							className="h-7 min-w-0 flex-1 rounded-lg bg-accent/50 px-2 font-semibold text-sm outline-none ring-2 ring-primary/60"
							disabled={isRenamePending}
							maxLength={60}
							onChange={(e) => setDraft(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === 'Enter') {
									const name = draft.trim()
									if (
										name &&
										name !== squad.name &&
										!isRenamePending
									) {
										onRename(name)
									}
									setRenaming(false)
								}
								if (e.key === 'Escape') {
									setDraft(squad.name)
									setRenaming(false)
								}
							}}
							value={draft}
						/>
						<Button
							className="h-7 w-7 shrink-0 p-0"
							disabled={
								isRenamePending ||
								!draft.trim() ||
								draft.trim() === squad.name
							}
							onClick={() => {
								onRename(draft.trim())
								setRenaming(false)
							}}
							size="sm"
							title={t('clan.common.save')}
							variant="primary"
						>
							<Icon className="text-base" icon="lucide:check" />
						</Button>
						<Button
							className="h-7 w-7 shrink-0 p-0"
							onClick={() => {
								setDraft(squad.name)
								setRenaming(false)
							}}
							size="sm"
							title={t('clan.common.cancel')}
							variant="ghost"
						>
							<Icon className="text-base" icon="lucide:x" />
						</Button>
					</>
				) : (
					<>
						<p className="truncate font-semibold text-[15px]">
							{squad.name}
						</p>
						{isOfficer && (
							<Button
								className="h-6 w-6 shrink-0 p-0"
								onClick={() => {
									setDraft(squad.name)
									setRenaming(true)
								}}
								size="sm"
								title={t('clan.squads.renameTitle')}
								variant="ghost"
							>
								<Icon
									className="text-sm"
									icon="lucide:pencil"
								/>
							</Button>
						)}
					</>
				)}
				<Badge className="ml-auto font-mono" variant="secondary">
					{squad.members.length}/{SQUAD_SIZE}
				</Badge>
			</div>

			<div className="flex items-center gap-1">
				<Button
					className="h-7 gap-1.5 px-2 text-xs"
					disabled={!isOfficer}
					onClick={onOpenMap}
					size="sm"
					title={
						isOfficer ? t('clan.squads.mapChangeTitle') : squad.map
					}
					variant="ghost"
				>
					<Icon className="text-sm" icon="lucide:map-pin" />
					<span className="font-semibold">
						{t(
							SQUAD_MAPS.find((m) => m.value === squad.map)
								?.label ?? squad.map
						)}
					</span>
					{isOfficer && (
						<Icon
							className="text-sm"
							icon="lucide:chevrons-up-down"
						/>
					)}
				</Button>
				<div className="ml-auto flex items-center gap-1">
					{isOfficer && (
						<>
							<Button
								className="h-7 w-7 p-0"
								disabled={isLeaderPending}
								onClick={onOpenLeader}
								size="sm"
								title={t('clan.squads.assignLeaderTitle')}
								variant="ghost"
							>
								<Icon
									className={`text-base ${
										squad.leader
											? 'text-amber-500'
											: 'text-foreground'
									}`}
									icon="lucide:crown"
								/>
							</Button>
							<Button
								className="h-7 w-7 p-0 ring-transparent"
								disabled={isDeletePending}
								onClick={onDelete}
								size="sm"
								variant="danger"
							>
								<Icon
									className="text-base"
									icon="lucide:trash-2"
								/>
							</Button>
						</>
					)}
					{myMemberId != null &&
						!inSquad &&
						(pendingRequest ? (
							<Tooltip.Root>
								<Tooltip.Trigger asChild>
									<div className="rounded-lg px-2 py-1 hover:bg-accent">
										<Icon
											className="text-base"
											icon="lucide:clock"
										/>
									</div>
								</Tooltip.Trigger>
								<Tooltip.Content>
									{t('clan.squads.requestPending')}
								</Tooltip.Content>
							</Tooltip.Root>
						) : (
							<Button
								className="h-7 w-7 p-0"
								disabled={
									isJoinPending ||
									squad.members.length >= SQUAD_SIZE
								}
								onClick={onJoin}
								size="sm"
								variant="ghost"
							>
								<Icon
									className="text-base"
									icon="lucide:user-plus"
								/>
							</Button>
						))}
				</div>
			</div>

			{isOfficer && squad.requests.length > 0 && (
				<div className="flex flex-col gap-1">
					<p className="flex items-center gap-1 font-semibold text-foreground text-xs">
						<Icon className="text-sm" icon="lucide:inbox" />
						{t('clan.squads.joinRequests')}
					</p>
					{squad.requests.map((request) => (
						<div
							className="flex items-center justify-between gap-2 rounded-lg bg-accent/40 px-2 py-1.5"
							key={request.id}
						>
							<p className="truncate font-semibold text-sm">
								{request.member.name}
							</p>
							<div className="flex shrink-0 items-center gap-1">
								<Button
									className="h-7 w-7 p-0 ring-transparent"
									disabled={isRejectPending}
									onClick={() => onReject(request.id)}
									size="sm"
									variant="danger"
								>
									<Icon
										className="text-base"
										icon="lucide:x"
									/>
								</Button>
								<Button
									className="h-7 w-7 p-0"
									disabled={isApprovePending}
									onClick={() => onApprove(request.id)}
									size="sm"
									variant="primary"
								>
									<Icon
										className="text-base"
										icon="lucide:check"
									/>
								</Button>
							</div>
						</div>
					))}
				</div>
			)}

			<div className="flex flex-col gap-1.5">
				{Array.from({ length: SQUAD_SIZE }, (_, slot) => {
					const member = squad.members.find((m) => m.slot === slot)
					const isAbsent =
						member?.member.user_id != null &&
						absentUserIds.has(member.member.user_id as number)
					const gear = member
						? (member.gear_override ??
							(member.member.user_id != null
								? (loadoutByUserId.get(member.member.user_id)
										?.data ?? null)
								: null))
						: null
					return (
						<SquadRow
							gear={gear}
							hasOverride={member?.gear_override != null}
							isAbsent={isAbsent}
							isOfficer={isOfficer}
							isSelected={
								selectedTarget?.squadId === squad.id &&
								selectedTarget?.slot === slot
							}
							kd={
								member
									? kdByName?.get(
											member.member.name
												.trim()
												.toLowerCase()
										)?.kd
									: undefined
							}
							key={slot}
							lookups={{ weapons, armors, buildById }}
							member={member}
							onEditGear={
								member &&
								(member.member.user_id === currentUserId ||
									isOfficer)
									? () =>
											onEditLoadout(
												member.member_id,
												member.id,
												member.slot
											)
									: undefined
							}
							onMove={onMove}
							onOpenAssign={onOpenAssign}
							onRemoveMember={onRemoveMember}
							slot={slot}
							squad={squad}
						/>
					)
				})}
			</div>
		</Card.Root>
	)
}

interface SquadRowProps {
	squad: ClanSquad
	slot: number
	member: ClanSquadMember | undefined
	isOfficer: boolean
	isAbsent: boolean
	isSelected: boolean
	gear: LoadoutData | null
	hasOverride: boolean
	kd: number | undefined
	lookups: {
		weapons: Item[]
		armors: Item[]
		buildById: Map<string, BuildApi>
	}
	onEditGear?: () => void
	onRemoveMember: (slot: number) => void
	onOpenAssign: (slot: number) => void
	onMove: (
		source: DragSource,
		target: { squadId: number; slot: number }
	) => void
}

function SquadRow({
	squad,
	slot,
	member,
	isOfficer,
	isAbsent,
	isSelected,
	gear,
	hasOverride,
	kd,
	lookups,
	onEditGear,
	onRemoveMember,
	onOpenAssign,
	onMove,
}: SquadRowProps) {
	const t = useTranslations()

	const { dragged } = useDnd()
	const source: DragSource | null = member
		? {
				squadId: squad.id,
				slot,
				memberId: member.member_id,
				name: member.member.name,
			}
		: null
	const { isDragging, draggableProps } = useDraggable(source, {
		disabled: !isOfficer,
	})
	const { isOver, droppableProps } = useDroppable({
		disabled: !isOfficer,
		onDrop: (item) => onMove(item, { squadId: squad.id, slot }),
	})

	const isLeader = squad.leader_id === member?.id
	const rowStyles = member
		? isLeader
			? 'border-amber-500/50 bg-amber-500/5'
			: isAbsent
				? 'border-destructive/50 bg-destructive/5'
				: 'border-primary/50'
		: isSelected
			? 'border-primary bg-primary/10'
			: 'border-dashed border-primary/50'

	return (
		<div
			{...droppableProps}
			className={`flex items-center gap-1.5 rounded-lg border px-2 py-1.5 transition-colors ${rowStyles} ${
				isDragging ? 'opacity-40' : ''
			} ${
				isOver || isSelected
					? 'ring-2 ring-sky-500/70'
					: dragged != null && isOfficer
						? 'hover:border-sky-500/60'
						: ''
			} ${!member && isOfficer ? 'cursor-pointer hover:bg-primary/5' : ''}`}
			onClick={() => {
				if (isOfficer && !member) onOpenAssign(slot)
			}}
		>
			{member ? (
				<>
					<span
						{...draggableProps}
						className={`shrink-0 text-muted-foreground ${isOfficer ? 'cursor-grab' : ''}`}
					>
						<Icon
							className="text-base"
							icon="lucide:grip-vertical"
						/>
					</span>
					<ClanMemberHoverCard
						gear={gear}
						hasOverride={hasOverride}
						kd={kd}
						lookups={lookups}
						member={member.member}
						onEditGear={onEditGear}
					>
						<p className="truncate font-semibold text-sm">
							{member.member.name}
						</p>
					</ClanMemberHoverCard>
					{isLeader && (
						<Icon
							className="shrink-0 text-amber-500 text-base"
							icon="lucide:crown"
						/>
					)}
					{isAbsent && (
						<Icon
							className="shrink-0 text-base text-destructive"
							icon="lucide:calendar-x"
						/>
					)}
					{kd != null && (
						<Badge
							className="ml-auto shrink-0 font-mono"
							variant="secondary"
						>
							{kd.toFixed(2)}
						</Badge>
					)}
					{isOfficer && (
						<Button
							className={`h-6 w-6 shrink-0 p-0 ring-transparent ${kd == null ? 'ml-auto' : ''}`}
							onClick={(e) => {
								e.stopPropagation()
								onRemoveMember(slot)
							}}
							variant="danger"
						>
							<Icon className="text-sm" icon="lucide:x" />
						</Button>
					)}
				</>
			) : (
				<p className="truncate px-1 font-mono font-semibold text-muted-foreground text-xs">
					{t('clan.squads.freeSlot')}
				</p>
			)}
		</div>
	)
}
