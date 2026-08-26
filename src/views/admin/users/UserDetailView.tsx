'use client'

import { Icon } from '@iconify/react'
import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Combobox } from '@/components/ui/Combobox'
import Input from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Table } from '@/components/ui/Table'
import { Tabs } from '@/components/ui/Tabs'
import { toast } from '@/components/ui/Toast'
import { getQueryClient } from '@/providers/QueryProvider'
import { adminBadgeQueries } from '@/queries/admin/badge.queries'
import { adminRoleQueries } from '@/queries/admin/role.queries'
import { adminUserQueries } from '@/queries/admin/user.queries'
import { adminBadgeService } from '@/services/admin/badge.service'
import { adminUserService } from '@/services/admin/user.service'

interface Props {
	userId: number
}

export default function UserDetailView({ userId }: Props) {
	const t = useTranslations()
	const queryClient = getQueryClient()

	const { data: user } = useSuspenseQuery(adminUserQueries.get(userId))
	const { data: sessions } = useSuspenseQuery(
		adminUserQueries.getSessions(userId)
	)
	const { data: userRoles } = useSuspenseQuery(
		adminUserQueries.getRoles(userId)
	)
	const { data: allRoles } = useSuspenseQuery(adminRoleQueries.list())
	const { data: userBadges } = useSuspenseQuery(
		adminBadgeQueries.getUserBadges(userId)
	)
	const { data: allBadges } = useSuspenseQuery(adminBadgeQueries.list())

	const [editName, setEditName] = useState(user.name ?? '')
	const [editUsername, setEditUsername] = useState(user.username)
	const [banReason, setBanReason] = useState('')
	const [banDuration, setBanDuration] = useState('')

	const [bannerMode, setBannerMode] = useState<'COLOR' | 'IMAGE' | 'NONE'>(
		user.customization?.banner_mode ?? 'NONE'
	)
	const [bannerType, setBannerType] = useState<'BACKGROUND' | 'HEADER'>(
		user.customization?.banner_type ?? 'HEADER'
	)
	const [bannerColor, setBannerColor] = useState(
		user.customization?.banner_color ?? '#171717'
	)
	const [bannerImage, setBannerImage] = useState(
		user.customization?.banner_image ?? ''
	)

	const updateMutation = useMutation({
		mutationFn: () =>
			adminUserService.update(userId, {
				username: editUsername,
				name: editName || undefined,
			}),
		onSuccess: () => {
			toast.success(t('admin.userDetail.toast.updated'))
			queryClient.invalidateQueries({
				queryKey: ['admin', 'user', userId],
			})
		},
		onError: () => toast.error(t('admin.userDetail.toast.updateError')),
	})

	const banMutation = useMutation({
		mutationFn: () =>
			adminUserService.ban(userId, {
				reason: banReason || undefined,
				expires_in: banDuration
					? Number(banDuration) * 3600
					: undefined,
			}),
		onSuccess: () => {
			toast.success(t('admin.userDetail.toast.banned'))
			queryClient.invalidateQueries({
				queryKey: ['admin', 'user', userId],
			})
		},
		onError: () => toast.error(t('admin.userDetail.toast.banError')),
	})

	const unbanMutation = useMutation({
		mutationFn: () => adminUserService.unban(userId),
		onSuccess: () => {
			toast.success(t('admin.userDetail.toast.unbanned'))
			queryClient.invalidateQueries({
				queryKey: ['admin', 'user', userId],
			})
		},
		onError: () => toast.error(t('admin.userDetail.toast.unbanError')),
	})

	const revokeSessionMutation = useMutation({
		mutationFn: (sessionId: string) =>
			adminUserService.revokeSession(userId, sessionId),
		onSuccess: () => {
			toast.success(t('admin.userDetail.toast.sessionRevoked'))
			queryClient.invalidateQueries({
				queryKey: ['admin', 'user', userId, 'sessions'],
			})
		},
		onError: () =>
			toast.error(t('admin.userDetail.toast.sessionRevokeError')),
	})

	const assignRoleMutation = useMutation({
		mutationFn: (roleId: number) =>
			adminUserService.assignRole(userId, roleId),
		onSuccess: () => {
			toast.success(t('admin.userDetail.toast.roleAssigned'))
			queryClient.invalidateQueries({
				queryKey: ['admin', 'user', userId, 'roles'],
			})
		},
		onError: () => toast.error(t('admin.userDetail.toast.roleAssignError')),
	})

	const removeRoleMutation = useMutation({
		mutationFn: (roleId: number) =>
			adminUserService.removeRole(userId, roleId),
		onSuccess: () => {
			toast.success(t('admin.userDetail.toast.roleRemoved'))
			queryClient.invalidateQueries({
				queryKey: ['admin', 'user', userId, 'roles'],
			})
		},
		onError: () => toast.error(t('admin.userDetail.toast.roleRemoveError')),
	})

	const assignBadgeMutation = useMutation({
		mutationFn: (badgeId: number) =>
			adminBadgeService.assignUser(badgeId, userId),
		onSuccess: () => {
			toast.success(t('admin.userDetail.toast.badgeAssigned'))
			queryClient.invalidateQueries({
				queryKey: ['admin', 'user', userId, 'badges'],
			})
		},
		onError: () =>
			toast.error(t('admin.userDetail.toast.badgeAssignError')),
	})

	const removeBadgeMutation = useMutation({
		mutationFn: (badgeId: number) =>
			adminBadgeService.removeUser(badgeId, userId),
		onSuccess: () => {
			toast.success(t('admin.userDetail.toast.badgeRemoved'))
			queryClient.invalidateQueries({
				queryKey: ['admin', 'user', userId, 'badges'],
			})
		},
		onError: () =>
			toast.error(t('admin.userDetail.toast.badgeRemoveError')),
	})

	const deleteMutation = useMutation({
		mutationFn: () => adminUserService.delete(userId),
		onSuccess: () => {
			toast.success(t('admin.userDetail.toast.deleted'))
			window.location.href = '/admin/users'
		},
		onError: () => toast.error(t('admin.userDetail.toast.deleteError')),
	})

	const deleteBuildsMutation = useMutation({
		mutationFn: () => adminUserService.deleteBuilds(userId),
		onSuccess: (res) => {
			toast.success(
				t('admin.userDetail.toast.buildsDeleted', {
					count: res.deleted,
				})
			)
			queryClient.invalidateQueries({
				queryKey: ['admin', 'user', userId],
			})
		},
		onError: () =>
			toast.error(t('admin.userDetail.toast.buildsDeleteError')),
	})

	const bannerMutation = useMutation({
		mutationFn: () =>
			adminUserService.updateCustomization(userId, {
				banner_mode: bannerMode,
				banner_type: bannerType,
				banner_color: bannerColor,
				banner_image: bannerImage || null,
			}),
		onSuccess: () => {
			toast.success(t('admin.userDetail.toast.bannerUpdated'))
			queryClient.invalidateQueries({
				queryKey: ['admin', 'user', userId],
			})
		},
		onError: () =>
			toast.error(t('admin.userDetail.toast.bannerUpdateError')),
	})

	const uploadBannerMutation = useMutation({
		mutationFn: (file: File) => adminUserService.uploadBanner(userId, file),
		onSuccess: (res) => {
			toast.success(t('admin.userDetail.toast.bannerUploaded'))
			setBannerImage(res.banner_image)
			setBannerMode('IMAGE')
			queryClient.invalidateQueries({
				queryKey: ['admin', 'user', userId],
			})
		},
		onError: () =>
			toast.error(t('admin.userDetail.toast.bannerUploadError')),
	})

	const userRoleIds = new Set(userRoles?.map((r) => r.id) ?? [])
	const availableRoles = allRoles?.filter((r) => !userRoleIds.has(r.id)) ?? []

	const userBadgeIds = new Set(userBadges?.map((b) => b.id) ?? [])
	const availableBadges =
		allBadges?.filter((b) => !userBadgeIds.has(b.id)) ?? []

	return (
		<div className="flex flex-col gap-6">
			<div className="flex items-center gap-3">
				<Link href="/admin/users">
					<Button size="sm" variant="ghost">
						<Icon icon="lucide:arrow-left" />
					</Button>
				</Link>
				<h1 className="font-semibold text-2xl">{user.username}</h1>
				{user.banned && (
					<span className="rounded-full bg-red-500/10 px-2 py-0.5 font-semibold text-red-400 text-xs">
						{t('admin.users.status.banned')}
					</span>
				)}
			</div>

			<Tabs.Root defaultValue="info">
				<Tabs.List>
					<Tabs.Trigger value="info">
						<Icon icon="lucide:user" />
						{t('admin.userDetail.tabs.info')}
					</Tabs.Trigger>
					<Tabs.Trigger value="sessions">
						<Icon icon="lucide:monitor" />
						{t('admin.userDetail.tabs.sessions')} (
						{sessions?.length ?? 0})
					</Tabs.Trigger>
					<Tabs.Trigger value="roles">
						<Icon icon="lucide:shield" />
						{t('admin.userDetail.tabs.roles')} (
						{userRoles?.length ?? 0})
					</Tabs.Trigger>
					<Tabs.Trigger value="badges">
						<Icon icon="lucide:award" />
						{t('admin.userDetail.tabs.badges')} (
						{userBadges?.length ?? 0})
					</Tabs.Trigger>
					<Tabs.Trigger value="banner">
						<Icon icon="lucide:image" />
						{t('admin.userDetail.tabs.banner')}
					</Tabs.Trigger>
				</Tabs.List>

				<Tabs.Content value="info">
					<Card.Root>
						<Card.Header>
							<Card.Title>
								<Icon icon="lucide:user-cog" />
								{t('admin.userDetail.editing')}
							</Card.Title>
						</Card.Header>
						<Card.Content>
							<div className="flex flex-col gap-4">
								<div className="grid grid-cols-2 gap-3">
									<Input
										label="admin.userDetail.username"
										onChange={(
											e: React.ChangeEvent<HTMLInputElement>
										) => setEditUsername(e.target.value)}
										value={editUsername}
									/>
									<Input
										label="admin.userDetail.name"
										onChange={(
											e: React.ChangeEvent<HTMLInputElement>
										) => setEditName(e.target.value)}
										value={editName}
									/>
								</div>
								<div className="flex items-center gap-3">
									<Button
										loading={updateMutation.isPending}
										onClick={() => updateMutation.mutate()}
									>
										{t('admin.userDetail.save')}
									</Button>
								</div>
							</div>
						</Card.Content>
					</Card.Root>

					<Card.Root className="mt-4">
						<Card.Header>
							<Card.Title>
								<Icon
									className="text-red-400"
									icon="lucide:ban"
								/>
								{t('admin.userDetail.ban.title')}
							</Card.Title>
						</Card.Header>
						<Card.Content>
							{user.banned ? (
								<div className="flex items-center gap-3">
									<span className="text-red-400 text-sm">
										{t('admin.userDetail.ban.banned')}
									</span>
									<Button
										loading={unbanMutation.isPending}
										onClick={() => unbanMutation.mutate()}
										variant="danger"
									>
										{t('admin.userDetail.ban.unban')}
									</Button>
								</div>
							) : (
								<div className="flex flex-col gap-4">
									<div className="grid grid-cols-2 gap-3">
										<Input
											label="admin.userDetail.ban.reason"
											onChange={(
												e: React.ChangeEvent<HTMLInputElement>
											) => setBanReason(e.target.value)}
											value={banReason}
										/>
										<Input
											label="admin.userDetail.ban.duration"
											onChange={(
												e: React.ChangeEvent<HTMLInputElement>
											) => setBanDuration(e.target.value)}
											type="number"
											value={banDuration}
										/>
									</div>
									<div className="flex items-center gap-3">
										<Button
											loading={banMutation.isPending}
											onClick={() => banMutation.mutate()}
											variant="danger"
										>
											{t('admin.userDetail.ban.confirm')}
										</Button>
									</div>
								</div>
							)}
						</Card.Content>
					</Card.Root>

					<Card.Root className="mt-4">
						<Card.Header>
							<Card.Title>
								<Icon icon="lucide:box" />
								{t('admin.userDetail.builds.title')} (
								{user._count?.builds ?? 0})
							</Card.Title>
						</Card.Header>
						<Card.Content>
							<Modal.Root>
								<Modal.Trigger variant="danger">
									<Icon icon="lucide:trash-2" />
									{t('admin.userDetail.builds.trigger')}
								</Modal.Trigger>
								<Modal.Content fullScreen={false}>
									<Modal.Header>
										<Modal.Title>
											{t(
												'admin.userDetail.builds.confirmTitle'
											)}
										</Modal.Title>
										<Modal.Description>
											{t(
												'admin.userDetail.builds.description',
												{
													count:
														user._count?.builds ||
														0,
												}
											)}
										</Modal.Description>
									</Modal.Header>
									<Modal.Footer>
										<Modal.Close>
											{t('admin.userDetail.cancel')}
										</Modal.Close>
										<Modal.Action
											closeOnClick
											onClick={() =>
												deleteBuildsMutation.mutate()
											}
											variant="danger"
										>
											{t(
												'admin.userDetail.builds.confirm'
											)}
										</Modal.Action>
									</Modal.Footer>
								</Modal.Content>
							</Modal.Root>
						</Card.Content>
					</Card.Root>

					<Card.Root className="mt-4">
						<Card.Header>
							<Card.Title>
								<Icon
									className="text-red-400"
									icon="lucide:trash-2"
								/>
								{t('admin.userDetail.delete.title')}
							</Card.Title>
						</Card.Header>
						<Card.Content>
							<Modal.Root>
								<Modal.Trigger variant="danger">
									{t('admin.userDetail.delete.trigger')}
								</Modal.Trigger>
								<Modal.Content fullScreen={false}>
									<Modal.Header>
										<Modal.Title>
											{t(
												'admin.userDetail.delete.confirmTitle'
											)}
										</Modal.Title>
										<Modal.Description>
											{t(
												'admin.userDetail.delete.description',
												{ name: user.username }
											)}
										</Modal.Description>
									</Modal.Header>
									<Modal.Footer>
										<Modal.Close>
											{t('admin.userDetail.cancel')}
										</Modal.Close>
										<Modal.Action
											closeOnClick
											onClick={() =>
												deleteMutation.mutate()
											}
											variant="danger"
										>
											{t(
												'admin.userDetail.delete.confirm'
											)}
										</Modal.Action>
									</Modal.Footer>
								</Modal.Content>
							</Modal.Root>
						</Card.Content>
					</Card.Root>
				</Tabs.Content>

				<Tabs.Content value="sessions">
					<Card.Root className="overflow-hidden p-0">
						<Table.Root>
							<Table.Header>
								<Table.Row>
									<Table.Head>ID</Table.Head>
									<Table.Head>IP</Table.Head>
									<Table.Head>
										{t('admin.userDetail.sessions.device')}
									</Table.Head>
									<Table.Head>
										{t('admin.userDetail.sessions.created')}
									</Table.Head>
									<Table.Head>
										{t('admin.userDetail.sessions.active')}
									</Table.Head>
									<Table.Head />
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{sessions?.map((session) => (
									<Table.Row key={session.id}>
										<Table.Cell>
											<span className="font-mono text-neutral-400 text-xs">
												{session.id}
											</span>
										</Table.Cell>
										<Table.Cell>{session.ip}</Table.Cell>
										<Table.Cell>
											<span className="max-w-50 truncate text-xs">
												{session.user_agent}
											</span>
										</Table.Cell>
										<Table.Cell>
											{new Date(
												session.last_used_at
											).toLocaleDateString('ru-RU')}
										</Table.Cell>
										<Table.Cell>
											{new Date(
												session.last_used_at
											).toLocaleDateString('ru-RU')}
										</Table.Cell>
										<Table.Cell>
											<Modal.Root>
												<Modal.Trigger variant="ghost">
													<Icon
														className="text-red-400"
														icon="lucide:x"
													/>
												</Modal.Trigger>
												<Modal.Content
													fullScreen={false}
												>
													<Modal.Header>
														<Modal.Title>
															{t(
																'admin.userDetail.sessions.revokeTitle'
															)}
														</Modal.Title>
													</Modal.Header>
													<Modal.Footer>
														<Modal.Close>
															{t(
																'admin.userDetail.cancel'
															)}
														</Modal.Close>
														<Modal.Action
															closeOnClick
															onClick={() =>
																revokeSessionMutation.mutate(
																	String(
																		session.id
																	)
																)
															}
															variant="danger"
														>
															{t(
																'admin.userDetail.sessions.revokeConfirm'
															)}
														</Modal.Action>
													</Modal.Footer>
												</Modal.Content>
											</Modal.Root>
										</Table.Cell>
									</Table.Row>
								))}
							</Table.Body>
						</Table.Root>
					</Card.Root>
				</Tabs.Content>

				<Tabs.Content value="roles">
					<Card.Root>
						<Card.Header>
							<div className="flex items-center justify-between">
								<Card.Title>
									<Icon icon="lucide:shield" />
									{t('admin.userDetail.roles.title')}
								</Card.Title>
								{availableRoles.length > 0 && (
									<Modal.Root>
										<Modal.Trigger>
											<Icon icon="lucide:plus" />
											{t('admin.userDetail.roles.add')}
										</Modal.Trigger>
										<Modal.Content fullScreen={false}>
											<Modal.Header>
												<Modal.Title>
													{t(
														'admin.userDetail.roles.add'
													)}
												</Modal.Title>
											</Modal.Header>
											<Modal.Body>
												<div className="flex flex-col gap-2">
													{availableRoles.map(
														(role) => (
															<Button
																className="justify-start"
																key={role.id}
																onClick={() =>
																	assignRoleMutation.mutate(
																		role.id
																	)
																}
																variant="outline"
															>
																{role.name}
																{role.description && (
																	<span className="ml-2 text-neutral-400 text-xs">
																		—{' '}
																		{
																			role.description
																		}
																	</span>
																)}
															</Button>
														)
													)}
												</div>
											</Modal.Body>
											<Modal.Footer>
												<Modal.Close>
													{t(
														'admin.userDetail.close'
													)}
												</Modal.Close>
											</Modal.Footer>
										</Modal.Content>
									</Modal.Root>
								)}
							</div>
						</Card.Header>
						<Card.Content>
							{userRoles && userRoles.length > 0 ? (
								<div className="flex flex-col gap-2">
									{userRoles.map((role) => (
										<div
											className="flex items-center justify-between rounded-lg bg-card/50 px-3 py-2"
											key={role.id}
										>
											<div>
												<p className="font-semibold text-sm">
													{role.name}
												</p>
												{role.description && (
													<p className="text-neutral-400 text-xs">
														{role.description}
													</p>
												)}
											</div>
											<Modal.Root>
												<Modal.Trigger variant="ghost">
													<Icon
														className="text-red-400"
														icon="lucide:x"
													/>
												</Modal.Trigger>
												<Modal.Content
													fullScreen={false}
												>
													<Modal.Header>
														<Modal.Title>
															{t(
																'admin.userDetail.roles.removeTitle'
															)}
														</Modal.Title>
														<Modal.Description>
															{t(
																'admin.userDetail.roles.removeDescription',
																{
																	name: role.name,
																}
															)}
														</Modal.Description>
													</Modal.Header>
													<Modal.Footer>
														<Modal.Close>
															{t(
																'admin.userDetail.cancel'
															)}
														</Modal.Close>
														<Modal.Action
															closeOnClick
															onClick={() =>
																removeRoleMutation.mutate(
																	role.id
																)
															}
															variant="danger"
														>
															{t(
																'admin.userDetail.roles.removeConfirm'
															)}
														</Modal.Action>
													</Modal.Footer>
												</Modal.Content>
											</Modal.Root>
										</div>
									))}
								</div>
							) : (
								<p className="text-neutral-400 text-sm">
									{t('admin.userDetail.roles.empty')}
								</p>
							)}
						</Card.Content>
					</Card.Root>
				</Tabs.Content>

				<Tabs.Content value="badges">
					<Card.Root>
						<Card.Header>
							<div className="flex items-center justify-between">
								<Card.Title>
									<Icon icon="lucide:award" />
									{t('admin.userDetail.badges.title')}
								</Card.Title>
								{availableBadges.length > 0 && (
									<Modal.Root>
										<Modal.Trigger>
											<Icon icon="lucide:plus" />
											{t('admin.userDetail.badges.add')}
										</Modal.Trigger>
										<Modal.Content fullScreen={false}>
											<Modal.Header>
												<Modal.Title>
													{t(
														'admin.userDetail.badges.add'
													)}
												</Modal.Title>
											</Modal.Header>
											<Modal.Body>
												<div className="flex flex-col gap-2">
													{availableBadges.map(
														(badge) => (
															<Button
																className="justify-start gap-2"
																key={badge.id}
																onClick={() =>
																	assignBadgeMutation.mutate(
																		badge.id
																	)
																}
																variant="outline"
															>
																{badge.icon ? (
																	<Icon
																		className="size-3.5"
																		icon={
																			badge.icon
																		}
																		style={{
																			color: badge.color,
																		}}
																	/>
																) : badge.image ? (
																	<Image
																		alt={
																			badge.name
																		}
																		className="size-3.5 rounded-sm object-cover"
																		height={
																			14
																		}
																		src={
																			badge.image
																		}
																		unoptimized
																		width={
																			14
																		}
																	/>
																) : null}
																{badge.name}
															</Button>
														)
													)}
												</div>
											</Modal.Body>
											<Modal.Footer>
												<Modal.Close>
													{t(
														'admin.userDetail.close'
													)}
												</Modal.Close>
											</Modal.Footer>
										</Modal.Content>
									</Modal.Root>
								)}
							</div>
						</Card.Header>
						<Card.Content>
							{userBadges && userBadges.length > 0 ? (
								<div className="flex flex-col gap-2">
									{userBadges.map((badge) => (
										<div
											className="flex items-center justify-between rounded-lg bg-card/50 px-3 py-2"
											key={badge.id}
										>
											<div
												className="flex items-center gap-1.5 rounded-md px-2 py-0.5 font-semibold text-xs"
												style={{
													backgroundColor: `${badge.color}15`,
													color: badge.color,
												}}
											>
												{badge.icon ? (
													<Icon
														className="size-3.5"
														icon={badge.icon}
													/>
												) : badge.image ? (
													<Image
														alt={badge.name}
														className="size-3.5 rounded-sm object-cover"
														height={14}
														src={badge.image}
														unoptimized
														width={14}
													/>
												) : null}
												{badge.name}
											</div>
											<Modal.Root>
												<Modal.Trigger variant="ghost">
													<Icon
														className="text-red-400"
														icon="lucide:x"
													/>
												</Modal.Trigger>
												<Modal.Content
													fullScreen={false}
												>
													<Modal.Header>
														<Modal.Title>
															{t(
																'admin.userDetail.badges.removeTitle'
															)}
														</Modal.Title>
														<Modal.Description>
															{t(
																'admin.userDetail.badges.removeDescription',
																{
																	name: badge.name,
																}
															)}
														</Modal.Description>
													</Modal.Header>
													<Modal.Footer>
														<Modal.Close>
															{t(
																'admin.userDetail.cancel'
															)}
														</Modal.Close>
														<Modal.Action
															closeOnClick
															onClick={() =>
																removeBadgeMutation.mutate(
																	badge.id
																)
															}
															variant="danger"
														>
															{t(
																'admin.userDetail.badges.removeConfirm'
															)}
														</Modal.Action>
													</Modal.Footer>
												</Modal.Content>
											</Modal.Root>
										</div>
									))}
								</div>
							) : (
								<p className="text-neutral-400 text-sm">
									{t('admin.userDetail.badges.empty')}
								</p>
							)}
						</Card.Content>
					</Card.Root>
				</Tabs.Content>
				<Tabs.Content value="banner">
					<Card.Root>
						<Card.Header>
							<Card.Title>
								<Icon icon="lucide:image" />
								{t('admin.userDetail.banner.title')}
							</Card.Title>
						</Card.Header>
						<Card.Content>
							<div className="flex flex-col gap-4">
								<div className="relative flex h-32 w-full items-center justify-center overflow-hidden rounded-lg border-2 border-primary">
									{bannerMode === 'COLOR' && (
										<div
											className="h-full w-full"
											style={{
												backgroundColor: bannerColor,
											}}
										/>
									)}
									{bannerMode === 'IMAGE' && bannerImage && (
										<Image
											alt="banner"
											className="h-full w-full object-cover"
											height={128}
											src={`${process.env.NEXT_PUBLIC_API}${bannerImage}`}
											unoptimized
											width={512}
										/>
									)}
									{bannerMode === 'NONE' ||
										(bannerMode === 'IMAGE' &&
											!bannerImage && (
												<span className="text-neutral-400 text-sm">
													{t(
														'admin.userDetail.banner.noBanner'
													)}
												</span>
											))}
								</div>

								<div className="grid grid-cols-2 gap-3">
									<Combobox
										onValueChange={(v) =>
											setBannerMode(
												v as 'COLOR' | 'IMAGE' | 'NONE'
											)
										}
										options={[
											{
												value: 'NONE',
												label: 'admin.userDetail.banner.modeNone',
											},
											{
												value: 'COLOR',
												label: 'admin.userDetail.banner.modeColor',
											},
											{
												value: 'IMAGE',
												label: 'admin.userDetail.banner.modeImage',
											},
										]}
										placeholder="admin.userDetail.banner.mode"
										value={bannerMode}
									/>
									<Combobox
										onValueChange={(v) =>
											setBannerType(
												v as 'BACKGROUND' | 'HEADER'
											)
										}
										options={[
											{
												value: 'HEADER',
												label: 'admin.userDetail.banner.typeHeader',
											},
											{
												value: 'BACKGROUND',
												label: 'admin.userDetail.banner.typeBackground',
											},
										]}
										placeholder="admin.userDetail.banner.type"
										value={bannerType}
									/>
								</div>

								{bannerMode === 'COLOR' && (
									<div className="flex items-center gap-3">
										<input
											className="h-9 w-16 cursor-pointer rounded border-2 border-primary bg-card"
											onChange={(e) =>
												setBannerColor(e.target.value)
											}
											type="color"
											value={bannerColor}
										/>
										<Input
											label="admin.userDetail.banner.color"
											onChange={(e) =>
												setBannerColor(e.target.value)
											}
											value={bannerColor}
										/>
									</div>
								)}

								{bannerMode === 'IMAGE' && (
									<div className="flex flex-col gap-3">
										<Input
											label="admin.userDetail.banner.imageUrl"
											onChange={(e) =>
												setBannerImage(e.target.value)
											}
											value={bannerImage}
										/>
										<label className="flex w-fit cursor-pointer items-center gap-2 rounded-lg border-2 border-primary px-4 py-2 font-semibold text-sm transition-colors duration-300 hover:bg-accent">
											<Icon icon="lucide:upload" />
											{t(
												'admin.userDetail.banner.upload'
											)}
											<input
												accept="image/png,image/jpeg,image/webp"
												className="hidden"
												disabled={
													uploadBannerMutation.isPending
												}
												onChange={(e) => {
													const file =
														e.target.files?.[0]
													if (file) {
														uploadBannerMutation.mutate(
															file
														)
													}
												}}
												type="file"
											/>
										</label>
									</div>
								)}

								<div className="flex items-center gap-3">
									<Button
										loading={bannerMutation.isPending}
										onClick={() => bannerMutation.mutate()}
									>
										{t('admin.userDetail.banner.save')}
									</Button>
								</div>
							</div>
						</Card.Content>
					</Card.Root>
				</Tabs.Content>
			</Tabs.Root>
		</div>
	)
}
