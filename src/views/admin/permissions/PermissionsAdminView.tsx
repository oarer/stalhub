'use client'

import { Icon } from '@iconify/react'
import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Table } from '@/components/ui/Table'
import { toast } from '@/components/ui/Toast'
import { getQueryClient } from '@/providers/QueryProvider'
import { adminPermissionQueries } from '@/queries/admin/permission.queries'
import { adminPermissionService } from '@/services/admin/permission.service'
import type { AdminPermission } from '@/types/admin.type'

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
			<div className="flex items-center justify-between">
				<h1 className="font-semibold text-2xl">
					{t('admin.permissions.title')}
				</h1>
				<span className="text-neutral-400 text-sm">
					{permissions?.length ?? 0} {t('admin.permissions.total')}
				</span>
			</div>

			<Card.Root>
				<Card.Header>
					<Card.Title>
						<Icon icon="lucide:plus" />
						{t('admin.permissions.create')}
					</Card.Title>
				</Card.Header>
				<Card.Content>
					<div className="flex items-end gap-3">
						<div className="flex-1">
							<Input
								label={t('admin.permissions.name')}
								onChange={(
									e: React.ChangeEvent<HTMLInputElement>
								) => setCreateName(e.target.value)}
								value={createName}
							/>
						</div>
						<div className="flex-1">
							<Input
								label={t('admin.permissions.description')}
								onChange={(
									e: React.ChangeEvent<HTMLInputElement>
								) => setCreateDescription(e.target.value)}
								value={createDescription}
							/>
						</div>
						<Button
							disabled={!createName}
							loading={createMutation.isPending}
							onClick={() => createMutation.mutate()}
						>
							{t('admin.permissions.createBtn')}
						</Button>
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root className="overflow-hidden p-0">
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>ID</Table.Head>
							<Table.Head>
								{t('admin.permissions.name')}
							</Table.Head>
							<Table.Head>
								{t('admin.permissions.description')}
							</Table.Head>
							<Table.Head />
						</Table.Row>
					</Table.Header>
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
										<Modal.Root>
											<Modal.Trigger variant="ghost">
												<Icon
													className="text-red-400"
													icon="lucide:trash-2"
												/>
											</Modal.Trigger>
											<Modal.Content fullScreen={false}>
												<Modal.Header>
													<Modal.Title>
														{t(
															'admin.permissions.deleteTitle'
														)}
													</Modal.Title>
													<Modal.Description>
														{t(
															'admin.permissions.deleteDescription',
															{ name: perm.name }
														)}
													</Modal.Description>
												</Modal.Header>
												<Modal.Footer>
													<Modal.Close>
														{t(
															'admin.permissions.cancel'
														)}
													</Modal.Close>
													<Modal.Action
														closeOnClick
														onClick={() =>
															deleteMutation.mutate(
																perm.id
															)
														}
														variant="danger"
													>
														{t(
															'admin.permissions.deleteConfirm'
														)}
													</Modal.Action>
												</Modal.Footer>
											</Modal.Content>
										</Modal.Root>
									</div>
								</Table.Cell>
							</Table.Row>
						))}
					</Table.Body>
				</Table.Root>
			</Card.Root>

			<Modal.Root
				onOpenChange={(o) => {
					if (!o) setEditPerm(null)
				}}
				open={!!editPerm}
			>
				<Modal.Content fullScreen={false}>
					<Modal.Header>
						<Modal.Title>{t('admin.permissions.edit')}</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<div className="flex flex-col gap-4">
							<Input
								label={t('admin.permissions.name')}
								onChange={(
									e: React.ChangeEvent<HTMLInputElement>
								) => setEditName(e.target.value)}
								value={editName}
							/>
							<Input
								label={t('admin.permissions.description')}
								onChange={(
									e: React.ChangeEvent<HTMLInputElement>
								) => setEditDescription(e.target.value)}
								value={editDescription}
							/>
						</div>
					</Modal.Body>
					<Modal.Footer>
						<Modal.Close>
							{t('admin.permissions.cancel')}
						</Modal.Close>
						<Modal.Action
							closeOnClick
							onClick={() => updateMutation.mutate()}
						>
							{t('admin.permissions.save')}
						</Modal.Action>
					</Modal.Footer>
				</Modal.Content>
			</Modal.Root>
		</div>
	)
}
