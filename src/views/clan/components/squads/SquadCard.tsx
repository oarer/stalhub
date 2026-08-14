'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { montserrat } from '@/app/fonts'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Tooltip } from '@/components/ui/Tooltip'
import type { BuildApi } from '@/types/build-api.type'
import type { ClanSquad, ClanSquadMember } from '@/types/clan/clan.type'
import type { Item } from '@/types/item.type'
import type { UserLoadout } from '@/types/loadout/loadout.type'
import { type DragSource, useDnd, useDraggable, useDroppable } from './SquadDnd'
import { SquadLoadoutTable } from './SquadLoadoutTable'
import { SQUAD_MAPS } from './squads.const'

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
	onJoin: () => void
	onApprove: (requestId: number) => void
	onReject: (requestId: number) => void
	onDelete: () => void
	onRemoveMember: (slot: number) => void
	onOpenAssign: (slot: number) => void
	onOpenLeader: () => void
	onOpenMap: () => void
	onEditLoadout: (memberId: number) => void
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
	onJoin,
	onApprove,
	onReject,
	onDelete,
	onRemoveMember,
	onOpenAssign,
	onOpenLeader,
	onOpenMap,
	onEditLoadout,
	onMove,
}: SquadCardProps) {
	const t = useTranslations()
	const squadMembers = [...squad.members].sort((a, b) => a.slot - b.slot)
	const inSquad =
		myMemberId != null &&
		squad.members.some((m) => m.memberId === myMemberId)

	return (
		<div className="flex flex-col gap-3 rounded-xl bg-background px-5 py-4">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<div className="flex items-center gap-2 font-semibold text-lg">
						<Icon className="text-xl" icon="lucide:group" />
						{squad.name}
					</div>
					<Badge className={montserrat.className} variant="secondary">
						{squad.members.length}/5
					</Badge>
					<Button
						className="gap-2"
						disabled={!isOfficer}
						onClick={onOpenMap}
						size={'sm'}
						title={
							isOfficer
								? t('clan.squads.mapChangeTitle')
								: squad.map
						}
						variant={'ghost'}
					>
						<Icon
							className="text-text-accent"
							icon="lucide:map-pin"
						/>
						<span className="font-semibold">
							{t(
								SQUAD_MAPS.find((m) => m.value === squad.map)
									?.label ?? squad.map
							)}
						</span>
						{isOfficer && (
							<Icon
								className="text-text-accent"
								icon="lucide:chevrons-up-down"
							/>
						)}
					</Button>
				</div>
				<div className="flex items-center gap-3">
					{isOfficer && (
						<>
							<Button
								disabled={isLeaderPending}
								onClick={onOpenLeader}
								size="sm"
								title={t('clan.squads.assignLeaderTitle')}
								variant="ghost"
							>
								<Icon
									className={`text-lg ${
										squad.leader
											? 'text-amber-500'
											: 'text-text-accent'
									}`}
									icon="lucide:crown"
								/>
							</Button>

							<Button
								className="ring-transparent"
								disabled={isDeletePending}
								onClick={onDelete}
								size="sm"
								variant="danger"
							>
								<Icon
									className="text-lg"
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
									<div className="rounded-lg px-3 py-1.5 hover:bg-accent">
										<Icon
											className="text-lg"
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
								disabled={
									isJoinPending || squad.members.length >= 5
								}
								onClick={onJoin}
								size="sm"
								variant="ghost"
							>
								<Icon
									className="text-lg"
									icon="lucide:user-plus"
								/>
							</Button>
						))}
				</div>
			</div>

			{isOfficer && squad.requests.length > 0 && (
				<div className="flex flex-col gap-2">
					<p className="flex items-center gap-1 font-semibold text-text-accent text-xs">
						<Icon className="text-sm" icon="lucide:inbox" />
						{t('clan.squads.joinRequests')}
					</p>
					<div className="flex flex-col gap-1">
						{squad.requests.map((request) => (
							<div
								className="flex items-center justify-between gap-2 rounded-lg bg-accent/40 px-2 py-1.5"
								key={request.id}
							>
								<div className="flex items-center gap-2">
									<div className="flex size-7 flex-none items-center justify-center rounded-full bg-accent font-semibold text-xs">
										{request.member.name.charAt(0)}
									</div>
									<p className="font-semibold text-sm">
										{request.member.name}
									</p>
								</div>
								<div className="flex items-center gap-2">
									<Button
										className="gap-2 ring-transparent"
										disabled={isApprovePending}
										onClick={() => onApprove(request.id)}
										size="sm"
										variant={'ghost'}
									>
										<Icon
											className="text-lg"
											icon="lucide:check"
										/>
									</Button>
									<Button
										className="gap-2 ring-transparent"
										disabled={isRejectPending}
										onClick={() => onReject(request.id)}
										size="sm"
										variant={'danger'}
									>
										<Icon
											className="text-lg"
											icon="lucide:x"
										/>
									</Button>
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			<div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
				{Array.from({ length: 5 }, (_, slot) => {
					const member = squad.members.find((m) => m.slot === slot)
					const isAbsent =
						member?.member.userId != null &&
						absentUserIds.has(member.member.userId as number)
					return (
						<SquadSlot
							isAbsent={isAbsent}
							isOfficer={isOfficer}
							key={slot}
							member={member}
							onMove={onMove}
							onOpenAssign={onOpenAssign}
							onRemoveMember={onRemoveMember}
							slot={slot}
							squad={squad}
						/>
					)
				})}
			</div>

			{squadMembers.length > 0 && (
				<SquadLoadoutTable
					armors={armors}
					buildById={buildById}
					currentUserId={currentUserId}
					loadoutByUserId={loadoutByUserId}
					members={squadMembers}
					onEditLoadout={onEditLoadout}
					weapons={weapons}
				/>
			)}
		</div>
	)
}

interface SquadSlotProps {
	squad: ClanSquad
	slot: number
	member: ClanSquadMember | undefined
	isOfficer: boolean
	isAbsent: boolean
	onRemoveMember: (slot: number) => void
	onOpenAssign: (slot: number) => void
	onMove: (
		source: DragSource,
		target: { squadId: number; slot: number }
	) => void
}

function SquadSlot({
	squad,
	slot,
	member,
	isOfficer,
	isAbsent,
	onRemoveMember,
	onOpenAssign,
	onMove,
}: SquadSlotProps) {
	const t = useTranslations()

	const { dragged } = useDnd()
	const source: DragSource | null = member
		? {
				squadId: squad.id,
				slot,
				memberId: member.memberId,
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

	const isLeader = squad.leaderId === member?.id
	const cardStyles = member
		? isLeader
			? 'border-amber-500/60 bg-amber-500/10'
			: isAbsent
				? 'border-red-500/60 bg-red-500/10'
				: 'border-border-secondary bg-accent/30'
		: 'border-border-secondary border-dashed'

	return (
		<div
			{...draggableProps}
			{...droppableProps}
			className={`relative flex flex-col items-center gap-1 rounded-lg border p-3 text-center text-sm transition-colors ${cardStyles} ${
				!member ? 'justify-center' : ''
			} ${
				isDragging
					? 'opacity-40'
					: isOfficer
						? member
							? 'cursor-grab'
							: 'cursor-pointer'
						: ''
			} ${
				isOver
					? 'ring-2 ring-sky-500/70'
					: dragged != null && isOfficer
						? 'hover:border-sky-500/60'
						: ''
			}`}
			onClick={() => {
				if (isOfficer && !member) onOpenAssign(slot)
			}}
		>
			{member ? (
				<>
					<p className="max-w-24 truncate font-semibold">
						{member.member.name}
					</p>
					<p className="font-semibold text-text-accent text-xs">
						{t(`player.rank.${member.member.rank}`)}
					</p>
					{isOfficer && (
						<Button
							className="absolute top-1 right-1 p-1 ring-transparent"
							onClick={() => onRemoveMember(slot)}
							variant={'danger'}
						>
							<Icon className="text-sm" icon="lucide:x" />
						</Button>
					)}
				</>
			) : (
				<p
					className={`${montserrat.className} font-semibold text-sm text-text-accent`}
				>
					{t('clan.squads.slot', { slot: slot + 1 })}
				</p>
			)}
		</div>
	)
}
