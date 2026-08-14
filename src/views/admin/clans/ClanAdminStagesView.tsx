'use client'

import { Icon } from '@iconify/react'
import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Combobox } from '@/components/ui/Combobox'
import Input from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Table } from '@/components/ui/Table'
import { toast } from '@/components/ui/Toast'
import { getQueryClient } from '@/providers/QueryProvider'
import { adminClanQueries } from '@/queries/admin/clan.queries'
import { adminClanService } from '@/services/admin/clan.service'
import type { AdminClanStage } from '@/types/admin.type'
import { formatDate } from '@/lib/date'

const STAGE_TYPE_VARIANTS: Record<
	string,
	'primary' | 'secondary' | 'success' | 'exbo'
> = {
	TOURNAMENT: 'primary',
	BRAWL: 'success',
	BASE_CAPTURE: 'exbo',
}

function toDateTimeLocal(iso: string | null) {
	if (!iso) return ''
	const d = new Date(iso)
	if (Number.isNaN(d.getTime())) return ''
	const pad = (n: number) => String(n).padStart(2, '0')
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function StageEditModal({
	stage,
	onClose,
}: {
	stage: AdminClanStage | null
	onClose: () => void
}) {
	const t = useTranslations()
	const queryClient = getQueryClient()

	const [mapName, setMapName] = useState(stage?.map_name ?? '')
	const [type, setType] = useState(stage?.type ?? 'TOURNAMENT')
	const [stageNumber, setStageNumber] = useState(
		stage?.stage_number != null ? String(stage.stage_number) : ''
	)
	const [startedAt, setStartedAt] = useState(
		toDateTimeLocal(stage?.started_at ?? null)
	)
	const [endedAt, setEndedAt] = useState(
		toDateTimeLocal(stage?.ended_at ?? null)
	)
	const [region, setRegion] = useState(stage?.region ?? 'RU')

	const invalidate = () => {
		queryClient.invalidateQueries({
			queryKey: ['admin', 'clan', stage?.clanId, 'stages'],
		})
	}

	const updateMutation = useMutation({
		mutationFn: () =>
			adminClanService.updateStage(stage!.id, {
				map_name: mapName || undefined,
				type:
					(type as 'TOURNAMENT' | 'BRAWL' | 'BASE_CAPTURE') ||
					undefined,
				stage_number: stageNumber === '' ? null : Number(stageNumber),
				started_at: startedAt
					? new Date(startedAt).toISOString()
					: null,
				ended_at: endedAt ? new Date(endedAt).toISOString() : null,
				region: region || undefined,
			}),
		onSuccess: () => {
			toast.success(t('admin.clans.stages.toast.updated'))
			invalidate()
			onClose()
		},
		onError: () => toast.error(t('admin.clans.stages.toast.updateError')),
	})

	return (
		<Modal.Root onOpenChange={(open) => !open && onClose()} open>
			<Modal.Content fullScreen={false}>
				<Modal.Header>
					<Modal.Title>
						{t('admin.clans.stages.editTitle', {
							id: stage?.id ?? 0,
						})}
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<div className="flex flex-col gap-4">
						<Input
							label="admin.clans.stages.mapName"
							onChange={(e) => setMapName(e.target.value)}
							value={mapName}
						/>
						<div className="grid grid-cols-2 gap-3">
							<Combobox
								onValueChange={(v) =>
									setType(
										v as
											| 'TOURNAMENT'
											| 'BRAWL'
											| 'BASE_CAPTURE'
									)
								}
								options={[
									{
										value: 'TOURNAMENT',
										label: 'admin.clans.stages.type.TOURNAMENT',
									},
									{
										value: 'BRAWL',
										label: 'admin.clans.stages.type.BRAWL',
									},
									{
										value: 'BASE_CAPTURE',
										label: 'admin.clans.stages.type.BASE_CAPTURE',
									},
								]}
								placeholder="admin.clans.stages.table.type"
								value={type}
							/>
							<Input
								label="admin.clans.stages.stageNumber"
								onChange={(e) => setStageNumber(e.target.value)}
								type="number"
								value={stageNumber}
							/>
						</div>
						<div className="grid grid-cols-2 gap-3">
							<Input
								label="admin.clans.stages.startedAt"
								onChange={(e) => setStartedAt(e.target.value)}
								type="datetime-local"
								value={startedAt}
							/>
							<Input
								label="admin.clans.stages.endedAt"
								onChange={(e) => setEndedAt(e.target.value)}
								type="datetime-local"
								value={endedAt}
							/>
						</div>
						<Input
							label="admin.clans.detail.region"
							onChange={(e) => setRegion(e.target.value)}
							value={region}
						/>
					</div>
				</Modal.Body>
				<Modal.Footer>
					<Modal.Close>{t('admin.clans.stages.cancel')}</Modal.Close>
					<Modal.Action onClick={() => updateMutation.mutate()}>
						{t('admin.clans.stages.save')}
					</Modal.Action>
				</Modal.Footer>
			</Modal.Content>
		</Modal.Root>
	)
}

export default function ClanAdminStagesView({ clanId }: { clanId: string }) {
	const t = useTranslations()
	const queryClient = getQueryClient()

	const { data: stages } = useSuspenseQuery(
		adminClanQueries.getStages(clanId)
	)

	const [editingStage, setEditingStage] = useState<AdminClanStage | null>(
		null
	)
	const [deletingStage, setDeletingStage] = useState<AdminClanStage | null>(
		null
	)

	const deleteMutation = useMutation({
		mutationFn: (stageId: number) => adminClanService.deleteStage(stageId),
		onSuccess: () => {
			toast.success(t('admin.clans.stages.toast.deleted'))
			queryClient.invalidateQueries({
				queryKey: ['admin', 'clan', clanId, 'stages'],
			})
			setDeletingStage(null)
		},
		onError: () => toast.error(t('admin.clans.stages.toast.deleteError')),
	})

	return (
		<Card.Root className="overflow-hidden p-0">
			{stages?.length ? (
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>
								{t('admin.clans.stages.table.id')}
							</Table.Head>
							<Table.Head>
								{t('admin.clans.stages.table.map')}
							</Table.Head>
							<Table.Head>
								{t('admin.clans.stages.table.type')}
							</Table.Head>
							<Table.Head>
								{t('admin.clans.stages.table.stage')}
							</Table.Head>
							<Table.Head>
								{t('admin.clans.stages.table.date')}
							</Table.Head>
							<Table.Head>
								{t('admin.clans.stages.table.screenshots')}
							</Table.Head>
							<Table.Head>
								{t('admin.clans.stages.table.attendance')}
							</Table.Head>
							<Table.Head />
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{stages.map((stage) => (
							<Table.Row key={stage.id}>
								<Table.Cell>#{stage.id}</Table.Cell>
								<Table.Cell>
									<span className="font-semibold">
										{stage.map_name}
									</span>
								</Table.Cell>
								<Table.Cell>
									<Badge
										variant={
											STAGE_TYPE_VARIANTS[stage.type] ??
											'secondary'
										}
									>
										{t(
											`admin.clans.stages.type.${stage.type}`
										)}
									</Badge>
								</Table.Cell>
								<Table.Cell>
									{stage.stage_number ?? '—'}
								</Table.Cell>
								<Table.Cell>
									{new Date(stage.started_at).toLocaleString(
										'ru-RU'
									)}
								</Table.Cell>
								<Table.Cell>
									{stage._count.screenshots}
								</Table.Cell>
								<Table.Cell>
									{stage._count.attendance}
								</Table.Cell>
								<Table.Cell>
									<div className="flex items-center gap-2">
										<Button
											onClick={() =>
												setEditingStage(stage)
											}
											size="sm"
											variant="ghost"
										>
											<Icon icon="lucide:edit" />
										</Button>
										<Button
											onClick={() =>
												setDeletingStage(stage)
											}
											size="sm"
											variant="ghost"
										>
											<Icon
												className="text-red-400"
												icon="lucide:trash-2"
											/>
										</Button>
									</div>
								</Table.Cell>
							</Table.Row>
						))}
					</Table.Body>
				</Table.Root>
			) : (
				<Card.Content className="py-8 text-center text-neutral-400">
					{t('admin.clans.stages.empty')}
				</Card.Content>
			)}

			{editingStage && (
				<StageEditModal
					onClose={() => setEditingStage(null)}
					stage={editingStage}
				/>
			)}

			{deletingStage && (
				<Modal.Root
					onOpenChange={(open) => !open && setDeletingStage(null)}
					open
				>
					<Modal.Content fullScreen={false}>
						<Modal.Header>
							<Modal.Title>
								{t('admin.clans.stages.deleteTitle')}
							</Modal.Title>
							<Modal.Description>
								{t('admin.clans.stages.deleteDescription', {
									map: deletingStage.map_name,
									date: formatDate(deletingStage.started_at)
								})}
							</Modal.Description>
						</Modal.Header>
						<Modal.Footer>
							<Modal.Close>
								{t('admin.clans.stages.cancel')}
							</Modal.Close>
							<Modal.Action
								onClick={() =>
									deleteMutation.mutate(deletingStage.id)
								}
								variant="danger"
							>
								{t('admin.clans.stages.delete')}
							</Modal.Action>
						</Modal.Footer>
					</Modal.Content>
				</Modal.Root>
			)}
		</Card.Root>
	)
}
