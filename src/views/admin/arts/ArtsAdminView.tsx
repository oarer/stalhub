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
import { cn } from '@/lib/cn'
import { getQueryClient } from '@/providers/QueryProvider'
import { adminArtQueries } from '@/queries/admin/art.queries'
import { adminArtService } from '@/services/admin/art.service'
import type { Art } from '@/types/art.type'
import { ArtType } from '@/types/art.type'
import { AdminArtForm } from './AdminArtForm'

export default function ArtsAdminView() {
	const t = useTranslations()
	const queryClient = getQueryClient()
	const [page, setPage] = useState(1)
	const [typeFilter, setTypeFilter] = useState<ArtType | ''>('')
	const [isCreateOpen, setIsCreateOpen] = useState(false)
	const [editArt, setEditArt] = useState<Art | null>(null)
	const take = 20

	const { data } = useSuspenseQuery(
		adminArtQueries.list({ take, page, type: typeFilter || undefined })
	)

	const deleteMutation = useMutation({
		mutationFn: (id: string) => adminArtService.delete(id),
		onSuccess: () => {
			toast.success(t('admin.arts.toast.deleted'))
			queryClient.invalidateQueries({ queryKey: ['admin', 'arts'] })
		},
		onError: () => toast.error(t('admin.arts.toast.deleteError')),
	})

	const arts = data?.data ?? []
	const totalPages = data ? Math.ceil(data.total_count / take) : 1

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<h1 className="font-semibold text-2xl">
					{t('admin.arts.title')}
				</h1>
				<div className="flex items-center gap-2">
					<span className="text-neutral-400 text-sm">
						{data?.total_count ?? 0} {t('admin.permissions.total')}
					</span>
					<Button onClick={() => setIsCreateOpen(true)}>
						<Icon icon="lucide:plus" />
						<span>{t('admin.arts.create')}</span>
					</Button>
				</div>
			</div>

			<div className="flex flex-wrap items-center gap-2">
				<Button
					onClick={() => setTypeFilter('')}
					size="sm"
					variant={typeFilter === '' ? 'primary' : 'outline'}
				>
					{t('admin.arts.all')}
				</Button>
				<Button
					onClick={() =>
						setTypeFilter(
							typeFilter === ArtType.NSFW ? '' : ArtType.NSFW
						)
					}
					size="sm"
					variant={
						typeFilter === ArtType.NSFW ? 'primary' : 'outline'
					}
				>
					NSFW
				</Button>
			</div>

			<Card.Root className="overflow-hidden p-0">
				<div className="overflow-x-auto">
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
							<Table.Head>{t('admin.arts.type')}</Table.Head>
							<Table.Head>{t('admin.arts.stars')}</Table.Head>
							<Table.Head>{t('admin.arts.comments')}</Table.Head>
							<Table.Head>
								{t('admin.articles.created')}
							</Table.Head>
							<Table.Head />
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{arts.map((art) => (
							<Table.Row key={art.id}>
								<Table.Cell>
									<span className="font-mono text-neutral-400 text-xs">
										{art.id}
									</span>
								</Table.Cell>
								<Table.Cell>
									<Link
										className="font-semibold text-sky-400 hover:underline"
										href={`/arts/${art.id}`}
										target="_blank"
									>
										{art.title}
									</Link>
								</Table.Cell>
								<Table.Cell>
									<span className="text-sm">
										{art.author.id === null
											? art.author.name
											: art.author.username}
									</span>
								</Table.Cell>
								<Table.Cell>
									<span
										className={cn(
											'rounded-full px-2 py-0.5 font-semibold text-xs',
											art.type === ArtType.NSFW
												? 'bg-red-500/20 text-red-400'
												: 'bg-border/20 text-primary'
										)}
									>
										{art.type}
									</span>
								</Table.Cell>
								<Table.Cell>
									<span className="text-sm">
										{art.stars_count}
									</span>
								</Table.Cell>
								<Table.Cell>
									<span className="text-sm">
										{art.comments_count ?? 0}
									</span>
								</Table.Cell>
								<Table.Cell>
									<span className="text-neutral-400 text-xs">
										{new Date(
											art.created_at
										).toLocaleDateString('ru-RU')}
									</span>
								</Table.Cell>
								<Table.Cell>
									<div className="flex items-center gap-1">
										<Button
											onClick={() => setEditArt(art)}
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
															'admin.arts.deleteTitle'
														)}
													</Modal.Title>
													<Modal.Description>
														{t.rich(
															'admin.arts.deleteDescription',
															{
																title: art.title,
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
																art.id
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
						{arts.length === 0 && (
							<Table.Row>
								<Table.Cell>
									<span className="text-neutral-400 text-sm">
										{t('admin.arts.empty')}
									</span>
								</Table.Cell>
								<Table.Cell />
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
				</div>
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

			<AdminArtForm
				onOpenChange={setIsCreateOpen}
				onSaved={() => {
					queryClient.invalidateQueries({
						queryKey: ['admin', 'arts'],
					})
					queryClient.invalidateQueries({
						queryKey: ['arts', 'public'],
					})
				}}
				open={isCreateOpen}
			/>

			<AdminArtForm
				art={editArt ?? undefined}
				onOpenChange={(open) => {
					if (!open) setEditArt(null)
				}}
				onSaved={() => {
					queryClient.invalidateQueries({
						queryKey: ['admin', 'arts'],
					})
					queryClient.invalidateQueries({
						queryKey: ['arts', 'public'],
					})
					setEditArt(null)
				}}
				open={!!editArt}
			/>
		</div>
	)
}
