'use client'

import { Icon } from '@iconify/react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { type Dispatch, type SetStateAction, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Combobox, type ComboboxOption } from '@/components/ui/Combobox'
import Input from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Table } from '@/components/ui/Table'
import { toast } from '@/components/ui/Toast'
import {
	ACHIEVEMENT_RARITIES,
	ACHIEVEMENT_RARITY_COLORS,
} from '@/constants/achievement.const'
import { getQueryClient } from '@/providers/QueryProvider'
import { adminAchievementQueries } from '@/queries/admin/achievement.queries'
import { adminAchievementService } from '@/services/admin/achievement.service'
import type {
	AchievementRarity,
	AdminAchievement,
	AdminCreateAchievement,
	AdminUpdateAchievement,
} from '@/types/achievement.type'
import { AdminDeleteModal, AdminTableHeader } from '../components/AdminTable'

interface AchievementFormState {
	slug: string
	title: string
	description: string
	icon: string
	rarity: AchievementRarity
	hidden: boolean
}

const emptyForm: AchievementFormState = {
	slug: '',
	title: '',
	description: '',
	icon: 'mdi:trophy',
	rarity: 'COMMON',
	hidden: false,
}

function FormFields({
	value,
	onChange,
}: {
	value: AchievementFormState
	onChange: <K extends keyof AchievementFormState>(
		field: K,
		value: AchievementFormState[K]
	) => void
}) {
	const t = useTranslations()

	const rarityOptions: ComboboxOption[] = ACHIEVEMENT_RARITIES.map(
		(rarity) => ({
			value: rarity,
			label: rarity,
		})
	)

	return (
		<div className="grid gap-3 md:grid-cols-2">
			<Input
				label="admin.achievements.slug"
				onChange={(e) => onChange('slug', e.target.value)}
				value={value.slug}
			/>
			<Input
				label="admin.permissions.name"
				onChange={(e) => onChange('title', e.target.value)}
				value={value.title}
			/>
			<Input
				label="admin.permissions.description"
				onChange={(e) => onChange('description', e.target.value)}
				value={value.description}
			/>
			<Input
				label="admin.achievements.icon"
				onChange={(e) => onChange('icon', e.target.value)}
				value={value.icon}
			/>
			<div className="flex flex-col gap-1.5">
				<span className="font-semibold text-foreground text-xs">
					{t('admin.achievements.rarity')}
				</span>
				<Combobox
					onValueChange={(val) =>
						onChange('rarity', val as AchievementRarity)
					}
					options={rarityOptions}
					placeholder="admin.achievements.rarity"
					translateOptions={false}
					value={value.rarity}
				/>
			</div>
			<label className="flex cursor-pointer items-center gap-2 self-end pb-2 text-sm">
				<input
					checked={value.hidden}
					onChange={(e) => onChange('hidden', e.target.checked)}
					type="checkbox"
				/>
				<span>{t('admin.achievements.hidden')}</span>
			</label>
		</div>
	)
}

function RarityBadge({ rarity }: { rarity: AchievementRarity }) {
	return (
		<span
			className="inline-flex items-center gap-1 rounded-md px-2 py-1 font-semibold text-xs"
			style={{
				backgroundColor: `${ACHIEVEMENT_RARITY_COLORS[rarity]}20`,
				color: ACHIEVEMENT_RARITY_COLORS[rarity],
			}}
		>
			<Icon className="size-3.5" icon="lucide:sparkles" />
			{rarity}
		</span>
	)
}

function Preview({
	achievement,
}: {
	achievement: Pick<AdminAchievement, 'icon' | 'title' | 'rarity'>
}) {
	const color = ACHIEVEMENT_RARITY_COLORS[achievement.rarity]

	return (
		<div
			className="flex size-9 items-center justify-center rounded-lg border-2"
			style={{
				borderColor: color,
				boxShadow: `0 0 10px ${color}55`,
				color,
			}}
		>
			<Icon
				className="size-5"
				icon={achievement.icon || 'lucide:award'}
			/>
		</div>
	)
}

