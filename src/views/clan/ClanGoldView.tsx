'use client'

import { Icon } from '@iconify/react'
import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import { Skeleton } from '@/components/ui/Skeleton'
import { toast } from '@/components/ui/Toast'
import { getQueryClient } from '@/providers/QueryProvider'
import { clanQueries } from '@/queries/clan/clan.queries'
import { clanService } from '@/services/clan/clan.service'
import type { GoldDropStatus } from '@/types/clan/clan.type'
import { AttendeesModal } from './components/gold/AttendeesModal'
import { GoldDropCard } from './components/gold/GoldDropCard'
import { useClanRoles } from './hooks/useClanRoles'

export default function ClanGoldView() {
	const { data: profile } = useSuspenseQuery(clanQueries.getMe())
	const clanId = profile?.clan?.id
	if (!clanId) return null

	return <ClanGoldContent clanId={clanId} />
}

function ClanGoldContent({ clanId }: { clanId: string }) {
	const t = useTranslations()
	const queryClient = getQueryClient()
	const { members, isOfficer } = useClanRoles()
	const { data: drops, isLoading } = useSuspenseQuery(
		clanQueries.getGoldDrops(clanId)
	)

	const [editDropId, setEditDropId] = useState<number | null>(null)
	const [selectedIds, setSelectedIds] = useState<number[]>([])

	const editDrop = drops?.find((d) => d.id === editDropId) ?? null

	const invalidate = () =>
		queryClient.invalidateQueries({ queryKey: ['clan', clanId, 'gold'] })

	const attendeesMutation = useMutation({
		mutationFn: ({
			dropId,
			memberIds,
		}: {
			dropId: number
			memberIds: number[]
		}) => clanService.setGoldAttendees(dropId, memberIds),
		onSuccess: () => {
			setEditDropId(null)
			invalidate()
		},
		onError: () => {
			toast.error(t('clan.gold.toasts.attendeesError'))
		},
	})

	const statusMutation = useMutation({
		mutationFn: ({
			dropId,
			status,
		}: {
			dropId: number
			status: GoldDropStatus
		}) => clanService.setGoldStatus(dropId, status),
		onSuccess: () => invalidate(),
		onError: () => {
			toast.error(t('clan.gold.toasts.statusError'))
		},
	})

	const attendeeIdSet = useMemo(() => {
		const set = new Set<number>()
		for (const drop of drops ?? []) {
			for (const a of drop.attendees) set.add(a.memberId)
		}
		return set
	}, [drops])

	const toggleMember = (memberId: number) => {
		setSelectedIds((prev) =>
			prev.includes(memberId)
				? prev.filter((id) => id !== memberId)
				: [...prev, memberId]
		)
	}

	if (isLoading) {
		return (
			<div className="flex flex-col gap-2">
				<Skeleton className="h-16 w-full" />
				<Skeleton className="h-40 w-full" />
				<Skeleton className="h-40 w-full" />
			</div>
		)
	}

	return (
		<div className="flex flex-col gap-4">
			<div>
				<h1 className="font-semibold text-lg">
					{t('clan.gold.title')}
				</h1>
				<p className="font-semibold text-sm text-text-accent">
					{t('clan.gold.desc')}
				</p>
			</div>

			{drops?.length === 0 && (
				<div className="flex flex-col items-center gap-2 rounded-xl bg-background px-5 py-4">
					<Icon className="text-4xl" icon="lucide:coins" />
					<h3 className="font-semibold text-lg">
						{t('clan.gold.empty')}
					</h3>
				</div>
			)}

			{drops?.map((drop) => (
				<GoldDropCard
					drop={drop}
					isAttendeesPending={attendeesMutation.isPending}
					isOfficer={isOfficer}
					isStatusPending={statusMutation.isPending}
					key={drop.id}
					onClaim={() =>
						statusMutation.mutate({
							dropId: drop.id,
							status: 'CLAIMED',
						})
					}
					onOpenAttendees={() => {
						setSelectedIds(drop.attendees.map((a) => a.memberId))
						setEditDropId(drop.id)
					}}
				/>
			))}

			<AttendeesModal
				attendeeIdSet={attendeeIdSet}
				drop={editDrop}
				isPending={attendeesMutation.isPending}
				members={members ?? []}
				onOpenChange={(open) => {
					if (!open) setEditDropId(null)
				}}
				onSave={() => {
					if (editDropId != null) {
						attendeesMutation.mutate({
							dropId: editDropId,
							memberIds: selectedIds,
						})
					}
				}}
				onToggleMember={toggleMember}
				selectedIds={selectedIds}
			/>
		</div>
	)
}
