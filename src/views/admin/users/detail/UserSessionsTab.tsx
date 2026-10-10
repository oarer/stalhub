'use client'

import { Icon } from '@iconify/react'
import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { Table } from '@/components/ui/Table'
import { toast } from '@/components/ui/Toast'
import { getQueryClient } from '@/providers/QueryProvider'
import { adminUserQueries } from '@/queries/admin/user.queries'
import { adminUserService } from '@/services/admin/user.service'
import { DeleteConfirmContent } from '../../components/AdminTable'

export function UserSessionsTab({ userId }: { userId: number }) {
	const t = useTranslations()
	const queryClient = getQueryClient()

	const { data: sessions } = useSuspenseQuery(
		adminUserQueries.getSessions(userId)
	)

	const revokeSessionMutation = useMutation({
		mutationFn: (sessionId: string) =>
			adminUserService.revokeSession(userId, sessionId),
		onSuccess: () => {
			toast.success(t('admin.userDetail.toast.sessionRevoked'))
			queryClient.invalidateQueries({
				queryKey: ['admin', 'user', userId, 'sessions'],
			})
		},
		onError: () =>
			toast.error(t('admin.userDetail.toast.sessionRevokeError')),
	})

	return (
		<Card.Root className="overflow-hidden p-0">
			<div className="overflow-x-auto">
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>ID</Table.Head>
							<Table.Head>IP</Table.Head>
							<Table.Head>
								{t('admin.userDetail.sessions.device')}
							</Table.Head>
							<Table.Head>
								{t('admin.userDetail.sessions.created')}
							</Table.Head>
							<Table.Head>
								{t('admin.userDetail.sessions.active')}
							</Table.Head>
							<Table.Head />
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{sessions?.map((session) => (
							<Table.Row key={session.id}>
								<Table.Cell>
									<span
										className={`font-mono font-semibold text-neutral-400 text-xs`}
									>
										{session.id}
									</span>
								</Table.Cell>
								<Table.Cell>
									<span className={`font-mono font-semibold`}>
										{session.ip}
									</span>
								</Table.Cell>
								<Table.Cell>
									<span
										className={`max-w-50 truncate font-mono font-semibold text-xs`}
									>
										{session.user_agent}
									</span>
								</Table.Cell>
								<Table.Cell>
									<span className={`font-mono font-semibold`}>
										{new Date(
											session.last_used_at
										).toLocaleDateString('ru-RU')}
									</span>
								</Table.Cell>
								<Table.Cell>
									<span className={`font-mono font-semibold`}>
										{new Date(
											session.last_used_at
										).toLocaleDateString('ru-RU')}
									</span>
								</Table.Cell>
								<Table.Cell>
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
													'admin.userDetail.sessions.revokeConfirm'
												)}
												onConfirm={() =>
													revokeSessionMutation.mutate(
														String(session.id)
													)
												}
												title={t(
													'admin.userDetail.sessions.revokeTitle'
												)}
											/>
										</Modal.Content>
									</Modal.Root>
								</Table.Cell>
							</Table.Row>
						))}
					</Table.Body>
				</Table.Root>
			</div>
		</Card.Root>
	)
}
