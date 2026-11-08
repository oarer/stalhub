'use client'

import { Icon } from '@iconify/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { toast } from '@/components/ui/Toast'
import { formatDate } from '@/lib/date'
import { getSafeHref, isExternalHref } from '@/lib/safe-href'
import { globalNotificationQueries } from '@/queries/global-notification/global-notification.queries'
import { globalNotificationService } from '@/services/global-notification/global-notification.service'
import type {
	GlobalNotification,
	GlobalNotificationContent,
	GlobalNotificationSaveInput,
	GlobalNotificationType,
} from '@/types/global-notification.type'

type Props = {
	onBack: () => void
}

const notificationTypes: GlobalNotificationType[] = [
	'info',
	'warning',
	'danger',
]

const typeIcons: Record<GlobalNotificationType, string> = {
	info: 'info',
	warning: 'triangle-alert',
	danger: 'circle-x',
}

const typeClasses: Record<GlobalNotificationType, string> = {
	info: 'border-info/40 bg-info/10 text-info',
	warning: 'border-warning/40 bg-warning/10 text-warning',
	danger: 'border-destructive/40 bg-destructive/10 text-destructive',
}

function safeDateTime(value: string | null | undefined): string {
	if (!value) return ''
	const date = new Date(value)
	if (Number.isNaN(date.getTime())) return ''
	const offset = date.getTimezoneOffset()
	const local = new Date(date.getTime() - offset * 60_000)
	return local.toISOString().slice(0, 16)
}

function asIsoDateTime(value: string): string | undefined {
	if (!value) return undefined
	const date = new Date(value)
	return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
}

function isCurrentlyActive(
	announcement: GlobalNotification,
	now = Date.now()
): boolean {
	const startsAt = Date.parse(announcement.starts_at)
	const expiresAt = announcement.expires_at
		? Date.parse(announcement.expires_at)
		: Number.POSITIVE_INFINITY

	return (
		announcement.is_active &&
		Number.isFinite(startsAt) &&
		startsAt <= now &&
		expiresAt > now
	)
}

function newTextPart(): GlobalNotificationContent {
	return { type: 'text', text: '' }
}

function newLinkPart(): GlobalNotificationContent {
	return { type: 'link', text: '', href: '' }
}

function partIsComplete(part: GlobalNotificationContent): boolean {
	return (
		Boolean(part.text.trim()) &&
		(part.type === 'text' || Boolean(part.href.trim()))
	)
}

function AnnouncementPreview({
	content,
}: {
	content: GlobalNotificationContent[]
}) {
	return (
		<p className="whitespace-pre-wrap text-sm leading-6">
			{content.map((part, index) => {
				if (part.type === 'text') {
					return (
						<span key={`${part.type}-${index}`}>{part.text}</span>
					)
				}

				const href = getSafeHref(part.href)
				if (!href) {
					return (
						<span key={`${part.type}-${index}`}>{part.text}</span>
					)
				}

				const external = isExternalHref(href)
				return (
					<a
						className="text-primary underline underline-offset-3"
						href={href}
						key={`${part.type}-${index}`}
						rel={external ? 'noopener noreferrer' : undefined}
						target={external ? '_blank' : undefined}
					>
						{part.text}
					</a>
				)
			})}
		</p>
	)
}

