'use client'

import { Icon } from '@iconify/react'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Switch } from '@/components/ui/Switch'
import { toast } from '@/components/ui/Toast'
import { getQueryClient } from '@/providers/QueryProvider'
import { adminUserService } from '@/services/admin/user.service'
import type { AdminUserDetail } from '@/types/admin.type'
import { DeleteConfirmContent } from '../../components/AdminTable'

const SOCIAL_NETWORKS = ['telegram', 'youtube', 'twitch', 'boosty', 'x']

const SOCIAL_ICONS: Record<string, string> = {
	telegram: 'mingcute:telegram-fill',
	youtube: 'lucide:youtube',
	twitch: 'lucide:twitch',
	boosty: 'simple-icons:boosty',
	x: 'prime:twitter',
}

export function UserInfoTab({
	userId,
	user,
}: {
	userId: number
	user: AdminUserDetail
}) {
	const t = useTranslations()
	const router = useRouter()
	const queryClient = getQueryClient()

	const [editName, setEditName] = useState(user.name ?? '')
	const [editUsername, setEditUsername] = useState(user.username)
	const [editOnboarded, setEditOnboarded] = useState(user.onboarded ?? false)
	const [editPublicProfile, setEditPublicProfile] = useState(
		user.user_settings?.public_profile ?? false
	)
	const [editSocialLinks, setEditSocialLinks] = useState<
		Record<string, string>
	>(
		Object.fromEntries(
			SOCIAL_NETWORKS.map((network) => [
				network,
				user.social_links?.[network] ?? '',
			])
		)
	)
	const [banReason, setBanReason] = useState('')
	const [banDuration, setBanDuration] = useState('')

	const invalidateUser = () =>
		queryClient.invalidateQueries({ queryKey: ['admin', 'user', userId] })

	const updateMutation = useMutation({
		mutationFn: () =>
			adminUserService.update(userId, {
				username: editUsername,
				name: editName || undefined,
				onboarded: editOnboarded,
				public_profile: editPublicProfile,
			}),
		onSuccess: () => {
			toast.success(t('admin.userDetail.toast.updated'))
			invalidateUser()
		},
		onError: () => toast.error(t('admin.userDetail.toast.updateError')),
	})

	const socialLinksMutation = useMutation({
		mutationFn: () => {
			const pruned: Record<string, string> = {}
			for (const [network, url] of Object.entries(editSocialLinks)) {
				const trimmed = url.trim()
				if (trimmed) pruned[network] = trimmed
			}
			return adminUserService.update(userId, { social_links: pruned })
		},
		onSuccess: () => {
			toast.success(t('admin.userDetail.toast.linksUpdated'))
			invalidateUser()
		},
		onError: () =>
			toast.error(t('admin.userDetail.toast.linksUpdateError')),
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
			invalidateUser()
		},
		onError: () => toast.error(t('admin.userDetail.toast.banError')),
	})

	const unbanMutation = useMutation({
		mutationFn: () => adminUserService.unban(userId),
		onSuccess: () => {
			toast.success(t('admin.userDetail.toast.unbanned'))
			invalidateUser()
		},
		onError: () => toast.error(t('admin.userDetail.toast.unbanError')),
	})

	const deleteMutation = useMutation({
		mutationFn: () => adminUserService.delete(userId),
		onSuccess: () => {
			toast.success(t('admin.userDetail.toast.deleted'))
			router.push('/admin/users')
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
			invalidateUser()
		},
		onError: () =>
			toast.error(t('admin.userDetail.toast.buildsDeleteError')),
	})

	return (
		<>
			<Card.Root>
				<Card.Header>
					<Card.Title>
						<Icon icon="lucide:user-cog" />
						{t('admin.userDetail.editing')}
					</Card.Title>
				</Card.Header>
				<Card.Content>
					<div className="flex flex-col gap-4">
						<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
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
						<div className="grid grid-cols-1 gap-3 rounded-lg bg-card/50 p-4 md:grid-cols-2">
							<div className="flex items-center justify-between gap-2">
								<span className="flex items-center gap-2 font-semibold text-sm">
									<Icon
										className="text-muted-foreground"
										icon="lucide:check-circle"
									/>
									{t('admin.userDetail.onboarded')}
								</span>
								<Switch
									checked={editOnboarded}
									onCheckedChange={setEditOnboarded}
								/>
							</div>
							<div className="flex items-center justify-between gap-2">
								<span className="flex items-center gap-2 font-semibold text-sm">
									<Icon
										className="text-muted-foreground"
										icon="lucide:globe"
									/>
									{t('admin.userDetail.publicProfile')}
								</span>
								<Switch
									checked={editPublicProfile}
									onCheckedChange={setEditPublicProfile}
								/>
							</div>
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
						<Icon icon="lucide:share-2" />
						{t('admin.userDetail.socialLinks')}
					</Card.Title>
				</Card.Header>
				<Card.Content>
					<div className="flex flex-col gap-3">
						{SOCIAL_NETWORKS.map((network) => (
							<div
								className="flex items-center gap-2 rounded-lg bg-card/50 px-3 py-2"
								key={network}
							>
								<Icon
									className="shrink-0 text-muted-foreground"
									icon={
										SOCIAL_ICONS[network] ?? 'lucide:link'
									}
								/>
								<span className="w-20 shrink-0 font-semibold text-sm capitalize">
									{network}
								</span>
								<Input
									className="flex-1"
									onChange={(e) =>
										setEditSocialLinks((prev) => ({
											...prev,
											[network]: e.target.value,
										}))
									}
									placeholder={t(
										'admin.userDetail.socialLinksPlaceholder'
									)}
									value={editSocialLinks[network] ?? ''}
								/>
							</div>
						))}
						<div className="flex items-center gap-3">
							<Button
								loading={socialLinksMutation.isPending}
								onClick={() => socialLinksMutation.mutate()}
							>
								{t('admin.userDetail.socialLinksSave')}
							</Button>
						</div>
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root className="mt-4">
				<Card.Header>
					<Card.Title>
						<Icon className="text-red-400" icon="lucide:ban" />
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
							<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
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
							<DeleteConfirmContent
								cancelLabel={t('admin.userDetail.cancel')}
								confirmLabel={t(
									'admin.userDetail.builds.confirm'
								)}
								description={t(
									'admin.userDetail.builds.description',
									{ count: user._count?.builds || 0 }
								)}
								onConfirm={() => deleteBuildsMutation.mutate()}
								title={t(
									'admin.userDetail.builds.confirmTitle'
								)}
							/>
						</Modal.Content>
					</Modal.Root>
				</Card.Content>
			</Card.Root>

			<Card.Root className="mt-4">
				<Card.Header>
					<Card.Title>
						<Icon className="text-red-400" icon="lucide:trash-2" />
						{t('admin.userDetail.delete.title')}
					</Card.Title>
				</Card.Header>
				<Card.Content>
					<Modal.Root>
						<Modal.Trigger variant="danger">
							{t('admin.userDetail.delete.trigger')}
						</Modal.Trigger>
						<Modal.Content fullScreen={false}>
							<DeleteConfirmContent
								cancelLabel={t('admin.userDetail.cancel')}
								confirmLabel={t(
									'admin.userDetail.delete.confirm'
								)}
								description={t(
									'admin.userDetail.delete.description',
									{ name: user.username }
								)}
								onConfirm={() => deleteMutation.mutate()}
								title={t(
									'admin.userDetail.delete.confirmTitle'
								)}
							/>
						</Modal.Content>
					</Modal.Root>
				</Card.Content>
			</Card.Root>
		</>
	)
}
