'use client'

import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Pagination } from '@/components/ui/Pagination'
import { Table } from '@/components/ui/Table'
import { toast } from '@/components/ui/Toast'
import { getQueryClient } from '@/providers/QueryProvider'
import { buildApiService } from '@/services/build-api/build-api.service'
import {
	AdminDeleteModal,
	AdminEmptyRow,
	AdminTableHeader,
} from '../components/AdminTable'

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
			<div className="flex flex-wrap items-center justify-between gap-2">
				<h1 className="font-semibold text-2xl">
					{t('admin.builds.title')}
				</h1>
				<span className="text-neutral-400 text-sm">
					{data?.total_count ?? 0} {t('admin.permissions.total')}
				</span>
			</div>

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
									key: 'author',
									label: t('admin.articles.author'),
								},
								{
									key: 'stars',
									label: t('admin.articles.stars'),
								},
								{
									key: 'created',
									label: t('admin.articles.created'),
								},
							]}
						/>
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
											<AdminDeleteModal
												cancelLabel={t(
													'clan.common.cancel'
												)}
												confirmLabel={t(
													'clan.common.delete'
												)}
												description={t.rich(
													'admin.builds.deleteDescription',
													{
														title: build.title,
														strong: (chunks) => (
															<strong>
																{chunks}
															</strong>
														),
													}
												)}
												onConfirm={() =>
													deleteMutation.mutate(
														build.id
													)
												}
												title={t(
													'admin.builds.deleteTitle'
												)}
											/>
										</div>
									</Table.Cell>
								</Table.Row>
							))}
							{builds.length === 0 && (
								<AdminEmptyRow
									colCount={6}
									message={t('admin.builds.empty')}
								/>
							)}
						</Table.Body>
					</Table.Root>
				</div>
			</Card.Root>

			<Pagination
				onPageChange={setPage}
				page={page}
				totalPages={totalPages}
			/>
		</div>
	)
}
