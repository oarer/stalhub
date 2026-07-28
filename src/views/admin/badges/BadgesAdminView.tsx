'use client'

import { Icon } from '@iconify/react'
import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from '@tanstack/react-query'
import Image from 'next/image'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Table } from '@/components/ui/Table'
import { toast } from '@/components/ui/Toast'
import { Tooltip } from '@/components/ui/Tooltip'
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
			<Tooltip.Content>{name || 'Бейдж'}</Tooltip.Content>
		</Tooltip.Root>
	)
}

export default function BadgesAdminView() {
	const queryClient = useQueryClient()

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
			toast.success('Бейдж создан')
			queryClient.invalidateQueries({ queryKey: ['admin', 'badges'] })
			setCreateName('')
			setCreateMode('icon')
			setCreateIcon('lucide:badge')
			setCreateImage('')
			setCreateColor('#0ea5e9')
		},
		onError: () => toast.error('Ошибка создания'),
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
			toast.success('Бейдж обновлён')
			queryClient.invalidateQueries({ queryKey: ['admin', 'badges'] })
			setEditBadge(null)
		},
		onError: () => toast.error('Ошибка обновления'),
	})

	const deleteMutation = useMutation({
		mutationFn: (id: number) => adminBadgeService.delete(id),
		onSuccess: () => {
			toast.success('Бейдж удалён')
			queryClient.invalidateQueries({ queryKey: ['admin', 'badges'] })
		},
		onError: () => toast.error('Ошибка удаления'),
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
			<div className="flex items-center justify-between">
				<h1 className="font-semibold text-2xl">Бейджи</h1>
				<span className="text-neutral-400 text-sm">
					{badges?.length ?? 0} всего
				</span>
			</div>

			<Card.Root>
				<Card.Header>
					<Card.Title>
						<Icon icon="lucide:plus" />
						Создать бейдж
					</Card.Title>
				</Card.Header>
				<Card.Content>
					<div className="flex flex-col gap-3">
						<div className="flex items-end gap-3">
							<div className="max-w-60">
								<Input
									label="Название"
									onChange={(
										e: React.ChangeEvent<HTMLInputElement>
									) => setCreateName(e.target.value)}
									value={createName}
								/>
							</div>

							<div className="flex flex-col gap-1.5">
								<p className="font-semibold text-text-accent text-xs">
									Тип
								</p>
								<div className="flex gap-1">
									<button
										className={`flex items-center gap-1.5 rounded-lg border-2 px-2.5 py-1.5 font-semibold text-xs transition-colors ${
											createMode === 'icon'
												? 'border-sky-500 bg-sky-500/10 text-sky-400'
												: 'border-border-secondary hover:border-sky-500/30'
										}`}
										onClick={() => setCreateMode('icon')}
										type="button"
									>
										<Icon
											className="size-3.5"
											icon="lucide:sparkles"
										/>
										Иконка
									</button>
									<button
										className={`flex items-center gap-1.5 rounded-lg border-2 px-2.5 py-1.5 font-semibold text-xs transition-colors ${
											createMode === 'image'
												? 'border-sky-500 bg-sky-500/10 text-sky-400'
												: 'border-border-secondary hover:border-sky-500/30'
										}`}
										onClick={() => setCreateMode('image')}
										type="button"
									>
										<Icon
											className="size-3.5"
											icon="lucide:image"
										/>
										Картинка
									</button>
								</div>
							</div>

							{createMode === 'icon' ? (
								<div className="max-w-60">
									<Input
										label="Иконка"
										onChange={(
											e: React.ChangeEvent<HTMLInputElement>
										) => setCreateIcon(e.target.value)}
										value={createIcon}
									/>
								</div>
							) : (
								<div className="max-w-80">
									<Input
										label="URL картинки"
										onChange={(
											e: React.ChangeEvent<HTMLInputElement>
										) => setCreateImage(e.target.value)}
										value={createImage}
									/>
								</div>
							)}

							<div className="flex items-center gap-2">
								<input
									className="size-9 shrink-0 cursor-pointer rounded border-2 border-border-secondary bg-transparent"
									onChange={(e) =>
										setCreateColor(e.target.value)
									}
									type="color"
									value={createColor}
								/>
								<Input
									label="Цвет"
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
								Создать
							</Button>
						</div>

						<div className="flex items-center gap-2 rounded-lg bg-background px-3 py-2 text-sm">
							<span className="text-text-accent">Превью:</span>
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
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>ID</Table.Head>
							<Table.Head>Название</Table.Head>
							<Table.Head>Тип</Table.Head>
							<Table.Head>Цвет</Table.Head>
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
												Картинка
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
														Удалить бейдж?
													</Modal.Title>
													<Modal.Description>
														Бейдж{' '}
														<strong>
															{badge.name}
														</strong>{' '}
														будет удалён навсегда.
													</Modal.Description>
												</Modal.Header>
												<Modal.Footer>
													<Modal.Close>
														Отмена
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
														Удалить
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
										Нет бейджей
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
			</Card.Root>

			<Modal.Root
				onOpenChange={(o) => {
					if (!o) setEditBadge(null)
				}}
				open={!!editBadge}
			>
				<Modal.Content fullScreen={false}>
					<Modal.Header>
						<Modal.Title>Редактировать бейдж</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<div className="flex flex-col gap-3">
							<Input
								label="Название"
								onChange={(
									e: React.ChangeEvent<HTMLInputElement>
								) => setEditName(e.target.value)}
								value={editName}
							/>

							<div className="flex flex-col gap-1.5">
								<span className="font-semibold text-text-accent text-xs">
									Тип
								</span>
								<div className="flex gap-1">
									<button
										className={`flex items-center gap-1.5 rounded-lg border-2 px-2.5 py-1.5 font-semibold text-xs transition-colors ${
											editMode === 'icon'
												? 'border-sky-500 bg-sky-500/10 text-sky-400'
												: 'border-border-secondary hover:border-sky-500/30'
										}`}
										onClick={() => setEditMode('icon')}
										type="button"
									>
										<Icon
											className="size-3.5"
											icon="lucide:sparkles"
										/>
										Иконка
									</button>
									<button
										className={`flex items-center gap-1.5 rounded-lg border-2 px-2.5 py-1.5 font-semibold text-xs transition-colors ${
											editMode === 'image'
												? 'border-sky-500 bg-sky-500/10 text-sky-400'
												: 'border-border-secondary hover:border-sky-500/30'
										}`}
										onClick={() => setEditMode('image')}
										type="button"
									>
										<Icon
											className="size-3.5"
											icon="lucide:image"
										/>
										Картинка
									</button>
								</div>
							</div>

							{editMode === 'icon' ? (
								<Input
									label="Иконка"
									onChange={(
										e: React.ChangeEvent<HTMLInputElement>
									) => setEditIcon(e.target.value)}
									value={editIcon}
								/>
							) : (
								<Input
									label="URL картинки"
									onChange={(
										e: React.ChangeEvent<HTMLInputElement>
									) => setEditImage(e.target.value)}
									value={editImage}
								/>
							)}

							<div className="flex items-center gap-2">
								<input
									className="size-9 shrink-0 cursor-pointer rounded border-2 border-border-secondary bg-transparent"
									onChange={(e) =>
										setEditColor(e.target.value)
									}
									type="color"
									value={editColor}
								/>
								<Input
									label="Цвет"
									onChange={(
										e: React.ChangeEvent<HTMLInputElement>
									) => setEditColor(e.target.value)}
									value={editColor}
								/>
							</div>

							<div className="flex items-center gap-2 rounded-lg bg-background px-3 py-2 text-sm">
								<span className="text-text-accent">
									Превью:
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
						<Modal.Close>Отмена</Modal.Close>
						<Modal.Action
							closeOnClick
							onClick={() => updateMutation.mutate()}
						>
							Сохранить
						</Modal.Action>
					</Modal.Footer>
				</Modal.Content>
			</Modal.Root>
		</div>
	)
}
