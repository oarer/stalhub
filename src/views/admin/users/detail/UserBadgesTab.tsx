'use client'

import { Icon } from '@iconify/react'
import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { toast } from '@/components/ui/Toast'
import { getQueryClient } from '@/providers/QueryProvider'
import { adminBadgeQueries } from '@/queries/admin/badge.queries'
import { adminBadgeService } from '@/services/admin/badge.service'
import { DeleteConfirmContent } from '../../components/AdminTable'

export function UserBadgesTab({ userId }: { userId: number }) {
	const t = useTranslations()
	const queryClient = getQueryClient()

	const { data: userBadges } = useSuspenseQuery(
		adminBadgeQueries.getUserBadges(userId)
	)
	const { data: allBadges } = useSuspenseQuery(adminBadgeQueries.list())

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

	const userBadgeIds = new Set(userBadges?.map((b) => b.id) ?? [])
	const availableBadges =
		allBadges?.filter((b) => !userBadgeIds.has(b.id)) ?? []

	return (
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
										{t('admin.userDetail.badges.add')}
									</Modal.Title>
								</Modal.Header>
								<Modal.Body>
									<div className="flex flex-col gap-2">
										{availableBadges.map((badge) => (
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
														icon={badge.icon}
														style={{
															color: badge.color,
														}}
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
											</Button>
										))}
									</div>
								</Modal.Body>
								<Modal.Footer>
									<Modal.Close>
										{t('admin.userDetail.close')}
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
									<Modal.Content fullScreen={false}>
										<DeleteConfirmContent
											cancelLabel={t(
												'admin.userDetail.cancel'
											)}
											confirmLabel={t(
												'admin.userDetail.badges.removeConfirm'
											)}
											description={t(
												'admin.userDetail.badges.removeDescription',
												{ name: badge.name }
											)}
											onConfirm={() =>
												removeBadgeMutation.mutate(
													badge.id
												)
											}
											title={t(
												'admin.userDetail.badges.removeTitle'
											)}
										/>
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
	)
}
