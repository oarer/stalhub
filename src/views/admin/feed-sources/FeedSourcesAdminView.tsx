'use client'

import { Icon } from '@iconify/react'
import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useLocale, useTranslations } from 'next-intl'
import { useState } from 'react'
import { mtsExtended } from '@/app/fonts'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Switch } from '@/components/ui/Switch'
import { Table } from '@/components/ui/Table'
import { toast } from '@/components/ui/Toast'
import { formatDate } from '@/lib/date'
import { getQueryClient } from '@/providers/QueryProvider'
import { adminFeedSourcesQueries } from '@/queries/admin/feed-sources.queries'
import { adminFeedSourcesService } from '@/services/admin/feed-sources.service'
import type { AdminFeedSource, AdminFeedSourceType } from '@/types/admin.type'

const QUERY_KEY = ['admin', 'feed-sources']

function getErrorMessage(error: unknown, fallback: string) {
	if (axios.isAxiosError(error)) {
		const message = (
			error.response?.data as { error?: unknown } | undefined
		)?.error
		if (typeof message === 'string' && message.trim()) return message
	}
	return fallback
}

export default function FeedSourcesAdminView() {
	const t = useTranslations()
	const locale = useLocale()
	const queryClient = getQueryClient()
	const { data } = useSuspenseQuery(adminFeedSourcesQueries.list())
	const [type, setType] = useState<AdminFeedSourceType>('TG')
	const [externalId, setExternalId] = useState('')
	const [label, setLabel] = useState('')
	const [deleteSource, setDeleteSource] = useState<AdminFeedSource | null>(
		null
	)

	const invalidate = () =>
		queryClient.invalidateQueries({ queryKey: QUERY_KEY })

	const createMutation = useMutation({
		mutationFn: () =>
			adminFeedSourcesService.create({
				type,
				external_id: externalId.trim(),
				label: label.trim() || undefined,
			}),
		onSuccess: () => {
			toast.success(t('admin.feedSources.toast.created'))
			invalidate()
			setExternalId('')
			setLabel('')
		},
		onError: (error) =>
			toast.error(
				getErrorMessage(error, t('admin.feedSources.toast.error'))
			),
	})

	const toggleMutation = useMutation({
		mutationFn: ({ id, enabled }: { id: number; enabled: boolean }) =>
			adminFeedSourcesService.update(id, { enabled }),
		onMutate: async ({ id, enabled }) => {
			await queryClient.cancelQueries({ queryKey: QUERY_KEY })
			const previous = queryClient.getQueryData<{
				sources: AdminFeedSource[]
			}>(QUERY_KEY)
			queryClient.setQueryData<{ sources: AdminFeedSource[] }>(
				QUERY_KEY,
				(current) =>
					current
						? {
								...current,
								sources: current.sources.map((source) =>
									source.id === id
										? { ...source, enabled }
										: source
								),
							}
						: current
			)
			return { previous }
		},
		onError: (error, _variables, context) => {
			if (context?.previous) {
				queryClient.setQueryData(QUERY_KEY, context.previous)
			}
			toast.error(
				getErrorMessage(error, t('admin.feedSources.toast.error'))
			)
		},
		onSettled: invalidate,
	})

	const deleteMutation = useMutation({
		mutationFn: (id: number) => adminFeedSourcesService.delete(id),
		onSuccess: () => {
			toast.success(t('admin.feedSources.toast.deleted'))
			setDeleteSource(null)
			invalidate()
		},
		onError: (error) =>
			toast.error(
				getErrorMessage(error, t('admin.feedSources.toast.error'))
			),
	})

	const syncMutation = useMutation({
		mutationFn: (id: number) => adminFeedSourcesService.sync(id),
		onSuccess: (result) => {
			toast.success(
				t('admin.feedSources.toast.synced', { count: result.synced })
			)
			invalidate()
		},
		onError: (error) =>
			toast.error(
				getErrorMessage(error, t('admin.feedSources.toast.syncError'))
			),
	})

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<h1
					className={`${mtsExtended.className} text-[28px] leading-none font-semibold`}
				>
					{t('admin.feedSources.title')}
				</h1>
				<span className="flex items-center gap-1.5 text-sm text-neutral-400">
					<Icon icon="lucide:rss" />
					{t('admin.feedSources.count', {
						count: data.sources.length,
					})}
				</span>
			</div>

			<Card.Root>
				<Card.Header>
					<Card.Title>
						<Icon icon="lucide:plus" />
						{t('admin.feedSources.form.title')}
					</Card.Title>
					<Card.Description>
						{t('admin.feedSources.form.description')}
					</Card.Description>
				</Card.Header>
				<Card.Content>
					<div className="flex flex-col gap-3">
						<div className="grid gap-3 md:grid-cols-[10rem_minmax(0,1fr)_minmax(0,1fr)_auto] md:items-end">
							<label className="text-muted-foreground flex flex-col gap-1.5 text-sm font-medium">
								<span>{t('admin.feedSources.form.type')}</span>
								<select
									className="border-muted bg-card text-foreground focus:border-primary/60 h-9 rounded-lg border-2 px-2.5 font-medium transition-colors outline-none"
									onChange={(event) =>
										setType(
											event.target
												.value as AdminFeedSourceType
										)
									}
									value={type}
								>
									<option value="TG">
										{t('admin.feedSources.types.TG')}
									</option>
									<option value="YOUTUBE">
										{t('admin.feedSources.types.YOUTUBE')}
									</option>
								</select>
							</label>
							<div>
								<Input
									label="admin.feedSources.form.externalId"
									onChange={(event) =>
										setExternalId(event.target.value)
									}
									value={externalId}
								/>
								<p className="text-muted-foreground mt-1 text-xs">
									{t(
										type === 'TG'
											? 'admin.feedSources.form.externalIdHintTG'
											: 'admin.feedSources.form.externalIdHintYOUTUBE'
									)}
								</p>
							</div>
							<Input
								label="admin.feedSources.form.label"
								onChange={(event) =>
									setLabel(event.target.value)
								}
								value={label}
							/>
							<Button
								disabled={!externalId.trim()}
								loading={createMutation.isPending}
								onClick={() => createMutation.mutate()}
							>
								{t('admin.feedSources.form.add')}
							</Button>
						</div>
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root className="overflow-hidden p-0">
				<div className="overflow-x-auto">
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head>
									{t('admin.feedSources.table.type')}
								</Table.Head>
								<Table.Head>
									{t('admin.feedSources.table.externalId')}
								</Table.Head>
								<Table.Head>
									{t('admin.feedSources.table.label')}
								</Table.Head>
								<Table.Head>
									{t('admin.feedSources.table.enabled')}
								</Table.Head>
								<Table.Head>
									{t('admin.feedSources.table.lastSynced')}
								</Table.Head>
								<Table.Head>
									{t('admin.feedSources.table.createdAt')}
								</Table.Head>
								<Table.Head />
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{data.sources.map((source) => (
								<Table.Row key={source.id}>
									<Table.Cell>
										<Badge
											variant={
												source.type === 'YOUTUBE'
													? 'danger'
													: 'primary'
											}
										>
											{source.type}
										</Badge>
									</Table.Cell>
									<Table.Cell>
										<span className="font-mono text-xs">
											{source.external_id}
										</span>
									</Table.Cell>
									<Table.Cell>
										<span className="text-sm">
											{source.label || '—'}
										</span>
									</Table.Cell>
									<Table.Cell>
										<div className="flex items-center gap-2">
											<Switch
												aria-label={t(
													'admin.feedSources.table.toggle',
													{
														label:
															source.label ||
															source.external_id,
													}
												)}
												checked={source.enabled}
												onCheckedChange={(enabled) =>
													toggleMutation.mutate({
														id: source.id,
														enabled,
													})
												}
												size="sm"
											/>
											<Badge
												variant={
													source.enabled
														? 'primary'
														: 'secondary'
												}
											>
												{source.enabled
													? t(
															'admin.feedSources.table.on'
														)
													: t(
															'admin.feedSources.table.off'
														)}
											</Badge>
										</div>
									</Table.Cell>
									<Table.Cell>
										<span className="text-muted-foreground text-xs">
											{formatDate(
												source.last_synced_at,
												'datetime',
												locale,
												t(
													'admin.feedSources.table.never'
												)
											)}
										</span>
									</Table.Cell>
									<Table.Cell>
										<span className="text-muted-foreground text-xs">
											{formatDate(
												source.created_at,
												'datetime',
												locale
											)}
										</span>
									</Table.Cell>
									<Table.Cell>
										<div className="flex items-center justify-end gap-1">
											{source.enabled && (
												<Button
													aria-label={t(
														'admin.feedSources.table.sync'
													)}
													loading={
														syncMutation.isPending &&
														syncMutation.variables ===
															source.id
													}
													onClick={() =>
														syncMutation.mutate(
															source.id
														)
													}
													size="sm"
													variant="outline"
												>
													<Icon icon="lucide:refresh-cw" />
												</Button>
											)}
											<Button
												aria-label={t(
													'admin.feedSources.table.delete'
												)}
												onClick={() =>
													setDeleteSource(source)
												}
												size="sm"
												variant="ghost"
											>
												<Icon
													className="text-red-400"
													icon="lucide:trash-2"
												/>
											</Button>
										</div>
									</Table.Cell>
								</Table.Row>
							))}
							{data.sources.length === 0 && (
								<Table.Row>
									<Table.Cell colSpan={7}>
										<span className="text-muted-foreground text-sm">
											{t('admin.feedSources.empty')}
										</span>
									</Table.Cell>
								</Table.Row>
							)}
						</Table.Body>
					</Table.Root>
				</div>
			</Card.Root>

			<Modal.Root
				onOpenChange={(open) => {
					if (!open) setDeleteSource(null)
				}}
				open={!!deleteSource}
			>
				<Modal.Content fullScreen={false}>
					<Modal.Header>
						<Modal.Title>
							{t('admin.feedSources.delete.title')}
						</Modal.Title>
						<Modal.Description>
							{deleteSource?.label || deleteSource?.external_id}
						</Modal.Description>
					</Modal.Header>
					<Modal.Footer>
						<Modal.Close>{t('admin.cancel')}</Modal.Close>
						<Modal.Action
							closeOnClick
							onClick={() =>
								deleteSource &&
								deleteMutation.mutate(deleteSource.id)
							}
							variant="danger"
						>
							{t('admin.feedSources.delete.confirm')}
						</Modal.Action>
					</Modal.Footer>
				</Modal.Content>
			</Modal.Root>
		</div>
	)
}