export default function GlobalAnnouncementsManager({ onBack }: Props) {
	const t = useTranslations()
	const queryClient = useQueryClient()
	const { data: announcements = [], isError } = useQuery(
		globalNotificationQueries.adminList()
	)
	const [editingId, setEditingId] = useState<number | null>(null)
	const [title, setTitle] = useState('')
	const [type, setType] = useState<GlobalNotificationType>('info')
	const [isActive, setIsActive] = useState(true)
	const [startsAt, setStartsAt] = useState('')
	const [expiresAt, setExpiresAt] = useState('')
	const [parts, setParts] = useState<GlobalNotificationContent[]>([
		newTextPart(),
	])

	const resetForm = () => {
		setEditingId(null)
		setTitle('')
		setType('info')
		setIsActive(true)
		setStartsAt('')
		setExpiresAt('')
		setParts([newTextPart()])
	}

	const invalidateAnnouncements = () => {
		queryClient.invalidateQueries({
			queryKey: ['admin', 'notifications', 'global'],
		})
		queryClient.invalidateQueries({ queryKey: ['global-notifications'] })
	}

	const saveMutation = useMutation({
		mutationFn: ({
			id,
			input,
		}: {
			id: number | null
			input: GlobalNotificationSaveInput
		}) =>
			id === null
				? globalNotificationService.create(input)
				: globalNotificationService.update(id, input),
		onSuccess: () => {
			toast.success(
				editingId === null
					? t('admin.notifications.global.toast.created')
					: t('admin.notifications.global.toast.updated')
			)
			invalidateAnnouncements()
			resetForm()
		},
		onError: () =>
			toast.error(t('admin.notifications.global.toast.saveError')),
	})

	const deleteMutation = useMutation({
		mutationFn: (id: number) => globalNotificationService.remove(id),
		onSuccess: () => {
			toast.success(t('admin.notifications.global.toast.deleted'))
			invalidateAnnouncements()
		},
		onError: () =>
			toast.error(t('admin.notifications.global.toast.deleteError')),
	})

	const updatePart = (
		index: number,
		update: Partial<GlobalNotificationContent>
	) => {
		setParts((current) =>
			current.map((part, partIndex) =>
				partIndex === index
					? ({ ...part, ...update } as typeof part)
					: part
			)
		)
	}

	const removePart = (index: number) => {
		setParts((current) =>
			current.length === 1
				? current
				: current.filter((_, partIndex) => partIndex !== index)
		)
	}

	const movePart = (index: number, direction: -1 | 1) => {
		setParts((current) => {
			const nextIndex = index + direction
			if (nextIndex < 0 || nextIndex >= current.length) return current
			const next = [...current]
			;[next[index], next[nextIndex]] = [next[nextIndex], next[index]]
			return next
		})
	}

	const startEditing = (announcement: GlobalNotification) => {
		setEditingId(announcement.id)
		setTitle(announcement.title)
		setType(announcement.type)
		setIsActive(announcement.is_active)
		setStartsAt(safeDateTime(announcement.starts_at))
		setExpiresAt(safeDateTime(announcement.expires_at))
		setParts(announcement.content)
	}

	const handleSave = () => {
		if (
			!title.trim() ||
			parts.length === 0 ||
			parts.some((part) => !partIsComplete(part))
		)
			return

		const input: GlobalNotificationSaveInput = {
			title: title.trim(),
			type,
			content: parts,
			is_active: isActive,
			expires_at: asIsoDateTime(expiresAt) ?? null,
		}
		const starts = asIsoDateTime(startsAt)
		if (starts) input.starts_at = starts

		saveMutation.mutate({ id: editingId, input })
	}

	const handleDelete = (announcement: GlobalNotification) => {
		if (
			!window.confirm(
				t('admin.notifications.global.confirmDelete', {
					title: announcement.title,
				})
			)
		)
			return
		deleteMutation.mutate(announcement.id)
	}

	const isSaving = saveMutation.isPending || deleteMutation.isPending
	const canSave =
		Boolean(title.trim()) &&
		parts.length > 0 &&
		parts.every((part) => partIsComplete(part))

	return (
		<div className="flex flex-col gap-6">
			<div className="flex items-center justify-between gap-3">
				<div>
					<h2 className="font-semibold text-xl">
						{t('admin.notifications.global.title')}
					</h2>
					<p className="mt-1 text-muted-foreground text-sm">
						{t('admin.notifications.global.description')}
					</p>
				</div>
				<Button onClick={onBack} variant="ghost">
					<Icon className="size-4" icon="lucide:arrow-left" />
					{t('admin.notifications.global.back')}
				</Button>
			</div>

			<Card.Root>
				<Card.Header>
					<Card.Title>
						<Icon icon="lucide:megaphone" />
						{editingId === null
							? t('admin.notifications.global.createTitle')
							: t('admin.notifications.global.editTitle')}
					</Card.Title>
				</Card.Header>
				<Card.Content>
					<div className="flex flex-col gap-4">
						<Input
							label="admin.notifications.global.titleLabel"
							onChange={(event) => setTitle(event.target.value)}
							value={title}
						/>

						<div className="flex flex-col gap-2">
							<span className="font-semibold text-foreground text-sm">
								{t('admin.notifications.global.typeLabel')}
							</span>
							<div className="flex flex-wrap gap-2">
								{notificationTypes.map((value) => (
									<Button
										className={
											value === type
												? 'ring-2 ring-primary'
												: ''
										}
										key={value}
										onClick={() => setType(value)}
										variant="secondary"
									>
										<Icon
											className="size-4"
											icon={`lucide:${typeIcons[value]}`}
										/>
										{t(
											`admin.notifications.global.types.${value}`
										)}
									</Button>
								))}
							</div>
						</div>

						<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
							<Input
								label="admin.notifications.global.startsAt"
								onChange={(event) =>
									setStartsAt(event.target.value)
								}
								type="datetime-local"
								value={startsAt}
							/>
							<Input
								label="admin.notifications.global.expiresAt"
								onChange={(event) =>
									setExpiresAt(event.target.value)
								}
								type="datetime-local"
								value={expiresAt}
							/>
						</div>

						<label className="flex w-fit cursor-pointer items-center gap-2 text-sm">
							<input
								checked={isActive}
								className="size-4 accent-primary"
								onChange={(event) =>
									setIsActive(event.target.checked)
								}
								type="checkbox"
							/>
							<span>
								{t('admin.notifications.global.active')}
							</span>
						</label>

						<div className="flex flex-col gap-3">
							<div className="flex items-center justify-between gap-3">
								<div>
									<h3 className="font-semibold text-sm">
										{t(
											'admin.notifications.global.contentTitle'
										)}
									</h3>
									<p className="mt-1 text-muted-foreground text-xs">
										{t(
											'admin.notifications.global.contentDescription'
										)}
									</p>
								</div>
								<div className="flex flex-wrap gap-2">
									<Button
										className="gap-1.5"
										onClick={() =>
											setParts((current) => [
												...current,
												newTextPart(),
											])
										}
										variant="outline"
									>
										<Icon
											className="size-4"
											icon="lucide:plus"
										/>
										{t(
											'admin.notifications.global.addText'
										)}
									</Button>
									<Button
										className="gap-1.5"
										onClick={() =>
											setParts((current) => [
												...current,
												newLinkPart(),
											])
										}
										variant="outline"
									>
										<Icon
											className="size-4"
											icon="lucide:link"
										/>
										{t(
											'admin.notifications.global.addLink'
										)}
									</Button>
								</div>
							</div>

							{parts.map((part, index) => (
								<div
									className="flex flex-col gap-3 rounded-lg border border-primary/20 bg-background/30 p-3"
									key={`${part.type}-${index}`}
								>
									<div className="flex items-center justify-between gap-2">
										<span className="font-semibold text-muted-foreground text-xs">
											{index + 1}.{' '}
											{t(
												`admin.notifications.global.partType.${part.type}`
											)}
										</span>
										<div className="flex items-center gap-1">
											<Button
												aria-label={t(
													'admin.notifications.global.moveUp'
												)}
												className="size-8 p-0"
												disabled={index === 0}
												onClick={() =>
													movePart(index, -1)
												}
												variant="ghost"
											>
												<Icon
													className="size-4"
													icon="lucide:chevron-up"
												/>
											</Button>
											<Button
												aria-label={t(
													'admin.notifications.global.moveDown'
												)}
												className="size-8 p-0"
												disabled={
													index === parts.length - 1
												}
												onClick={() =>
													movePart(index, 1)
												}
												variant="ghost"
											>
												<Icon
													className="size-4"
													icon="lucide:chevron-down"
												/>
											</Button>
											<Button
												aria-label={t(
													'admin.notifications.global.removePart'
												)}
												className="size-8 p-0 text-destructive"
												disabled={parts.length === 1}
												onClick={() =>
													removePart(index)
												}
												variant="ghost"
											>
												<Icon
													className="size-4"
													icon="lucide:trash-2"
												/>
											</Button>
										</div>
									</div>

									{part.type === 'text' ? (
										<Textarea
											aria-label={t(
												'admin.notifications.global.textPart'
											)}
											className="min-h-20 resize-y"
											onChange={(event) =>
												updatePart(index, {
													text: event.target.value,
												})
											}
											placeholder={t(
												'admin.notifications.global.textPlaceholder'
											)}
											value={part.text}
										/>
									) : (
										<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
											<Input
												label="admin.notifications.global.linkText"
												onChange={(event) =>
													updatePart(index, {
														text: event.target
															.value,
													})
												}
												value={part.text}
											/>
											<Input
												label="admin.notifications.global.linkHref"
												onChange={(event) =>
													updatePart(index, {
														href: event.target
															.value,
													})
												}
												value={part.href}
											/>
										</div>
									)}
								</div>
							))}
						</div>

						<div className="flex flex-wrap gap-2">
							<Button
								disabled={!canSave || isSaving}
								loading={saveMutation.isPending}
								onClick={handleSave}
							>
								<Icon className="size-4" icon="lucide:save" />
								{editingId === null
									? t('admin.notifications.global.create')
									: t('admin.notifications.global.save')}
							</Button>
							{editingId !== null && (
								<Button onClick={resetForm} variant="ghost">
									{t('admin.notifications.global.cancel')}
								</Button>
							)}
						</div>
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header>
					<Card.Title>
						<Icon icon="lucide:layout-list" />
						{t('admin.notifications.global.listTitle')}
					</Card.Title>
				</Card.Header>
				<Card.Content>
					{isError && (
						<Alert.Root variant="destructive">
							<Alert.Description>
								{t('admin.notifications.global.loadError')}
							</Alert.Description>
						</Alert.Root>
					)}
					{!isError && announcements.length === 0 && (
						<p className="text-muted-foreground text-sm">
							{t('admin.notifications.global.empty')}
						</p>
					)}
					<div className="flex flex-col gap-3">
						{announcements.map((announcement) => {
							const currentlyActive =
								isCurrentlyActive(announcement)

							return (
								<div
									className="flex flex-col gap-3 rounded-lg border border-primary/20 bg-background/30 p-4"
									key={announcement.id}
								>
									<div className="flex flex-wrap items-start justify-between gap-3">
										<div className="flex min-w-0 items-start gap-3">
											<span
												className={`mt-0.5 rounded-md border p-1.5 ${typeClasses[announcement.type]}`}
											>
												<Icon
													className="size-4"
													icon={`lucide:${typeIcons[announcement.type]}`}
												/>
											</span>
											<div className="min-w-0">
												<div className="flex flex-wrap items-center gap-2">
													<h3 className="font-semibold">
														{announcement.title}
													</h3>
													<span
														className={`rounded-full border px-2 py-0.5 text-xs ${typeClasses[announcement.type]}`}
													>
														{t(
															`admin.notifications.global.types.${announcement.type}`
														)}
													</span>
													<span
														className={`rounded-full border px-2 py-0.5 text-xs ${currentlyActive ? 'border-success/40 bg-success/10 text-success' : 'border-muted bg-muted text-muted-foreground'}`}
													>
														{currentlyActive
															? t(
																	'admin.notifications.global.active'
																)
															: t(
																	'admin.notifications.global.inactive'
																)}
													</span>
												</div>
												<p className="mt-1 text-muted-foreground text-xs">
													{t(
														'admin.notifications.global.schedule',
														{
															starts: formatDate(
																announcement.starts_at
															),
															expires: formatDate(
																announcement.expires_at
															),
														}
													)}
												</p>
											</div>
										</div>
										<div className="flex shrink-0 items-center gap-1">
											<Button
												aria-label={t(
													'admin.notifications.global.edit'
												)}
												className="size-9 p-0"
												onClick={() =>
													startEditing(announcement)
												}
												variant="ghost"
											>
												<Icon
													className="size-4"
													icon="lucide:pencil"
												/>
											</Button>
											<Button
												aria-label={t(
													'admin.notifications.global.delete'
												)}
												className="size-9 p-0 text-destructive"
												disabled={isSaving}
												onClick={() =>
													handleDelete(announcement)
												}
												variant="ghost"
											>
												<Icon
													className="size-4"
													icon="lucide:trash-2"
												/>
											</Button>
										</div>
									</div>
									<AnnouncementPreview
										content={announcement.content}
									/>
								</div>
							)
						})}
					</div>
				</Card.Content>
			</Card.Root>
		</div>
	)
}
