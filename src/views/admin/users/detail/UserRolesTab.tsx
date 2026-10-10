'use client'

import { Icon } from '@iconify/react'
import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { toast } from '@/components/ui/Toast'
import { getQueryClient } from '@/providers/QueryProvider'
import { adminRoleQueries } from '@/queries/admin/role.queries'
import { adminUserQueries } from '@/queries/admin/user.queries'
import { adminUserService } from '@/services/admin/user.service'
import { DeleteConfirmContent } from '../../components/AdminTable'

export function UserRolesTab({ userId }: { userId: number }) {
	const t = useTranslations()
	const queryClient = getQueryClient()

	const { data: userRoles } = useSuspenseQuery(
		adminUserQueries.getRoles(userId)
	)
	const { data: allRoles } = useSuspenseQuery(adminRoleQueries.list())

	const assignRoleMutation = useMutation({
		mutationFn: (roleId: number) =>
			adminUserService.assignRole(userId, roleId),
		onSuccess: () => {
			toast.success(t('admin.userDetail.toast.roleAssigned'))
			queryClient.invalidateQueries({
				queryKey: ['admin', 'user', userId, 'roles'],
			})
		},
		onError: () => toast.error(t('admin.userDetail.toast.roleAssignError')),
	})

	const removeRoleMutation = useMutation({
		mutationFn: (roleId: number) =>
			adminUserService.removeRole(userId, roleId),
		onSuccess: () => {
			toast.success(t('admin.userDetail.toast.roleRemoved'))
			queryClient.invalidateQueries({
				queryKey: ['admin', 'user', userId, 'roles'],
			})
		},
		onError: () => toast.error(t('admin.userDetail.toast.roleRemoveError')),
	})

	const userRoleIds = new Set(userRoles?.map((r) => r.id) ?? [])
	const availableRoles = allRoles?.filter((r) => !userRoleIds.has(r.id)) ?? []

	return (
		<Card.Root>
			<Card.Header>
				<div className="flex items-center justify-between">
					<Card.Title>
						<Icon icon="lucide:shield" />
						{t('admin.userDetail.roles.title')}
					</Card.Title>
					{availableRoles.length > 0 && (
						<Modal.Root>
							<Modal.Trigger>
								<Icon icon="lucide:plus" />
								{t('admin.userDetail.roles.add')}
							</Modal.Trigger>
							<Modal.Content fullScreen={false}>
								<Modal.Header>
									<Modal.Title>
										{t('admin.userDetail.roles.add')}
									</Modal.Title>
								</Modal.Header>
								<Modal.Body>
									<div className="flex flex-col gap-2">
										{availableRoles.map((role) => (
											<Button
												className="justify-start"
												key={role.id}
												onClick={() =>
													assignRoleMutation.mutate(
														role.id
													)
												}
												variant="outline"
											>
												{role.name}
												{role.description && (
													<span className="ml-2 text-neutral-400 text-xs">
														— {role.description}
													</span>
												)}
											</Button>
										))}
									</div>
								</Modal.Body>
								<Modal.Footer>
									<Modal.Close>
										{t('admin.userDetail.close')}
									</Modal.Close>
								</Modal.Footer>
							</Modal.Content>
						</Modal.Root>
					)}
				</div>
			</Card.Header>
			<Card.Content>
				{userRoles && userRoles.length > 0 ? (
					<div className="flex flex-col gap-2">
						{userRoles.map((role) => (
							<div
								className="flex items-center justify-between rounded-lg bg-card/50 px-3 py-2"
								key={role.id}
							>
								<div>
									<p className="font-semibold text-sm">
										{role.name}
									</p>
									{role.description && (
										<p className="text-neutral-400 text-xs">
											{role.description}
										</p>
									)}
								</div>
								<Modal.Root>
									<Modal.Trigger variant="ghost">
										<Icon
											className="text-red-400"
											icon="lucide:x"
										/>
									</Modal.Trigger>
									<Modal.Content fullScreen={false}>
										<DeleteConfirmContent
											cancelLabel={t(
												'admin.userDetail.cancel'
											)}
											confirmLabel={t(
												'admin.userDetail.roles.removeConfirm'
											)}
											description={t(
												'admin.userDetail.roles.removeDescription',
												{ name: role.name }
											)}
											onConfirm={() =>
												removeRoleMutation.mutate(
													role.id
												)
											}
											title={t(
												'admin.userDetail.roles.removeTitle'
											)}
										/>
									</Modal.Content>
								</Modal.Root>
							</div>
						))}
					</div>
				) : (
					<p className="text-neutral-400 text-sm">
						{t('admin.userDetail.roles.empty')}
					</p>
				)}
			</Card.Content>
		</Card.Root>
	)
}
