'use client'

import { Icon } from '@iconify/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { clanQueries } from '@/queries/clan/clan.queries'
import { LoadoutEditorModal } from '../me/components/LoadoutEditorModal'
import { AssignLeaderModal } from './components/squads/AssignLeaderModal'
import { AssignMemberModal } from './components/squads/AssignMemberModal'
import { ChangeMapModal } from './components/squads/ChangeMapModal'
import { CreateSquadModal } from './components/squads/CreateSquadModal'
import { MapTabs } from './components/squads/MapTabs'
import { PngPreviewModal } from './components/squads/PngPreviewModal'
import { SquadCard } from './components/squads/SquadCard'
import { SquadDndProvider } from './components/squads/SquadDnd'
import { SquadPngTemplate } from './components/squads/SquadPngTemplate'
import { SQUAD_MAPS } from './components/squads/squads.const'
import { useClanSquads } from './hooks/useClanSquads'

export default function ClanSquadsView() {
	const { data: profile } = useSuspenseQuery(clanQueries.getMe())
	const clanId = profile?.clan?.id
	if (!clanId) return null

	return <ClanSquadsContent clanId={clanId} currentUserId={profile?.userId} />
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
				<h1 className="font-semibold text-lg">
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
					{data.isOfficer && (
						<CreateSquadModal
							isPending={mutations.createMutation.isPending}
							map={modals.newMap}
							name={modals.newName}
							onMapChange={modals.setNewMap}
							onNameChange={modals.setNewName}
							onOpenChange={(open) => {
								if (open) modals.setNewMap(modals.activeMap)
								modals.setCreateOpen(open)
							}}
							onSave={() =>
								mutations.createMutation.mutate({
									name: modals.newName.trim(),
									map: modals.newMap,
								})
							}
							open={modals.createOpen}
						/>
					)}
				</div>
			</div>

			<AssignMemberModal
				members={mutations.unassignedMembers()}
				onAssign={(memberId) => {
					if (
						modals.assignSquadId != null &&
						modals.assignSlot != null
					) {
						mutations.assignMutation.mutate({
							squadId: modals.assignSquadId,
							memberId,
							slot: modals.assignSlot,
						})
					}
				}}
				onOpenChange={(open) => {
					if (!open) {
						modals.setAssignSquadId(null)
						modals.setAssignSlot(null)
					}
				}}
				slot={modals.assignSlot}
				squadId={modals.assignSquadId}
			/>

			<AssignLeaderModal
				isPending={mutations.leaderMutation.isPending}
				onAssign={(memberId) => {
					if (modals.leaderSquadId != null) {
						mutations.leaderMutation.mutate({
							squadId: modals.leaderSquadId,
							memberId,
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
							memberId: null,
						})
					}
				}}
				squad={modals.leaderSquad}
			/>

			<MapTabs
				activeMap={modals.activeMap}
				isOfficer={data.isOfficer}
				onActiveMapChange={modals.setActiveMap}
				squadCount={modals.activeSquads.length}
			>
				<SquadDndProvider>
					{modals.activeSquads.map((squad) => (
						<SquadCard
							absentUserIds={data.absentUserIds}
							armors={data.armors}
							buildById={data.buildById}
							currentUserId={currentUserId}
							isApprovePending={
								mutations.approveMutation.isPending
							}
							isDeletePending={mutations.deleteMutation.isPending}
							isJoinPending={mutations.joinMutation.isPending}
							isLeaderPending={mutations.leaderMutation.isPending}
							isOfficer={data.isOfficer}
							isRejectPending={mutations.rejectMutation.isPending}
							key={squad.id}
							loadoutByUserId={data.loadoutByUserId}
							myMemberId={data.myMemberId}
							onApprove={(requestId) =>
								mutations.approveMutation.mutate(requestId)
							}
							onDelete={() =>
								mutations.deleteMutation.mutate(squad.id)
							}
							onEditLoadout={(memberId) =>
								modals.setEditingMemberId(memberId)
							}
							onJoin={() =>
								mutations.joinMutation.mutate(squad.id)
							}
							onMove={mutations.moveMember}
							onOpenAssign={(slot) => {
								modals.setAssignSquadId(squad.id)
								modals.setAssignSlot(slot)
							}}
							onOpenLeader={() =>
								modals.setLeaderSquadId(squad.id)
							}
							onOpenMap={() => {
								modals.setTargetMap(squad.map)
								modals.setMapSquadId(squad.id)
							}}
							onReject={(requestId) =>
								mutations.rejectMutation.mutate(requestId)
							}
							onRemoveMember={(slot) =>
								mutations.removeMutation.mutate({
									squadId: squad.id,
									slot,
								})
							}
							pendingRequest={
								data.pendingRequest.get(squad.id) ?? false
							}
							squad={squad}
							weapons={data.weapons}
						/>
					))}
				</SquadDndProvider>
			</MapTabs>

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

			{modals.editingMember && (
				<LoadoutEditorModal
					armors={data.armors}
					builds={data.myBuilds}
					isPending={mutations.saveLoadoutMutation.isPending}
					loadout={
						modals.editingMember.userId != null
							? (data.loadoutByUserId.get(
									modals.editingMember.userId
								) ?? null)
							: null
					}
					onOpenChange={(open) => {
						if (!open) modals.setEditingMemberId(null)
					}}
					onSave={(loadout) =>
						mutations.saveLoadoutMutation.mutate(loadout)
					}
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
		</div>
	)
}
