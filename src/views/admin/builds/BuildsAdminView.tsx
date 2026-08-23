'use client'

import { Icon } from '@iconify/react'
import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { Table } from '@/components/ui/Table'
import { toast } from '@/components/ui/Toast'
import { getQueryClient } from '@/providers/QueryProvider'
import { buildApiService } from '@/services/build-api/build-api.service'

export default function BuildsAdminView() {
	const t = useTranslations()
	const queryClient = getQueryClient()
	const [page, setPage] = useState(1)
	const take = 20

	const { data } = useSuspenseQuery({
		queryKey: ['builds', { take, page }],
		queryFn: () => buildApiService.list({ take, page }),
		staleTime: 1000 * 30,
	})

	const deleteMutation = useMutation({
		mutationFn: (id: string) => buildApiService.delete(id),
		onSuccess: () => {
			toast.success(t('admin.builds.toast.deleted'))
			queryClient.invalidateQueries({ queryKey: ['builds'] })
		},
		onError: () => toast.error(t('admin.permissions.toast.deleteError')),
	})

	const builds = data?.data ?? []
	const totalPages = data ? Math.ceil(data.total_count / take) : 1

	return (
		<div className="flex flex-col gap-6">
			<div className="flex items-center justify-between">
				<h1 className="font-semibold text-2xl">
					{t('admin.builds.title')}
				</h1>
				<span className="text-neutral-400 text-sm">
					{data?.total_count ?? 0} {t('admin.permissions.total')}
				</span>
			</div>

			<Card.Root className="overflow-hidden p-0">
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>ID</Table.Head>
							<Table.Head>
								{t('admin.permissions.name')}
							</Table.Head>
							<Table.Head>
								{t('admin.articles.author')}
							</Table.Head>
							<Table.Head>{t('admin.articles.stars')}</Table.Head>
							<Table.Head>
								{t('admin.articles.created')}
							</Table.Head>
							<Table.Head />
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{builds.map((build) => (
							<Table.Row key={build.id}>
								<Table.Cell>
									<span className="font-mono text-neutral-400 text-xs">
										{build.id}
									</span>
								</Table.Cell>
								<Table.Cell>
									<span className="font-semibold">
										{build.title}
									</span>
								</Table.Cell>
								<Table.Cell>
									<span className="text-sm">
										{build.author.username}
									</span>
								</Table.Cell>
								<Table.Cell>
									<span className="text-sm">
										{build.stars_count}
									</span>
								</Table.Cell>
								<Table.Cell>
									<span className="text-neutral-400 text-xs">
										{new Date(
											build.created_at
										).toLocaleDateString('ru-RU')}
									</span>
								</Table.Cell>
								<Table.Cell>
									<div className="flex items-center gap-1">
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
															'admin.builds.deleteTitle'
														)}
													</Modal.Title>
													<Modal.Description>
														{t.rich(
															'admin.builds.deleteDescription',
															{
																title: build.title,
																strong: (
																	chunks
																) => (
																	<strong>
																		{chunks}
																	</strong>
																),
															}
														)}
													</Modal.Description>
												</Modal.Header>
												<Modal.Footer>
													<Modal.Close>
														{t(
															'clan.common.cancel'
														)}
													</Modal.Close>
													<Modal.Action
														closeOnClick
														onClick={() =>
															deleteMutation.mutate(
																build.id
															)
														}
														variant="danger"
													>
														{t(
															'clan.common.delete'
														)}
													</Modal.Action>
												</Modal.Footer>
											</Modal.Content>
										</Modal.Root>
									</div>
								</Table.Cell>
							</Table.Row>
						))}
						{builds.length === 0 && (
							<Table.Row>
								<Table.Cell>
									<span className="text-neutral-400 text-sm">
										{t('admin.builds.empty')}
									</span>
								</Table.Cell>
								<Table.Cell />
								<Table.Cell />
								<Table.Cell />
								<Table.Cell />
								<Table.Cell />
							</Table.Row>
						)}
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
