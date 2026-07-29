'use client'

import { Icon } from '@iconify/react'
import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Table } from '@/components/ui/Table'
import { toast } from '@/components/ui/Toast'
import { getQueryClient } from '@/providers/QueryProvider'
import { adminUserQueries } from '@/queries/admin/user.queries'
import { adminUserService } from '@/services/admin/user.service'

export default function UsersAdminView() {
	const t = useTranslations()
	const queryClient = getQueryClient()
	const [search, setSearch] = useState('')
	const [page, setPage] = useState(1)
	const take = 20

	const { data } = useSuspenseQuery(
		adminUserQueries.list({ take, page, search: search || undefined })
	)

	const deleteMutation = useMutation({
		mutationFn: (userId: number) => adminUserService.delete(userId),
		onSuccess: () => {
			toast.success(t('admin.users.toast.deleted'))
			queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
		},
		onError: () => {
			toast.error(t('admin.users.toast.deleteError'))
		},
	})

	const totalPages = data ? Math.ceil(data.total / take) : 1

	return (
		<div className="flex flex-col gap-6">
			<div className="flex items-center justify-between">
				<h1 className="font-semibold text-2xl">
					{t('admin.users.title')}
				</h1>
				<span className="text-neutral-400 text-sm">
					{data?.total ?? 0} {t('admin.users.total')}
				</span>
			</div>

			<div className="flex items-center gap-3">
				<div className="w-80">
					<Input
						label={t('admin.users.search')}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
							setSearch(e.target.value)
							setPage(1)
						}}
						value={search}
					/>
				</div>
			</div>

			<Card.Root className="overflow-hidden p-0">
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>ID</Table.Head>
							<Table.Head>
								{t('admin.users.table.username')}
							</Table.Head>
							<Table.Head>
								{t('admin.users.table.name')}
							</Table.Head>
							<Table.Head>
								{t('admin.users.table.roles')}
							</Table.Head>
							<Table.Head>
								{t('admin.users.table.status')}
							</Table.Head>
							<Table.Head />
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{data?.data.map((user) => (
							<Table.Row key={user.id}>
								<Table.Cell>
									<span className="font-mono text-neutral-400 text-xs">
										{user.id}
									</span>
								</Table.Cell>
								<Table.Cell>
									<Link
										className="font-semibold text-sky-400 hover:underline"
										href={`/admin/users/${user.id}`}
									>
										{user.username}
									</Link>
								</Table.Cell>
								<Table.Cell>{user.name ?? '—'}</Table.Cell>
								<Table.Cell>
									<div className="flex flex-wrap gap-1">
										{user.roles.map((role) => (
											<span
												className="rounded-full bg-sky-400/10 px-2 py-0.5 font-semibold text-sky-400 text-xs"
												key={role.id}
											>
												{role.name}
											</span>
										))}
									</div>
								</Table.Cell>
								<Table.Cell>
									{user.banned ? (
										<span className="rounded-full bg-red-500/10 px-2 py-0.5 font-semibold text-red-400 text-xs">
											{t('admin.users.status.banned')}
										</span>
									) : (
										<span className="rounded-full bg-green-500/10 px-2 py-0.5 font-semibold text-green-400 text-xs">
											{t('admin.users.status.active')}
										</span>
									)}
								</Table.Cell>
								<Table.Cell>
									<div className="flex items-center gap-1">
										<Link href={`/admin/users/${user.id}`}>
											<Button size="sm" variant="ghost">
												<Icon icon="lucide:eye" />
											</Button>
										</Link>
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
															'admin.users.deleteTitle'
														)}
													</Modal.Title>
													<Modal.Description>
														{t(
															'admin.users.deleteDescription',
															{
																name: user.username,
															}
														)}
													</Modal.Description>
												</Modal.Header>
												<Modal.Footer>
													<Modal.Close>
														{t(
															'admin.users.cancel'
														)}
													</Modal.Close>
													<Modal.Action
														closeOnClick
														onClick={() =>
															deleteMutation.mutate(
																user.id
															)
														}
														variant="danger"
													>
														{t(
															'admin.users.deleteConfirm'
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

			{totalPages > 1 && (
				<div className="flex items-center justify-center gap-2">
					<Button
						disabled={page <= 1}
						onClick={() => setPage((p) => p - 1)}
						size="sm"
						variant="outline"
					>
						<Icon icon="lucide:chevron-left" />
					</Button>
					<span className="text-neutral-400 text-sm">
						{page} / {totalPages}
					</span>
					<Button
						disabled={page >= totalPages}
						onClick={() => setPage((p) => p + 1)}
						size="sm"
						variant="outline"
					>
						<Icon icon="lucide:chevron-right" />
					</Button>
				</div>
			)}
		</div>
	)
}
