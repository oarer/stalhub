'use client'

import { Icon } from '@iconify/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useMemo } from 'react'
import { mtsExtended } from '@/app/fonts'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { clanQueries } from '@/queries/clan/clan.queries'
import type { SquadMap } from '@/types/clan/clan.type'
import { LoadoutEditorModal } from '../me/components/LoadoutEditorModal'
import { AssignLeaderModal } from './components/squads/AssignLeaderModal'
import { ChangeMapModal } from './components/squads/ChangeMapModal'
import { MapTabs } from './components/squads/MapTabs'
import { PngPreviewModal } from './components/squads/PngPreviewModal'
import { SquadCard } from './components/squads/SquadCard'
import { SquadDndProvider } from './components/squads/SquadDnd'
import { SquadPngTemplate } from './components/squads/SquadPngTemplate'
import { SquadRosterPanel } from './components/squads/SquadRosterPanel'
import {
	MAX_SQUADS_PER_MAP,
	SQUAD_MAPS,
} from './components/squads/squads.const'
import { GearEditModals } from './components/members/GearEditModals'
import { useClanGearEdit } from './hooks/useClanGearEdit'
import { useClanSquads } from './hooks/useClanSquads'

export default function ClanSquadsView() {
	const { data: profile } = useSuspenseQuery(clanQueries.getMe())
	const clanId = profile?.clan?.id
	if (!clanId) return null

	return (
		<ClanSquadsContent clanId={clanId} currentUserId={profile?.user_id} />
	)
}

