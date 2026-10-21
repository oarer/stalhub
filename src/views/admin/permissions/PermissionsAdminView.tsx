'use client'

import { Icon } from '@iconify/react'
import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Table } from '@/components/ui/Table'
import { toast } from '@/components/ui/Toast'
import { getQueryClient } from '@/providers/QueryProvider'
import { adminPermissionQueries } from '@/queries/admin/permission.queries'
import { adminPermissionService } from '@/services/admin/permission.service'
import type { AdminPermission } from '@/types/admin.type'
import {
	AdminCreateEntityCard,
	AdminDeleteModal,
	AdminNameDescriptionEditModal,
	AdminTableHeader,
} from '../components/AdminTable'

export default function PermissionsAdminView() {
	const t = useTranslations()
	const queryClient = getQueryClient()

	const { data: permissions } = useSuspenseQuery(
		adminPermissionQueries.list()
	)

	const [createName, setCreateName] = useState('')
	const [createDescription, setCreateDescription] = useState('')
	const [editPerm, setEditPerm] = useState<AdminPermission | null>(null)
	const [editName, setEditName] = useState('')
	const [editDescription, setEditDescription] = useState('')

	const createMutation = useMutation({
		mutationFn: () =>
			adminPermissionService.create({
				name: createName,
				description: createDescription || undefined,
			}),
		onSuccess: () => {
			toast.success(t('admin.permissions.toast.created'))
			queryClient.invalidateQueries({
				queryKey: ['admin', 'permissions'],
			})
			setCreateName('')
			setCreateDescription('')
		},
		onError: () => toast.error(t('admin.permissions.toast.createError')),
	})

	const updateMutation = useMutation({
		mutationFn: () =>
			adminPermissionService.update(editPerm!.id, {
				name: editName,
				description: editDescription || undefined,
			}),
		onSuccess: () => {
			toast.success(t('admin.permissions.toast.updated'))
			queryClient.invalidateQueries({
				queryKey: ['admin', 'permissions'],
			})
			setEditPerm(null)
		},
		onError: () => toast.error(t('admin.permissions.toast.updateError')),
	})

	const deleteMutation = useMutation({
		mutationFn: (id: number) => adminPermissionService.delete(id),
		onSuccess: () => {
			toast.success(t('admin.permissions.toast.deleted'))
			queryClient.invalidateQueries({
				queryKey: ['admin', 'permissions'],
			})
		},
		onError: () => toast.error(t('admin.permissions.toast.deleteError')),
	})

	const openEdit = (perm: AdminPermission) => {
		setEditPerm(perm)
		setEditName(perm.name)
		setEditDescription(perm.description ?? '')
	}

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<h1 className="font-semibold text-2xl">
					{t('admin.permissions.title')}
				</h1>
				<span className="text-neutral-400 text-sm">
					{permissions?.length ?? 0} {t('admin.permissions.total')}
				</span>
			</div>

			<AdminCreateEntityCard
				description={createDescription}
				disabled={!createName}
				loading={createMutation.isPending}
				name={createName}
				onDescriptionChange={setCreateDescription}
				onNameChange={setCreateName}
				onSubmit={() => createMutation.mutate()}
				submitLabel={t('admin.permissions.createBtn')}
				title={t('admin.permissions.create')}
			/>

			<Card.Root className="overflow-hidden p-0">
				<div className="overflow-x-auto">
					<Table.Root>
						<AdminTableHeader
							columns={[
								{
									key: 'name',
									label: t('admin.permissions.name'),
								},
								{
									key: 'description',
									label: t('admin.permissions.description'),
								},
							]}
						/>
						<Table.Body>
							{permissions?.map((perm) => (
								<Table.Row key={perm.id}>
									<Table.Cell>
										<span className="font-mono text-neutral-400 text-xs">
											{perm.id}
										</span>
									</Table.Cell>
									<Table.Cell>
										<span className="font-semibold">
											{perm.name}
										</span>
									</Table.Cell>
									<Table.Cell>
										<span className="text-neutral-400 text-sm">
											{perm.description ?? '—'}
										</span>
									</Table.Cell>
									<Table.Cell>
										<div className="flex items-center gap-1">
											<Button
												onClick={() => openEdit(perm)}
												size="sm"
												variant="ghost"
											>
												<Icon icon="lucide:pencil" />
											</Button>
											<AdminDeleteModal
												cancelLabel={t(
													'admin.permissions.cancel'
												)}
												confirmLabel={t(
													'admin.permissions.deleteConfirm'
												)}
												description={t(
													'admin.permissions.deleteDescription',
													{
														name: perm.name,
													}
												)}
												onConfirm={() =>
													deleteMutation.mutate(
														perm.id
													)
												}
												title={t(
													'admin.permissions.deleteTitle'
												)}
											/>
										</div>
									</Table.Cell>
								</Table.Row>
							))}
						</Table.Body>
					</Table.Root>
				</div>
			</Card.Root>

			<AdminNameDescriptionEditModal
				cancelLabel={t('admin.permissions.cancel')}
				description={editDescription}
				name={editName}
				onDescriptionChange={setEditDescription}
				onNameChange={setEditName}
				onOpenChange={(o) => {
					if (!o) setEditPerm(null)
				}}
				onSave={() => updateMutation.mutate()}
				open={!!editPerm}
				saveLabel={t('admin.permissions.save')}
				title={t('admin.permissions.edit')}
			/>
		</div>
	)
}
