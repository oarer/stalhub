'use client'

import { Icon } from '@iconify/react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { toast } from '@/components/ui/Toast'
import { cn } from '@/lib/cn'
import { getQueryClient } from '@/providers/QueryProvider'
import { adminUserQueries } from '@/queries/admin/user.queries'
import { adminArtService } from '@/services/admin/art.service'
import type { AdminUser } from '@/types/admin.type'
import { type Art, ArtType } from '@/types/art.type'
import { ArtImageField } from '@/views/me/components/ArtImageField'
import { parseTags } from '@/views/me/components/article/editor-utils'
import {
	SOCIAL_ICONS,
	SOCIAL_NETWORKS,
} from '@/views/me/components/settings/SocialLinksSection'

const ART_TYPES = [
	{ value: ArtType.DEFAULT, label: 'admin.arts.form.default' },
	{ value: ArtType.NSFW, label: 'admin.arts.form.nsfw' },
]

type AuthorMode = 'guest' | 'user'

export function AdminArtForm({
	open,
	onOpenChange,
	onSaved,
}: {
	open: boolean
	onOpenChange: (open: boolean) => void
	onSaved: (art: Art) => void
}) {
	const t = useTranslations()
	const queryClient = getQueryClient()

	const [title, setTitle] = useState('')
	const [type, setType] = useState<ArtType>(ArtType.DEFAULT)
	const [imageUrl, setImageUrl] = useState('')
	const [tags, setTags] = useState('')

	const [authorMode, setAuthorMode] = useState<AuthorMode>('guest')
	const [guestName, setGuestName] = useState('')
	const [socials, setSocials] = useState<Record<string, string>>({})
	const [userSearch, setUserSearch] = useState('')
	const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)

	useEffect(() => {
		if (open) {
			setTitle('')
			setType(ArtType.DEFAULT)
			setImageUrl('')
			setTags('')
			setAuthorMode('guest')
			setGuestName('')
			setSocials({})
			setUserSearch('')
			setSelectedUser(null)
		}
	}, [open])

	const { data: userResults } = useQuery({
		...adminUserQueries.list({ search: userSearch, take: 8 }),
		enabled: authorMode === 'user' && userSearch.trim().length > 0,
	})

	const createMutation = useMutation({
		mutationFn: () =>
			adminArtService.create({
				title: title.trim(),
				type,
				image_url: imageUrl.trim() || null,
				tags: parseTags(tags),
				...(authorMode === 'user'
					? { authorId: selectedUser?.id }
					: {
							author_name: guestName.trim(),
							...(Object.keys(socials).length > 0 && {
								author_social_links: socials,
							}),
						}),
			}),
		onSuccess: (art) => {
			toast.success(t('admin.arts.toast.created'))
			queryClient.invalidateQueries({ queryKey: ['admin', 'arts'] })
			queryClient.invalidateQueries({ queryKey: ['arts', 'public'] })
			onOpenChange(false)
			onSaved(art)
		},
		onError: () => toast.error(t('admin.arts.toast.createError')),
	})

	const canSubmit =
		title.trim() !== '' &&
		(authorMode === 'guest' ? guestName.trim() !== '' : !!selectedUser)

	const handleSubmit = () => {
		if (!canSubmit || createMutation.isPending) return
		createMutation.mutate()
	}

	return (
		<Modal.Root onOpenChange={onOpenChange} open={open}>
			<Modal.Content fullScreen={false}>
				<Modal.Header>
					<Modal.Title>{t('admin.arts.createTitle')}</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<div className="flex max-h-105 flex-col gap-4 overflow-y-auto pr-1">
						<div className="flex flex-col gap-2">
							<label
								className="font-semibold text-md text-text-accent"
								htmlFor="admin-art-title"
							>
								{t('admin.arts.form.name')}
							</label>
							<Input
								autoFocus
								id="admin-art-title"
								label="admin.arts.form.namePlaceholder"
								onChange={(e) => setTitle(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === 'Enter') handleSubmit()
								}}
								value={title}
							/>
						</div>

						<div className="flex flex-col gap-2">
							<span className="font-semibold text-md text-text-accent">
								{t('admin.arts.form.type')}
							</span>
							<div className="grid grid-cols-2 gap-2">
								{ART_TYPES.map((artType) => (
									<Button
										className={cn(
											'gap-2',
											type === artType.value &&
												'ring-2 ring-border/80'
										)}
										key={artType.value}
										onClick={() => setType(artType.value)}
										type="button"
										variant="secondary"
									>
										{t(artType.label)}
									</Button>
								))}
							</div>
						</div>

						<div className="flex flex-col gap-2">
							<span className="font-semibold text-md text-text-accent">
								{t('admin.arts.form.image')}
							</span>
							<ArtImageField
								onChange={setImageUrl}
								value={imageUrl}
							/>
						</div>

						<div className="flex flex-col gap-2">
							<span className="font-semibold text-md text-text-accent">
								{t('admin.arts.form.tags')}
							</span>
							<Input
								label="admin.arts.form.tagsPlaceholder"
								onChange={(e) => setTags(e.target.value)}
								value={tags}
							/>
						</div>

						<div className="flex flex-col gap-2">
							<span className="font-semibold text-md text-text-accent">
								{t('admin.arts.form.author')}
							</span>
							<div className="flex gap-1">
								<Button
									className={cn(
										authorMode === 'guest' &&
											'bg-accent text-text'
									)}
									onClick={() => setAuthorMode('guest')}
									size="sm"
									variant="ghost"
								>
									{t('admin.arts.form.authorGuest')}
								</Button>
								<Button
									className={cn(
										authorMode === 'user' &&
											'bg-accent text-text'
									)}
									onClick={() => setAuthorMode('user')}
									size="sm"
									variant="ghost"
								>
									{t('admin.arts.form.authorUser')}
								</Button>
							</div>

							{authorMode === 'guest' ? (
								<div className="flex flex-col gap-3">
									<Input
										label="admin.arts.form.authorNamePlaceholder"
										onChange={(e) =>
											setGuestName(e.target.value)
										}
										value={guestName}
									/>
									<div className="flex flex-col gap-1.5">
										{SOCIAL_NETWORKS.map((network) => (
											<div
												className="flex items-center gap-2 rounded-lg bg-accent/50 p-2"
												key={network}
											>
												<Icon
													className="shrink-0 text-text-accent"
													icon={
														SOCIAL_ICONS[network] ??
														'lucide:link'
													}
												/>
												<span className="w-16 shrink-0 font-semibold text-sm capitalize">
													{network}
												</span>
												<Input
													className="flex-1 text-sm"
													onChange={(e) =>
														setSocials((prev) => ({
															...prev,
															[network]:
																e.target.value,
														}))
													}
													placeholder={t(
														'admin.arts.form.socialUrlPlaceholder'
													)}
													value={
														socials[network] ?? ''
													}
												/>
											</div>
										))}
									</div>
								</div>
							) : (
								<div className="flex flex-col gap-2">
									{selectedUser && (
										<div className="flex items-center justify-between rounded-lg bg-accent/50 px-3 py-2">
											<span className="font-semibold text-sm">
												{selectedUser.name ||
													selectedUser.username}
											</span>
											<Button
												onClick={() =>
													setSelectedUser(null)
												}
												size="sm"
												variant="ghost"
											>
												<Icon
													className="text-text-accent"
													icon="lucide:x"
												/>
											</Button>
										</div>
									)}
									{!selectedUser && (
										<>
											<Input
												label="admin.arts.form.authorSearchPlaceholder"
												onChange={(e) =>
													setUserSearch(
														e.target.value
													)
												}
												value={userSearch}
											/>
											{userSearch.trim() &&
												userResults?.data?.length ===
													0 && (
													<p className="text-text-accent text-xs">
														{t(
															'admin.arts.form.authorNotFound'
														)}
													</p>
												)}
											<div className="flex max-h-44 flex-col gap-1 overflow-y-auto">
												{(userResults?.data ?? []).map(
													(u) => (
														<button
															className="flex items-center justify-between rounded-lg bg-accent/50 px-3 py-2 text-left transition-colors hover:bg-border/30"
															key={u.id}
															onClick={() => {
																setSelectedUser(
																	u
																)
																setUserSearch(
																	''
																)
															}}
															type="button"
														>
															<span className="font-semibold text-sm">
																{u.name ||
																	u.username}
															</span>
															<span className="text-text-accent text-xs">
																@{u.username}
															</span>
														</button>
													)
												)}
											</div>
										</>
									)}
								</div>
							)}
						</div>
					</div>
				</Modal.Body>
				<Modal.Footer>
					<Modal.Close>{t('clan.common.cancel')}</Modal.Close>
					<Button
						disabled={!canSubmit}
						loading={createMutation.isPending}
						onClick={handleSubmit}
						variant="primary"
					>
						{t('admin.arts.form.create')}
					</Button>
				</Modal.Footer>
			</Modal.Content>
		</Modal.Root>
	)
}
