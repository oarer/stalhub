'use client'

import { Icon } from '@iconify/react'
import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Table } from '@/components/ui/Table'
import { toast } from '@/components/ui/Toast'
import { Tooltip } from '@/components/ui/Tooltip'
import { getQueryClient } from '@/providers/QueryProvider'
import { adminBadgeQueries } from '@/queries/admin/badge.queries'
import { adminBadgeService } from '@/services/admin/badge.service'
import type { AdminBadge } from '@/types/admin.type'

type BadgeMode = 'icon' | 'image'

function BadgePreview({
	name,
	color,
	mode,
	icon,
	image,
}: {
	name: string
	color: string
	mode: BadgeMode
	icon: string
	image: string
}) {
	const t = useTranslations()

	return (
		<Tooltip.Root>
			<Tooltip.Trigger asChild>
				<button
					className="flex size-6 items-center justify-center rounded-sm"
					style={{ backgroundColor: color }}
					type="button"
				>
					{mode === 'icon' ? (
						<Icon className="size-5 text-neutral-950" icon={icon} />
					) : image ? (
						<Image
							alt={name}
							className="rounded-sm object-cover"
							height={20}
							src={image}
							unoptimized
							width={20}
						/>
					) : null}
				</button>
			</Tooltip.Trigger>
			<Tooltip.Content>
				{name || t('admin.badges.defaultName')}
			</Tooltip.Content>
		</Tooltip.Root>
	)
}

