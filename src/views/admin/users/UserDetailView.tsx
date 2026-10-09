'use client'

import { Icon } from '@iconify/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'
import { Tabs } from '@/components/ui/Tabs'
import { adminBadgeQueries } from '@/queries/admin/badge.queries'
import { adminUserQueries } from '@/queries/admin/user.queries'
import { UserBadgesTab } from './detail/UserBadgesTab'
import { UserCustomizationTab } from './detail/UserCustomizationTab'
import { UserInfoTab } from './detail/UserInfoTab'
import { UserLinksTab } from './detail/UserLinksTab'
import { UserRolesTab } from './detail/UserRolesTab'
import { UserSessionsTab } from './detail/UserSessionsTab'

interface Props {
	userId: number
}

export default function UserDetailView({ userId }: Props) {
	const t = useTranslations()

	const { data: user } = useSuspenseQuery(adminUserQueries.get(userId))
	const { data: sessions } = useSuspenseQuery(
		adminUserQueries.getSessions(userId)
	)
	const { data: userRoles } = useSuspenseQuery(
		adminUserQueries.getRoles(userId)
	)
	const { data: userBadges } = useSuspenseQuery(
		adminBadgeQueries.getUserBadges(userId)
	)

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-wrap items-center gap-3">
				<Link href="/admin/users">
					<Button size="sm" variant="ghost">
						<Icon icon="lucide:arrow-left" />
					</Button>
				</Link>
				<h1 className="break-all font-semibold text-2xl">
					{user.username}
				</h1>
				{user.banned && (
					<span className="rounded-full bg-red-500/10 px-2 py-0.5 font-semibold text-red-400 text-xs">
						{t('admin.users.status.banned')}
					</span>
				)}
			</div>

			<Tabs.Root defaultValue="info">
				<Tabs.List className="flex-wrap">
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
					<Tabs.Trigger value="links">
						<Icon icon="lucide:link" />
						{t('admin.userDetail.tabs.links')}
					</Tabs.Trigger>
					<Tabs.Trigger value="banner">
						<Icon icon="lucide:image" />
						{t('admin.userDetail.tabs.customization')}
					</Tabs.Trigger>
				</Tabs.List>

				<Tabs.Content value="info">
					<UserInfoTab user={user} userId={userId} />
				</Tabs.Content>

				<Tabs.Content value="sessions">
					<UserSessionsTab userId={userId} />
				</Tabs.Content>

				<Tabs.Content value="roles">
					<UserRolesTab userId={userId} />
				</Tabs.Content>

				<Tabs.Content value="badges">
					<UserBadgesTab userId={userId} />
				</Tabs.Content>
				<Tabs.Content value="banner">
					<UserCustomizationTab user={user} userId={userId} />
				</Tabs.Content>

				<Tabs.Content value="links">
					<UserLinksTab user={user} />
				</Tabs.Content>
			</Tabs.Root>
		</div>
	)
}
