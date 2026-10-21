'use client'

import { Icon } from '@iconify/react'
import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { CheckBox } from '@/components/ui/CheckBox'
import { Modal } from '@/components/ui/Modal'
import { Table } from '@/components/ui/Table'
import { toast } from '@/components/ui/Toast'
import { getQueryClient } from '@/providers/QueryProvider'
import { adminPermissionQueries } from '@/queries/admin/permission.queries'
import { adminRoleQueries } from '@/queries/admin/role.queries'
import { adminRoleService } from '@/services/admin/role.service'
import type { AdminRole } from '@/types/admin.type'
import {
	AdminCreateEntityCard,
	AdminDeleteModal,
	AdminNameDescriptionEditModal,
	AdminTableHeader,
} from '../components/AdminTable'

export default function RolesAdminView() {
	const t = useTranslations()
	const queryClient = getQueryClient()
	const { data: roles } = useSuspenseQuery(adminRoleQueries.list())
	const { data: permissions } = useSuspenseQuery(
		adminPermissionQueries.list()
	)

	const [createName, setCreateName] = useState('')
	const [createDescription, setCreateDescription] = useState('')
	const [editRole, setEditRole] = useState<AdminRole | null>(null)
	const [editName, setEditName] = useState('')
	const [editDescription, setEditDescription] = useState('')
	const [permissionsRole, setPermissionsRole] = useState<AdminRole | null>(
		null
	)
	const [selectedPermissions, setSelectedPermissions] = useState<number[]>([])

	const createMutation = useMutation({
		mutationFn: () =>
			adminRoleService.create({
				name: createName,
				description: createDescription || undefined,
			}),
		onSuccess: () => {
			toast.success(t('admin.roles.toast.created'))
			queryClient.invalidateQueries({ queryKey: ['admin', 'roles'] })
			setCreateName('')
			setCreateDescription('')
		},
		onError: () => toast.error(t('admin.permissions.toast.createError')),
	})

	const updateMutation = useMutation({
		mutationFn: () =>
			adminRoleService.update(editRole!.id, {
				name: editName,
				description: editDescription || undefined,
			}),
		onSuccess: () => {
			toast.success(t('admin.roles.toast.updated'))
			queryClient.invalidateQueries({ queryKey: ['admin', 'roles'] })
			setEditRole(null)
		},
		onError: () => toast.error(t('admin.permissions.toast.updateError')),
	})

	const deleteMutation = useMutation({
		mutationFn: (id: number) => adminRoleService.delete(id),
		onSuccess: () => {
			toast.success(t('admin.roles.toast.deleted'))
			queryClient.invalidateQueries({ queryKey: ['admin', 'roles'] })
		},
		onError: () => toast.error(t('admin.permissions.toast.deleteError')),
	})

	const assignPermissionsMutation = useMutation({
		mutationFn: () =>
			adminRoleService.assignPermissions(permissionsRole!.id, {
				permission_ids: selectedPermissions,
			}),
		onSuccess: () => {
			toast.success(t('admin.roles.toast.permissionsUpdated'))
			queryClient.invalidateQueries({ queryKey: ['admin', 'roles'] })
			setPermissionsRole(null)
		},
		onError: () =>
			toast.error(t('admin.roles.toast.permissionsUpdateError')),
	})

	const openEdit = (role: AdminRole) => {
		setEditRole(role)
		setEditName(role.name)
		setEditDescription(role.description ?? '')
	}

	const openPermissions = (role: AdminRole) => {
		setPermissionsRole(role)
		setSelectedPermissions(role.permissions.map((p) => p.id))
	}

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<h1 className="font-semibold text-2xl">
					{t('admin.roles.title')}
				</h1>
				<span className="text-neutral-400 text-sm">
					{roles?.length ?? 0} {t('admin.permissions.total')}
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
				submitLabel={t('clan.common.create')}
				title={t('admin.roles.create')}
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
								{
									key: 'permissions',
									label: t('admin.roles.permissions'),
								},
							]}
						/>
						<Table.Body>
							{roles?.map((role) => (
								<Table.Row key={role.id}>
									<Table.Cell>
										<span className="font-mono text-neutral-400 text-xs">
											{role.id}
										</span>
									</Table.Cell>
									<Table.Cell>
										<span className="font-semibold">
											{role.name}
										</span>
									</Table.Cell>
									<Table.Cell>
										<span className="text-neutral-400 text-sm">
											{role.description ?? '—'}
										</span>
									</Table.Cell>
									<Table.Cell>
										<span className="text-sm">
											{role.permissions.length}
										</span>
									</Table.Cell>
									<Table.Cell>
										<div className="flex items-center gap-1">
											<Button
												onClick={() =>
													openPermissions(role)
												}
												size="sm"
												variant="ghost"
											>
												<Icon icon="lucide:key" />
											</Button>
											<Button
												onClick={() => openEdit(role)}
												size="sm"
												variant="ghost"
											>
												<Icon icon="lucide:pencil" />
											</Button>
											<AdminDeleteModal
												cancelLabel={t(
													'clan.common.cancel'
												)}
												confirmLabel={t(
													'clan.common.delete'
												)}
												description={t.rich(
													'admin.roles.deleteDescription',
													{
														name: role.name,
														strong: (chunks) => (
															<strong>
																{chunks}
															</strong>
														),
													}
												)}
												onConfirm={() =>
													deleteMutation.mutate(
														role.id
													)
												}
												title={t(
													'admin.roles.deleteTitle'
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
				cancelLabel={t('clan.common.cancel')}
				description={editDescription}
				name={editName}
				onDescriptionChange={setEditDescription}
				onNameChange={setEditName}
				onOpenChange={(o) => {
					if (!o) setEditRole(null)
				}}
				onSave={() => updateMutation.mutate()}
				open={!!editRole}
				saveLabel={t('clan.common.save')}
				title={t('admin.roles.edit')}
			/>

			<Modal.Root
				onOpenChange={(o) => {
					if (!o) setPermissionsRole(null)
				}}
				open={!!permissionsRole}
			>
				<Modal.Content fullScreen={false}>
					<Modal.Header>
						<Modal.Title>
							{t('admin.roles.permissionsTitle', {
								name: permissionsRole?.name ?? '',
							})}
						</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<div className="flex max-h-80 flex-col gap-2 overflow-y-auto">
							{permissions?.map((perm) => (
								<CheckBox
									checked={selectedPermissions.includes(
										perm.id
									)}
									description={perm.description ?? undefined}
									key={perm.id}
									label={perm.name}
									onCheckedChange={(checked: boolean) => {
										setSelectedPermissions((prev) =>
											checked
												? [...prev, perm.id]
												: prev.filter(
														(id) => id !== perm.id
													)
										)
									}}
								/>
							))}
						</div>
					</Modal.Body>
					<Modal.Footer>
						<Modal.Close>{t('clan.common.cancel')}</Modal.Close>
						<Modal.Action
							closeOnClick
							onClick={() => assignPermissionsMutation.mutate()}
						>
							{t('clan.common.save')}
						</Modal.Action>
					</Modal.Footer>
				</Modal.Content>
			</Modal.Root>
		</div>
	)
}