export default function AchievementsAdminView() {
	const t = useTranslations()
	const queryClient = getQueryClient()
	const { data: achievements = [], isPending } = useQuery(
		adminAchievementQueries.list()
	)
	const [createForm, setCreateForm] =
		useState<AchievementFormState>(emptyForm)
	const [editAchievement, setEditAchievement] =
		useState<AdminAchievement | null>(null)
	const [editForm, setEditForm] = useState<AchievementFormState>(emptyForm)
	const [selectedAchievementId, setSelectedAchievementId] = useState('')
	const [userId, setUserId] = useState('')

	const updateForm = <K extends keyof AchievementFormState>(
		setter: Dispatch<SetStateAction<AchievementFormState>>,
		field: K,
		value: AchievementFormState[K]
	) => setter((current) => ({ ...current, [field]: value }))

	const createMutation = useMutation({
		mutationFn: () => {
			const data: AdminCreateAchievement = {
				slug: createForm.slug,
				title: createForm.title,
				description: createForm.description || undefined,
				icon: createForm.icon || undefined,
				rarity: createForm.rarity,
				hidden: createForm.hidden,
			}
			return adminAchievementService.create(data)
		},
		onSuccess: () => {
			toast.success(t('admin.achievements.toast.created'))
			queryClient.invalidateQueries({
				queryKey: ['admin', 'achievements'],
			})
			setCreateForm(emptyForm)
		},
		onError: () => toast.error(t('admin.achievements.toast.createError')),
	})

	const updateMutation = useMutation({
		mutationFn: () => {
			if (!editAchievement) throw new Error('No achievement selected')
			const data: AdminUpdateAchievement = {
				slug: editForm.slug,
				title: editForm.title,
				description: editForm.description,
				icon: editForm.icon,
				rarity: editForm.rarity,
				hidden: editForm.hidden,
			}
			return adminAchievementService.update(editAchievement.id, data)
		},
		onSuccess: () => {
			toast.success(t('admin.achievements.toast.updated'))
			queryClient.invalidateQueries({
				queryKey: ['admin', 'achievements'],
			})
			setEditAchievement(null)
		},
		onError: () => toast.error(t('admin.achievements.toast.updateError')),
	})

	const deleteMutation = useMutation({
		mutationFn: (id: number) => adminAchievementService.delete(id),
		onSuccess: () => {
			toast.success(t('admin.achievements.toast.deleted'))
			queryClient.invalidateQueries({
				queryKey: ['admin', 'achievements'],
			})
		},
		onError: () => toast.error(t('admin.achievements.toast.deleteError')),
	})

	const grantMutation = useMutation({
		mutationFn: () =>
			adminAchievementService.assignUser(
				Number(selectedAchievementId),
				Number(userId)
			),
		onSuccess: () => {
			toast.success(t('admin.achievements.toast.granted'))
			queryClient.invalidateQueries({
				queryKey: ['admin', 'achievements'],
			})
			queryClient.invalidateQueries({
				queryKey: ['admin', 'user', Number(userId), 'achievements'],
			})
		},
		onError: () => toast.error(t('admin.achievements.toast.grantError')),
	})

	const revokeMutation = useMutation({
		mutationFn: () =>
			adminAchievementService.removeUser(
				Number(selectedAchievementId),
				Number(userId)
			),
		onSuccess: () => {
			toast.success(t('admin.achievements.toast.revoked'))
			queryClient.invalidateQueries({
				queryKey: ['admin', 'achievements'],
			})
			queryClient.invalidateQueries({
				queryKey: ['admin', 'user', Number(userId), 'achievements'],
			})
		},
		onError: () => toast.error(t('admin.achievements.toast.revokeError')),
	})

	const openEdit = (achievement: AdminAchievement) => {
		setEditAchievement(achievement)
		setEditForm({
			slug: achievement.slug,
			title: achievement.title,
			description: achievement.description,
			icon: achievement.icon,
			rarity: achievement.rarity,
			hidden: achievement.hidden,
		})
	}

	const canAssign = Number(selectedAchievementId) > 0 && Number(userId) > 0

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<h1 className="font-semibold text-2xl">
					{t('admin.achievements.title')}
				</h1>
				<span className="text-neutral-400 text-sm">
					{achievements.length} {t('admin.permissions.total')}
				</span>
			</div>

			<Card.Root>
				<Card.Header>
					<Card.Title>
						<Icon icon="lucide:plus" />
						{t('admin.achievements.create')}
					</Card.Title>
				</Card.Header>
				<Card.Content>
					<div className="flex flex-col gap-4">
						<FormFields
							onChange={(field, value) =>
								updateForm(setCreateForm, field, value)
							}
							value={createForm}
						/>
						<div className="flex justify-end">
							<Button
								disabled={!createForm.slug || !createForm.title}
								loading={createMutation.isPending}
								onClick={() => createMutation.mutate()}
							>
								{t('admin.achievements.create')}
							</Button>
						</div>
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header>
					<Card.Title>
						<Icon icon="lucide:user-plus" />
						{t('admin.achievements.grantUser')}
					</Card.Title>
				</Card.Header>
				<Card.Content>
					<div className="flex flex-col gap-3 md:flex-row md:items-end">
						<div className="flex flex-1 flex-col gap-1.5">
							<span className="font-semibold text-foreground text-xs">
								{t('admin.achievements.title')}
							</span>
							<Combobox
								onValueChange={setSelectedAchievementId}
								options={achievements.map((a) => ({
									value: String(a.id),
									label: a.title,
								}))}
								placeholder="admin.achievements.selectAchievement"
								translateOptions={false}
								value={selectedAchievementId}
							/>
						</div>
						<div className="flex-1">
							<Input
								label="admin.achievements.userId"
								onChange={(e) => setUserId(e.target.value)}
								type="number"
								value={userId}
							/>
						</div>
						<div className="flex gap-2">
							<Button
								disabled={!canAssign}
								loading={grantMutation.isPending}
								onClick={() => grantMutation.mutate()}
							>
								{t('admin.achievements.grant')}
							</Button>
							<Button
								disabled={!canAssign}
								loading={revokeMutation.isPending}
								onClick={() => revokeMutation.mutate()}
								variant="outline"
							>
								{t('admin.achievements.revoke')}
							</Button>
						</div>
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root className="overflow-hidden p-0">
				<Table.Root>
					<AdminTableHeader
						columns={[
							{
								key: 'achievement',
								label: t('admin.permissions.name'),
							},
							{
								key: 'slug',
								label: t('admin.achievements.slug'),
							},
							{
								key: 'rarity',
								label: t('admin.achievements.rarity'),
							},
							{
								key: 'hidden',
								label: t('admin.achievements.hidden'),
							},
							{
								key: 'users',
								label: t('admin.achievements.userCount'),
							},
							{
								key: 'actions',
								label: t('admin.permissions.actions'),
							},
						]}
					/>
					<Table.Body>
						{achievements.map((achievement) => (
							<Table.Row key={achievement.id}>
								<Table.Cell>
									<span className="font-mono text-neutral-400 text-xs">
										{achievement.id}
									</span>
								</Table.Cell>
								<Table.Cell>
									<div className="flex items-center gap-2">
										<Preview achievement={achievement} />
										<div className="min-w-0">
											<p className="truncate font-semibold">
												{achievement.title}
											</p>
											{achievement.description && (
												<p className="max-w-60 truncate text-foreground text-xs">
													{achievement.description}
												</p>
											)}
										</div>
									</div>
								</Table.Cell>
								<Table.Cell>
									<span className="font-mono text-neutral-400 text-xs">
										{achievement.slug}
									</span>
								</Table.Cell>
								<Table.Cell>
									<RarityBadge rarity={achievement.rarity} />
								</Table.Cell>
								<Table.Cell>
									{achievement.hidden ? (
										<span className="flex items-center gap-1 text-amber-400 text-xs">
											<Icon
												className="size-3.5"
												icon="lucide:eye-off"
											/>
											{t('admin.achievements.hidden')}
										</span>
									) : (
										<span className="text-neutral-500">
											—
										</span>
									)}
								</Table.Cell>
								<Table.Cell>
									<span className="font-mono text-sm">
										{achievement._count?.users ?? 0}
									</span>
								</Table.Cell>
								<Table.Cell>
									<div className="flex items-center gap-1">
										<Button
											onClick={() =>
												openEdit(achievement)
											}
											size="sm"
											variant="ghost"
										>
											<Icon icon="lucide:pencil" />
										</Button>
										<AdminDeleteModal
											cancelLabel={t(
												'admin.permissions.cancel'
											)}
											confirmLabel={t(
												'admin.permissions.deleteConfirm'
											)}
											description={achievement.title}
											onConfirm={() =>
												deleteMutation.mutate(
													achievement.id
												)
											}
											title={t(
												'admin.achievements.confirmDelete'
											)}
										/>
									</div>
								</Table.Cell>
							</Table.Row>
						))}
						{!isPending && achievements.length === 0 && (
							<Table.Row>
								<Table.Cell>
									<span className="text-neutral-400 text-sm">
										{t('admin.achievements.empty')}
									</span>
								</Table.Cell>
								{Array.from({ length: 6 }).map((_, i) => (
									<Table.Cell key={i} />
								))}
							</Table.Row>
						)}
					</Table.Body>
				</Table.Root>
			</Card.Root>

			<Modal.Root
				onOpenChange={(open) => {
					if (!open) setEditAchievement(null)
				}}
				open={Boolean(editAchievement)}
			>
				<Modal.Content fullScreen={false}>
					<Modal.Header>
						<Modal.Title>
							{t('admin.achievements.edit')}
						</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<FormFields
							onChange={(field, value) =>
								updateForm(setEditForm, field, value)
							}
							value={editForm}
						/>
					</Modal.Body>
					<Modal.Footer>
						<Modal.Close>
							{t('admin.permissions.cancel')}
						</Modal.Close>
						<Modal.Action
							closeOnClick
							disabled={!editForm.slug || !editForm.title}
							onClick={() => updateMutation.mutate()}
						>
							{t('admin.permissions.save')}
						</Modal.Action>
					</Modal.Footer>
				</Modal.Content>
			</Modal.Root>
		</div>
	)
}