export default function BadgesAdminView() {
	const t = useTranslations()
	const queryClient = getQueryClient()

	const { data: badges } = useSuspenseQuery(adminBadgeQueries.list())

	const [createName, setCreateName] = useState('')
	const [createMode, setCreateMode] = useState<BadgeMode>('icon')
	const [createIcon, setCreateIcon] = useState('lucide:badge')
	const [createImage, setCreateImage] = useState('')
	const [createColor, setCreateColor] = useState('#0ea5e9')

	const [editBadge, setEditBadge] = useState<AdminBadge | null>(null)
	const [editName, setEditName] = useState('')
	const [editMode, setEditMode] = useState<BadgeMode>('icon')
	const [editIcon, setEditIcon] = useState('')
	const [editImage, setEditImage] = useState('')
	const [editColor, setEditColor] = useState('')

	const createMutation = useMutation({
		mutationFn: () =>
			adminBadgeService.create({
				name: createName,
				icon: createMode === 'icon' ? createIcon : undefined,
				image: createMode === 'image' ? createImage : undefined,
				color: createColor || undefined,
			}),
		onSuccess: () => {
			toast.success(t('admin.badges.toast.created'))
			queryClient.invalidateQueries({ queryKey: ['admin', 'badges'] })
			setCreateName('')
			setCreateMode('icon')
			setCreateIcon('lucide:badge')
			setCreateImage('')
			setCreateColor('#0ea5e9')
		},
		onError: () => toast.error(t('admin.permissions.toast.createError')),
	})

	const updateMutation = useMutation({
		mutationFn: () =>
			adminBadgeService.update(editBadge!.id, {
				name: editName || undefined,
				icon: editMode === 'icon' ? editIcon : undefined,
				image:
					editMode === 'image'
						? editImage
						: editBadge?.image
							? null
							: undefined,
				color: editColor || undefined,
			}),
		onSuccess: () => {
			toast.success(t('admin.badges.toast.updated'))
			queryClient.invalidateQueries({ queryKey: ['admin', 'badges'] })
			setEditBadge(null)
		},
		onError: () => toast.error(t('admin.permissions.toast.updateError')),
	})

	const deleteMutation = useMutation({
		mutationFn: (id: number) => adminBadgeService.delete(id),
		onSuccess: () => {
			toast.success(t('admin.badges.toast.deleted'))
			queryClient.invalidateQueries({ queryKey: ['admin', 'badges'] })
		},
		onError: () => toast.error(t('admin.permissions.toast.deleteError')),
	})

	const openEdit = (badge: AdminBadge) => {
		setEditBadge(badge)
		setEditName(badge.name)
		setEditIcon(badge.icon ?? '')
		setEditImage(badge.image ?? '')
		setEditColor(badge.color)
		setEditMode(badge.image ? 'image' : 'icon')
	}

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<h1 className="font-semibold text-2xl">
					{t('admin.badges.title')}
				</h1>
				<span className="text-neutral-400 text-sm">
					{badges?.length ?? 0} {t('admin.permissions.total')}
				</span>
			</div>

			<Card.Root>
				<Card.Header>
					<Card.Title>
						<Icon icon="lucide:plus" />
						{t('admin.badges.create')}
					</Card.Title>
				</Card.Header>
				<Card.Content>
					<div className="flex flex-col gap-3">
						<div className="flex flex-col flex-wrap gap-3 md:flex-row md:items-end">
							<div className="w-full flex-1 md:w-auto md:max-w-60 md:flex-none">
								<Input
									label="admin.permissions.name"
									onChange={(
										e: React.ChangeEvent<HTMLInputElement>
									) => setCreateName(e.target.value)}
									value={createName}
								/>
							</div>

							<div className="flex flex-col gap-1.5">
								<p className="font-semibold text-text-accent text-xs">
									{t('admin.badges.type')}
								</p>
								<div className="flex gap-1">
									<button
										className={`flex items-center gap-1.5 rounded-lg border-2 px-2.5 py-1.5 font-semibold text-xs transition-colors ${
											createMode === 'icon'
												? 'border-sky-500 bg-sky-500/10 text-sky-400'
												: 'border-primary hover:border-sky-500/30'
										}`}
										onClick={() => setCreateMode('icon')}
										type="button"
									>
										<Icon
											className="size-3.5"
											icon="lucide:sparkles"
										/>
										{t('admin.badges.icon')}
									</button>
									<button
										className={`flex items-center gap-1.5 rounded-lg border-2 px-2.5 py-1.5 font-semibold text-xs transition-colors ${
											createMode === 'image'
												? 'border-sky-500 bg-sky-500/10 text-sky-400'
												: 'border-primary hover:border-sky-500/30'
										}`}
										onClick={() => setCreateMode('image')}
										type="button"
									>
										<Icon
											className="size-3.5"
											icon="lucide:image"
										/>
										{t('admin.badges.image')}
									</button>
								</div>
							</div>

							{createMode === 'icon' ? (
								<div className="w-full md:w-auto md:max-w-60">
									<Input
										label="admin.badges.icon"
										onChange={(
											e: React.ChangeEvent<HTMLInputElement>
										) => setCreateIcon(e.target.value)}
										value={createIcon}
									/>
								</div>
							) : (
								<div className="w-full md:w-auto md:max-w-80">
									<Input
										label="admin.badges.imageUrl"
										onChange={(
											e: React.ChangeEvent<HTMLInputElement>
										) => setCreateImage(e.target.value)}
										value={createImage}
									/>
								</div>
							)}

							<div className="flex items-center gap-2">
								<input
									className="size-9 shrink-0 cursor-pointer rounded border-2 border-primary bg-transparent"
									onChange={(e) =>
										setCreateColor(e.target.value)
									}
									type="color"
									value={createColor}
								/>
								<Input
									label="admin.badges.imageUrl"
									onChange={(
										e: React.ChangeEvent<HTMLInputElement>
									) => setCreateColor(e.target.value)}
									value={createColor}
								/>
							</div>

							<Button
								disabled={!createName}
								loading={createMutation.isPending}
								onClick={() => createMutation.mutate()}
							>
								{t('clan.common.create')}
							</Button>
						</div>

						<div className="flex items-center gap-2 rounded-lg bg-card px-3 py-2 text-sm">
							<span className="text-text-accent">
								{t('admin.badges.preview')}
							</span>
							<BadgePreview
								color={createColor}
								icon={createIcon}
								image={createImage}
								mode={createMode}
								name={createName}
							/>
						</div>
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root className="overflow-hidden p-0">
				<div className="overflow-x-auto">
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>ID</Table.Head>
							<Table.Head>
								{t('admin.permissions.name')}
							</Table.Head>
							<Table.Head>{t('admin.badges.type')}</Table.Head>
							<Table.Head>{t('admin.badges.color')}</Table.Head>
							<Table.Head />
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{badges?.map((badge) => (
							<Table.Row key={badge.id}>
								<Table.Cell>
									<span className="font-mono text-neutral-400 text-xs">
										{badge.id}
									</span>
								</Table.Cell>
								<Table.Cell>
									<BadgePreview
										color={badge.color}
										icon={badge.icon ?? ''}
										image={badge.image ?? ''}
										mode={badge.image ? 'image' : 'icon'}
										name={badge.name}
									/>
								</Table.Cell>
								<Table.Cell>
									<span className="text-neutral-400 text-xs">
										{badge.image ? (
											<span className="flex items-center gap-1">
												<Icon
													className="size-3"
													icon="lucide:image"
												/>
												{t('admin.badges.image')}
											</span>
										) : (
											<span className="flex items-center gap-1">
												<Icon
													className="size-3"
													icon="lucide:sparkles"
												/>
												{badge.icon}
											</span>
										)}
									</span>
								</Table.Cell>
								<Table.Cell>
									<div className="flex items-center gap-2">
										<div
											className="size-4 rounded-full"
											style={{
												backgroundColor: badge.color,
											}}
										/>
										<span className="font-mono text-neutral-400 text-xs">
											{badge.color}
										</span>
									</div>
								</Table.Cell>
								<Table.Cell>
									<div className="flex items-center gap-1">
										<Button
											onClick={() => openEdit(badge)}
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
															'admin.badges.deleteTitle'
														)}
													</Modal.Title>
													<Modal.Description>
														{t.rich(
															'admin.badges.deleteDescription',
															{
																name: badge.name,
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
																badge.id
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
						{(!badges || badges.length === 0) && (
							<Table.Row>
								<Table.Cell>
									<span className="text-neutral-400 text-sm">
										{t('admin.badges.empty')}
									</span>
								</Table.Cell>
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

			<Modal.Root
				onOpenChange={(o) => {
					if (!o) setEditBadge(null)
				}}
				open={!!editBadge}
			>
				<Modal.Content fullScreen={false}>
					<Modal.Header>
						<Modal.Title>{t('admin.badges.edit')}</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<div className="flex flex-col gap-3">
							<Input
								label="admin.permissions.name"
								onChange={(
									e: React.ChangeEvent<HTMLInputElement>
								) => setEditName(e.target.value)}
								value={editName}
							/>

							<div className="flex flex-col gap-1.5">
								<span className="font-semibold text-text-accent text-xs">
									{t('admin.badges.type')}
								</span>
								<div className="flex gap-1">
									<button
										className={`flex items-center gap-1.5 rounded-lg border-2 px-2.5 py-1.5 font-semibold text-xs transition-colors ${
											editMode === 'icon'
												? 'border-sky-500 bg-sky-500/10 text-sky-400'
												: 'border-primary hover:border-sky-500/30'
										}`}
										onClick={() => setEditMode('icon')}
										type="button"
									>
										<Icon
											className="size-3.5"
											icon="lucide:sparkles"
										/>
										{t('admin.badges.icon')}
									</button>
									<button
										className={`flex items-center gap-1.5 rounded-lg border-2 px-2.5 py-1.5 font-semibold text-xs transition-colors ${
											editMode === 'image'
												? 'border-sky-500 bg-sky-500/10 text-sky-400'
												: 'border-primary hover:border-sky-500/30'
										}`}
										onClick={() => setEditMode('image')}
										type="button"
									>
										<Icon
											className="size-3.5"
											icon="lucide:image"
										/>
										{t('admin.badges.image')}
									</button>
								</div>
							</div>

							{editMode === 'icon' ? (
								<Input
									label="admin.badges.icon"
									onChange={(
										e: React.ChangeEvent<HTMLInputElement>
									) => setEditIcon(e.target.value)}
									value={editIcon}
								/>
							) : (
								<Input
									label="admin.badges.imageUrl"
									onChange={(
										e: React.ChangeEvent<HTMLInputElement>
									) => setEditImage(e.target.value)}
									value={editImage}
								/>
							)}

							<div className="flex items-center gap-2">
								<input
									className="size-9 shrink-0 cursor-pointer rounded border-2 border-primary bg-transparent"
									onChange={(e) =>
										setEditColor(e.target.value)
									}
									type="color"
									value={editColor}
								/>
								<Input
									label="admin.badges.color"
									onChange={(
										e: React.ChangeEvent<HTMLInputElement>
									) => setEditColor(e.target.value)}
									value={editColor}
								/>
							</div>

							<div className="flex items-center gap-2 rounded-lg bg-card px-3 py-2 text-sm">
								<span className="text-text-accent">
									{t('admin.badges.preview')}
								</span>
								<BadgePreview
									color={editColor}
									icon={editIcon}
									image={editImage}
									mode={editMode}
									name={editName}
								/>
							</div>
						</div>
					</Modal.Body>
					<Modal.Footer>
						<Modal.Close>{t('clan.common.cancel')}</Modal.Close>
						<Modal.Action
							closeOnClick
							onClick={() => updateMutation.mutate()}
						>
							{t('clan.common.save')}
						</Modal.Action>
					</Modal.Footer>
				</Modal.Content>
			</Modal.Root>
		</div>
	)
}
