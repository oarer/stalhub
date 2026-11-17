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
import { Combobox } from '@/components/ui/Combobox'
import Input from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Switch } from '@/components/ui/Switch'
import { Table } from '@/components/ui/Table'
import { toast } from '@/components/ui/Toast'
import { formatDate } from '@/lib/date'
import { getQueryClient } from '@/providers/QueryProvider'
import { adminFeedCategoriesQueries } from '@/queries/admin/feed-categories.queries'
import { adminFeedSourcesQueries } from '@/queries/admin/feed-sources.queries'
import { adminFeedCategoriesService } from '@/services/admin/feed-categories.service'
import type { AdminFeedCategory } from '@/types/admin.type'

function getErrorMessage(error: unknown, fallback: string) {
	if (axios.isAxiosError(error)) {
		const message = (
			error.response?.data as { error?: unknown } | undefined
		)?.error
		if (typeof message === 'string' && message.trim()) return message
	}
	return fallback
}

export default function FeedCategoriesAdminView() {
	const t = useTranslations()
	const locale = useLocale()
	const queryClient = getQueryClient()
	const { data } = useSuspenseQuery(adminFeedCategoriesQueries.list())
	const { data: sourcesData } = useSuspenseQuery(
		adminFeedSourcesQueries.list()
	)
	const [name, setName] = useState('')
	const [position, setPosition] = useState('0')
	const [enabled, setEnabled] = useState(true)
	const [sourceIds, setSourceIds] = useState<number[]>([])
	const [editCategory, setEditCategory] = useState<AdminFeedCategory | null>(
		null
	)
	const [editName, setEditName] = useState('')
	const [editPosition, setEditPosition] = useState('0')
	const [editEnabled, setEditEnabled] = useState(true)
	const [editSourceIds, setEditSourceIds] = useState<number[]>([])
	const [deleteCategory, setDeleteCategory] =
		useState<AdminFeedCategory | null>(null)

	const invalidate = () => {
		queryClient.invalidateQueries({
			queryKey: ['admin', 'feed-categories'],
		})
		queryClient.invalidateQueries({ queryKey: ['admin', 'feed-sources'] })
		queryClient.invalidateQueries({ queryKey: ['feed'] })
	}

	const sourceLabel = (id: number) => {
		const source = sourcesData.sources.find((item) => item.id === id)
		return source?.label || source?.external_id || `#${id}`
	}

	const resetCreate = () => {
		setName('')
		setPosition('0')
		setEnabled(true)
		setSourceIds([])
	}

	const openEdit = (category: AdminFeedCategory) => {
		setEditCategory(category)
		setEditName(category.name)
		setEditPosition(String(category.position))
		setEditEnabled(category.enabled)
		setEditSourceIds(category.source_ids)
	}

	const createMutation = useMutation({
		mutationFn: () =>
			adminFeedCategoriesService.create({
				name: name.trim(),
				position: Number(position) || 0,
				enabled,
				source_ids: sourceIds,
			}),
		onSuccess: () => {
			toast.success(t('admin.feedCategories.toast.created'))
			resetCreate()
			invalidate()
		},
		onError: (error) =>
			toast.error(
				getErrorMessage(error, t('admin.feedCategories.toast.error'))
			),
	})

	const updateMutation = useMutation({
		mutationFn: ({
			id,
			input,
		}: {
			id: number
			input: {
				name?: string
				position?: number
				enabled?: boolean
				source_ids?: number[]
			}
		}) => adminFeedCategoriesService.update(id, input),
		onSuccess: () => {
			toast.success(t('admin.feedCategories.toast.updated'))
			setEditCategory(null)
			invalidate()
		},
		onError: (error) =>
			toast.error(
				getErrorMessage(error, t('admin.feedCategories.toast.error'))
			),
	})

	const deleteMutation = useMutation({
		mutationFn: (id: number) => adminFeedCategoriesService.delete(id),
		onSuccess: () => {
			toast.success(t('admin.feedCategories.toast.deleted'))
			setDeleteCategory(null)
			invalidate()
		},
		onError: (error) =>
			toast.error(
				getErrorMessage(error, t('admin.feedCategories.toast.error'))
			),
	})

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<h1
					className={`${mtsExtended.className} font-semibold text-[28px] leading-none`}
				>
					{t('admin.feedCategories.title')}
				</h1>
				<span className="flex items-center gap-1.5 text-neutral-400 text-sm">
					<Icon icon="lucide:tags" />
					{t('admin.feedCategories.count', {
						count: data.categories.length,
					})}
				</span>
			</div>

			<Card.Root>
				<Card.Header>
					<Card.Title>
						<Icon icon="lucide:plus" />
						{t('admin.feedCategories.form.title')}
					</Card.Title>
					<Card.Description>
						{t('admin.feedCategories.form.description')}
					</Card.Description>
				</Card.Header>
				<Card.Content>
					<div className="flex flex-col gap-4">
						<div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_8rem_auto] md:items-end">
							<Input
								label="admin.feedCategories.form.name"
								onChange={(event) =>
									setName(event.target.value)
								}
								value={name}
							/>
							<Input
								label="admin.feedCategories.form.position"
								min={0}
								onChange={(event) =>
									setPosition(event.target.value)
								}
								type="number"
								value={position}
							/>
							<div className="flex h-9 items-center gap-2 font-medium text-sm">
								<Switch
									aria-label={t(
										'admin.feedCategories.form.enabled'
									)}
									checked={enabled}
									onCheckedChange={setEnabled}
									size="sm"
								/>
								<span>
									{t('admin.feedCategories.form.enabled')}
								</span>
							</div>
						</div>
						<div className="flex flex-col gap-2">
							<span className="font-medium text-muted-foreground text-sm">
								{t('admin.feedCategories.form.sources')}
							</span>
							<Combobox
								disabled={sourcesData.sources.length === 0}
								emptyText="admin.feedCategories.form.sourcesEmpty"
								maxTagCount={2}
								multiple
								onValuesChange={(values) =>
									setSourceIds(values.map(Number))
								}
								options={sourcesData.sources.map((source) => ({
									value: String(source.id),
									label: source.label || source.external_id,
								}))}
								placeholder="admin.feedCategories.form.sourcesPlaceholder"
								searchPlaceholder="admin.feedCategories.form.sourcesSearch"
								translateOptions={false}
								values={sourceIds.map(String)}
							/>
						</div>
						<div>
							<Button
								disabled={!name.trim()}
								loading={createMutation.isPending}
								onClick={() => createMutation.mutate()}
							>
								{t('admin.feedCategories.form.add')}
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
									{t('admin.feedCategories.table.name')}
								</Table.Head>
								<Table.Head>
									{t('admin.feedCategories.table.position')}
								</Table.Head>
								<Table.Head>
									{t('admin.feedCategories.table.sources')}
								</Table.Head>
								<Table.Head>
									{t('admin.feedCategories.table.enabled')}
								</Table.Head>
								<Table.Head>
									{t('admin.feedCategories.table.createdAt')}
								</Table.Head>
								<Table.Head />
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{data.categories.map((category) => (
								<Table.Row key={category.id}>
									<Table.Cell>
										<span className="font-medium text-sm">
											{category.name}
										</span>
									</Table.Cell>
									<Table.Cell>
										<span className="font-mono text-xs">
											{category.position}
										</span>
									</Table.Cell>
									<Table.Cell>
										<div className="flex flex-wrap gap-1">
											{category.source_ids.length > 0 ? (
												category.source_ids.map(
													(id) => (
														<Badge
															key={id}
															variant="secondary"
														>
															{sourceLabel(id)}
														</Badge>
													)
												)
											) : (
												<span className="text-muted-foreground text-xs">
													—
												</span>
											)}
										</div>
									</Table.Cell>
									<Table.Cell>
										<div className="flex items-center gap-2">
											<Switch
												aria-label={t(
													'admin.feedCategories.table.toggle',
													{ name: category.name }
												)}
												checked={category.enabled}
												onCheckedChange={(value) =>
													updateMutation.mutate({
														id: category.id,
														input: {
															enabled: value,
														},
													})
												}
												size="sm"
											/>
											<Badge
												variant={
													category.enabled
														? 'primary'
														: 'secondary'
												}
											>
												{category.enabled
													? t(
															'admin.feedCategories.table.on'
														)
													: t(
															'admin.feedCategories.table.off'
														)}
											</Badge>
										</div>
									</Table.Cell>
									<Table.Cell>
										<span className="text-muted-foreground text-xs">
											{formatDate(
												category.created_at,
												'datetime',
												locale
											)}
										</span>
									</Table.Cell>
									<Table.Cell>
										<div className="flex items-center justify-end gap-1">
											<Button
												aria-label={t(
													'admin.feedCategories.table.edit'
												)}
												onClick={() =>
													openEdit(category)
												}
												size="sm"
												variant="outline"
											>
												<Icon icon="lucide:pencil" />
											</Button>
											<Button
												aria-label={t(
													'admin.feedCategories.table.delete'
												)}
												onClick={() =>
													setDeleteCategory(category)
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
							{data.categories.length === 0 && (
								<Table.Row>
									<Table.Cell colSpan={6}>
										<span className="text-muted-foreground text-sm">
											{t('admin.feedCategories.empty')}
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
					if (!open) setEditCategory(null)
				}}
				open={!!editCategory}
			>
				<Modal.Content fullScreen={false}>
					<Modal.Header>
						<Modal.Title>
							{t('admin.feedCategories.edit.title')}
						</Modal.Title>
						<Modal.Description>
							{editCategory?.name}
						</Modal.Description>
					</Modal.Header>
					<div className="flex flex-col gap-4 px-5 py-4">
						<Input
							label="admin.feedCategories.form.name"
							onChange={(event) =>
								setEditName(event.target.value)
							}
							value={editName}
						/>
						<Input
							label="admin.feedCategories.form.position"
							min={0}
							onChange={(event) =>
								setEditPosition(event.target.value)
							}
							type="number"
							value={editPosition}
						/>
						<div className="flex items-center gap-2 font-medium text-sm">
							<Switch
								aria-label={t(
									'admin.feedCategories.form.enabled'
								)}
								checked={editEnabled}
								onCheckedChange={setEditEnabled}
								size="sm"
							/>
							<span>
								{t('admin.feedCategories.form.enabled')}
							</span>
						</div>
						<div className="flex flex-col gap-2">
							<span className="font-medium text-muted-foreground text-sm">
								{t('admin.feedCategories.form.sources')}
							</span>
							<Combobox
								disabled={sourcesData.sources.length === 0}
								emptyText="admin.feedCategories.form.sourcesEmpty"
								maxTagCount={2}
								multiple
								onValuesChange={(values) =>
									setEditSourceIds(values.map(Number))
								}
								options={sourcesData.sources.map((source) => ({
									value: String(source.id),
									label: source.label || source.external_id,
								}))}
								placeholder="admin.feedCategories.form.sourcesPlaceholder"
								searchPlaceholder="admin.feedCategories.form.sourcesSearch"
								translateOptions={false}
								values={editSourceIds.map(String)}
							/>
						</div>
					</div>
					<Modal.Footer>
						<Modal.Close>{t('clan.common.cancel')}</Modal.Close>
						<Button
							disabled={!editName.trim()}
							loading={updateMutation.isPending}
							onClick={() => {
								if (!editCategory) return
								updateMutation.mutate({
									id: editCategory.id,
									input: {
										name: editName.trim(),
										position: Number(editPosition) || 0,
										enabled: editEnabled,
										source_ids: editSourceIds,
									},
								})
							}}
						>
							{t('admin.feedCategories.edit.save')}
						</Button>
					</Modal.Footer>
				</Modal.Content>
			</Modal.Root>

			<Modal.Root
				onOpenChange={(open) => {
					if (!open) setDeleteCategory(null)
				}}
				open={!!deleteCategory}
			>
				<Modal.Content fullScreen={false}>
					<Modal.Header>
						<Modal.Title>
							{t('admin.feedCategories.delete.title')}
						</Modal.Title>
						<Modal.Description>
							{deleteCategory?.name}
						</Modal.Description>
					</Modal.Header>
					<Modal.Footer>
						<Modal.Close>{t('clan.common.cancel')}</Modal.Close>
						<Modal.Action
							closeOnClick
							onClick={() =>
								deleteCategory &&
								deleteMutation.mutate(deleteCategory.id)
							}
							variant="danger"
						>
							{t('admin.feedCategories.delete.confirm')}
						</Modal.Action>
					</Modal.Footer>
				</Modal.Content>
			</Modal.Root>
		</div>
	)
}
