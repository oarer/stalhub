'use client'

import { Icon } from '@iconify/react'
import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { Table } from '@/components/ui/Table'
import { toast } from '@/components/ui/Toast'
import { getQueryClient } from '@/providers/QueryProvider'
import { articleService } from '@/services/article/article.service'
import { ARTICLE_STATUS_META, ArticleStatus } from '@/types/article.type'

const STATUS_OPTIONS = [
	ArticleStatus.PENDING,
	ArticleStatus.REVIEW,
	ArticleStatus.DENIED,
	ArticleStatus.BANNED,
	ArticleStatus.APPROVED,
]

export default function ArticlesAdminView() {
	const t = useTranslations()
	const queryClient = getQueryClient()
	const [page, setPage] = useState(1)
	const [statusFilter, setStatusFilter] = useState<ArticleStatus | ''>('')
	const take = 20

	const { data } = useSuspenseQuery({
		queryKey: ['articles', { take, page }],
		queryFn: () => articleService.list({ take, page }),
		staleTime: 1000 * 30,
	})

	const setStatusMutation = useMutation({
		mutationFn: ({
			id,
			status,
			reason,
		}: {
			id: string
			status: ArticleStatus
			reason?: string
		}) => articleService.setStatus(id, status, reason),
		onSuccess: () => {
			toast.success(t('admin.articles.toast.statusUpdated'))
			queryClient.invalidateQueries({ queryKey: ['articles'] })
		},
		onError: () => toast.error(t('admin.articles.toast.statusUpdateError')),
	})

	const deleteMutation = useMutation({
		mutationFn: (id: string) => articleService.delete(id),
		onSuccess: () => {
			toast.success(t('admin.articles.toast.deleted'))
			queryClient.invalidateQueries({ queryKey: ['articles'] })
		},
		onError: () => toast.error(t('admin.permissions.toast.deleteError')),
	})

	const articles = data?.data ?? []
	const filtered = statusFilter
		? articles.filter((a) => a.status === statusFilter)
		: articles
	const totalPages = data ? Math.ceil(data.total / take) : 1

	return (
		<div className="flex flex-col gap-6">
			<div className="flex items-center justify-between">
				<h1 className="font-semibold text-2xl">
					{t('admin.articles.title')}
				</h1>
				<span className="text-neutral-400 text-sm">
					{data?.total ?? 0} {t('admin.permissions.total')}
				</span>
			</div>

			<div className="flex items-center gap-2">
				<Button
					onClick={() => setStatusFilter('')}
					size="sm"
					variant={statusFilter === '' ? 'primary' : 'outline'}
				>
					{t('admin.articles.all')}
				</Button>
				{STATUS_OPTIONS.map((status) => (
					<Button
						key={status}
						onClick={() => setStatusFilter(status)}
						size="sm"
						variant={
							statusFilter === status ? 'primary' : 'outline'
						}
					>
						{t(`articles.status.${status}`)}
					</Button>
				))}
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
							<Table.Head>
								{t('admin.users.table.status')}
							</Table.Head>
							<Table.Head>{t('admin.articles.stars')}</Table.Head>
							<Table.Head>
								{t('admin.articles.created')}
							</Table.Head>
							<Table.Head />
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{filtered.map((article) => (
							<Table.Row key={article.id}>
								<Table.Cell>
									<span className="font-mono text-neutral-400 text-xs">
										{article.id}
									</span>
								</Table.Cell>
								<Table.Cell>
									<Link
										className="font-semibold text-sky-400 hover:underline"
										href={`/articles/${article.id}`}
										target="_blank"
									>
										{article.title}
									</Link>
								</Table.Cell>
								<Table.Cell>
									<span className="text-sm">
										{article.author.username}
									</span>
								</Table.Cell>
								<Table.Cell>
									<span
										className={`rounded-full px-2 py-0.5 font-semibold text-xs ${ARTICLE_STATUS_META[article.status].color}`}
									>
										{t(`articles.status.${article.status}`)}
									</span>
								</Table.Cell>
								<Table.Cell>
									<span className="text-sm">
										{article.stars}
									</span>
								</Table.Cell>
								<Table.Cell>
									<span className="text-neutral-400 text-xs">
										{new Date(
											article.created_at
										).toLocaleDateString('ru-RU')}
									</span>
								</Table.Cell>
								<Table.Cell>
									<div className="flex items-center gap-1">
										<Modal.Root>
											<Modal.Trigger variant="ghost">
												<Icon icon="lucide:settings" />
											</Modal.Trigger>
											<Modal.Content fullScreen={false}>
												<Modal.Header>
													<Modal.Title>
														{t(
															'admin.articles.statusTitle',
															{
																title: article.title,
															}
														)}
													</Modal.Title>
												</Modal.Header>
												<Modal.Body>
													<div className="flex flex-col gap-2">
														{STATUS_OPTIONS.map(
															(status) => (
																<Button
																	className="justify-start"
																	key={status}
																	onClick={() =>
																		setStatusMutation.mutate(
																			{
																				id: article.id,
																				status,
																			}
																		)
																	}
																	variant={
																		article.status ===
																		status
																			? 'primary'
																			: 'outline'
																	}
																>
																	<span
																		className={`rounded-full px-2 py-0.5 text-xs ${ARTICLE_STATUS_META[status].color}`}
																	>
																		{t(
																			`articles.status.${status}`
																		)}
																	</span>
																</Button>
															)
														)}
													</div>
												</Modal.Body>
												<Modal.Footer>
													<Modal.Close>
														{t('clan.common.close')}
													</Modal.Close>
												</Modal.Footer>
											</Modal.Content>
										</Modal.Root>

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
															'admin.articles.deleteTitle'
														)}
													</Modal.Title>
													<Modal.Description>
														{t.rich(
															'admin.articles.deleteDescription',
															{
																title: article.title,
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
																article.id
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
						{filtered.length === 0 && (
							<Table.Row>
								<Table.Cell>
									<span className="text-neutral-400 text-sm">
										{t('admin.articles.empty')}
									</span>
								</Table.Cell>
								<Table.Cell />
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