function ClanSquadsContent({
	clanId,
	currentUserId,
}: {
	clanId: string
	currentUserId?: number
}) {
	const t = useTranslations()
	const { data, modals, mutations, png } = useClanSquads(
		clanId,
		currentUserId
	)
	// Leader can manage squads/gear even if their account is not linked
	// to an officer-ranked member row (colonels are already officers).
	const canManage = data.isOfficer || data.isLeader
	const gearEdit = useClanGearEdit(clanId)

	const editingCtx = modals.editingCtx

	const squadsByMap = useMemo(() => {
		const map = {
			SMALL_BERDOVKA: 0,
			KHVOUINOY: 0,
			NIZINA: 0,
		} as Record<SquadMap, number>
		for (const squad of data.squads ?? []) {
			map[squad.map] = (map[squad.map] ?? 0) + 1
		}
		return map
	}, [data.squads])

	const assignedOnActiveMap = useMemo(() => {
		const set = new Set<number>()
		for (const squad of data.squads ?? []) {
			if (squad.map !== modals.activeMap) continue
			for (const m of squad.members) {
				set.add(m.member_id)
			}
		}
		return set
	}, [data.squads, modals.activeMap])

	const quickCreate = (map: SquadMap) => {
		const onMap = (data.squads ?? []).filter((s) => s.map === map)
		if (onMap.length >= MAX_SQUADS_PER_MAP) return
		const taken = new Set(onMap.map((s) => s.name.trim().toLowerCase()))
		let n = onMap.length + 1
		let name = t('clan.squads.autoName', { n })
		while (taken.has(name.trim().toLowerCase())) {
			n += 1
			name = t('clan.squads.autoName', { n })
		}
		modals.setActiveMap(map)
		mutations.createMutation.mutate({ name, map })
	}

	const gearOverrideForEdit = useMemo(() => {
		if (!editingCtx) return null
		for (const squad of data.squads ?? []) {
			const sm = squad.members.find(
				(m) => m.id === editingCtx.squadMemberId
			)
			if (sm) return sm.gear_override
		}
		return null
	}, [editingCtx, data.squads])

	if (data.isLoading) {
		return (
			<div className="flex flex-col gap-2">
				<Skeleton className="h-40 w-full" />
				<Skeleton className="h-40 w-full" />
			</div>
		)
	}

	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center justify-between">
				<h1
					className={`${mtsExtended.className} font-semibold text-[28px] leading-none`}
				>
					{t('clan.squads.title')}
				</h1>
				<div className="flex items-center gap-2">
					<Button
						className="gap-2"
						disabled={modals.activeSquads.length === 0}
						loading={png.isSavingPng}
						onClick={png.handleSavePng}
						size="md"
						title={
							modals.activeSquads.length === 0
								? t('clan.squads.noSquadsTitle')
								: t('clan.squads.exportPngTitle')
						}
						variant="ghost"
					>
						<Icon className="text-lg" icon="lucide:download" />
						PNG
					</Button>
					{canManage && (
						<Button
							className="gap-2"
							disabled={
								mutations.createMutation.isPending ||
								modals.activeSquads.length >= MAX_SQUADS_PER_MAP
							}
							loading={mutations.createMutation.isPending}
							onClick={() => quickCreate(modals.activeMap)}
							size="md"
							title={t('clan.squads.quickCreateTitle')}
							variant="primary"
						>
							<Icon className="text-lg" icon="lucide:plus" />
							{t('clan.squads.create')}
						</Button>
					)}
				</div>
			</div>

			<SquadDndProvider>
				<div className="flex flex-col items-start gap-4 xl:flex-row">
					<div className="min-w-0 flex-1 self-stretch">
						<MapTabs
							activeMap={modals.activeMap}
							isCreating={mutations.createMutation.isPending}
							isOfficer={canManage}
							onActiveMapChange={modals.setActiveMap}
							onCreateSquad={quickCreate}
							squadCount={modals.activeSquads.length}
							squadsByMap={squadsByMap}
						>
							{modals.activeSquads.map((squad) => (
								<SquadCard
									absentUserIds={data.absentUserIds}
									armors={data.armors}
									buildById={data.buildById}
									currentUserId={currentUserId}
									isApprovePending={
										mutations.approveMutation.isPending
									}
									isDeletePending={
										mutations.deleteMutation.isPending
									}
									isJoinPending={
										mutations.joinMutation.isPending
									}
									isLeaderPending={
										mutations.leaderMutation.isPending
									}
									isOfficer={canManage}
									isRejectPending={
										mutations.rejectMutation.isPending
									}
									isRenamePending={
										mutations.renameMutation.isPending
									}
									kdByName={data.kdByName}
									key={squad.id}
									loadoutByUserId={data.loadoutByUserId}
									myMemberId={data.myMemberId}
									onApprove={(requestId) =>
										mutations.approveMutation.mutate(
											requestId
										)
									}
									onDelete={() =>
										mutations.deleteMutation.mutate(
											squad.id
										)
									}
									onRename={(name) =>
										mutations.renameMutation.mutate({
											squadId: squad.id,
											name,
										})
									}
									onEditLoadout={(
										memberId,
										squadMemberId,
										slot
									) =>
										modals.setEditingCtx({
											clanMemberId: memberId,
											squadMemberId,
											slot,
										})
									}
									onJoin={() =>
										mutations.joinMutation.mutate(squad.id)
									}
									onMove={mutations.moveMember}
									onOpenAssign={(slot) => {
										const cur = modals.assignTarget
										if (
											cur?.squadId === squad.id &&
											cur?.slot === slot
										) {
											modals.setAssignTarget(null)
										} else {
											modals.setAssignTarget({
												squadId: squad.id,
												slot,
											})
										}
									}}
									onOpenLeader={() =>
										modals.setLeaderSquadId(squad.id)
									}
									onOpenMap={() => {
										modals.setTargetMap(squad.map)
										modals.setMapSquadId(squad.id)
									}}
									onReject={(requestId) =>
										mutations.rejectMutation.mutate(
											requestId
										)
									}
									onRemoveMember={(slot) =>
										mutations.removeMutation.mutate({
											squadId: squad.id,
											slot,
										})
									}
									pendingRequest={
										data.pendingRequest.get(squad.id) ??
										false
									}
									selectedTarget={modals.assignTarget}
									squad={squad}
									weapons={data.weapons}
								/>
							))}
						</MapTabs>
					</div>
					<div className="w-full xl:w-80 xl:shrink-0">
						<SquadRosterPanel
							absentUserIds={data.absentUserIds}
							assignedMemberIds={assignedOnActiveMap}
							canEditGear={gearEdit.canEditGear}
							canManage={canManage}
							isAssignPending={mutations.assignMutation.isPending}
							kdByName={data.kdByName}
							loadoutByUserId={data.loadoutByUserId}
							members={data.members ?? []}
							onClearTarget={() => modals.setAssignTarget(null)}
							onEditGear={gearEdit.openGearEdit}
							onPick={(member) => {
								if (modals.assignTarget) {
									mutations.assignMutation.mutate({
										squadId: modals.assignTarget.squadId,
										member_id: member.id,
										slot: modals.assignTarget.slot,
									})
								}
							}}
							selectedTarget={modals.assignTarget}
							targetSquadName={modals.targetSquad?.name ?? null}
							onUnassign={(source) =>
								mutations.removeMutation.mutate({
									squadId: source.squadId,
									slot: source.slot,
								})
							}
						/>
					</div>
				</div>
			</SquadDndProvider>

			<AssignLeaderModal
				isPending={mutations.leaderMutation.isPending}
				onAssign={(memberId) => {
					if (modals.leaderSquadId != null) {
						mutations.leaderMutation.mutate({
							squadId: modals.leaderSquadId,
							member_id: memberId,
						})
					}
				}}
				onOpenChange={(open) => {
					if (!open) modals.setLeaderSquadId(null)
				}}
				onRemoveLeader={() => {
					if (modals.leaderSquadId != null) {
						mutations.leaderMutation.mutate({
							squadId: modals.leaderSquadId,
							member_id: null,
						})
					}
				}}
				squad={modals.leaderSquad}
			/>

			<ChangeMapModal
				isPending={mutations.mapMutation.isPending}
				onOpenChange={(open) => {
					if (!open) modals.setMapSquadId(null)
				}}
				onSave={() => {
					if (modals.mapSquadId != null) {
						mutations.mapMutation.mutate({
							squadId: modals.mapSquadId,
							map: modals.targetMap,
						})
					}
				}}
				onTargetMapChange={modals.setTargetMap}
				squad={modals.mapSquad}
				targetMap={modals.targetMap}
			/>

			{modals.editingMember && editingCtx && (
				<LoadoutEditorModal
					armors={data.armors}
					builds={data.myBuilds}
					isPending={
						mutations.saveLoadoutMutation.isPending ||
						mutations.setGearOverrideMutation.isPending
					}
					loadout={
						gearOverrideForEdit
							? {
									user_id: editingCtx.clanMemberId,
									data: gearOverrideForEdit,
									is_public: false,
									updated_at: '',
								}
							: modals.editingMember.user_id != null
								? (data.loadoutByUserId.get(
										modals.editingMember.user_id
									) ?? null)
								: null
					}
					onOpenChange={(open) => {
						if (!open) modals.setEditingCtx(null)
					}}
					onSave={(loadout) => {
						if (
							canManage &&
							modals.editingMember?.user_id !== currentUserId
						) {
							mutations.setGearOverrideMutation.mutate({
								squadId:
									modals.activeSquads.find((s) =>
										s.members.some(
											(m) =>
												m.id ===
												editingCtx.squadMemberId
										)
									)?.id ?? 0,
								slot: editingCtx.slot,
								gear_override: loadout,
							})
						} else {
							mutations.saveLoadoutMutation.mutate(loadout)
						}
					}}
					open
					weapons={data.weapons}
				/>
			)}

			<div
				aria-hidden="true"
				className="pointer-events-none fixed top-0 left-2500"
			>
				<SquadPngTemplate
					absentUserIds={data.absentUserIds}
					mapLabel={t(
						SQUAD_MAPS.find((m) => m.value === modals.activeMap)
							?.label ?? modals.activeMap
					)}
					ref={png.pngTemplateRef}
					squads={modals.activeSquads}
				/>
			</div>

			<PngPreviewModal
				onCopy={png.handleCopyPng}
				onDownload={png.handleDownloadPng}
				onOpenChange={png.setShowPngModal}
				open={png.showPngModal}
				previewUrl={png.pngPreviewUrl}
			/>

			<GearEditModals controller={gearEdit} />
		</div>
	)
}
