'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { Card } from '@/components/ui/Card'
import type { AdminUserDetail } from '@/types/admin.type'

function LinkedAccount({
	icon,
	name,
	value,
	detail,
}: {
	icon: string
	name: string
	value: string
	detail?: string
}) {
	const t = useTranslations()
	return (
		<div className="flex items-center rounded-lg bg-card/50 px-3 py-2">
			<Icon className="shrink-0 text-muted-foreground" icon={icon} />
			<span className="mx-2 w-24 shrink-0 font-semibold text-sm">
				{name}
			</span>
			{value ? (
				<div className="flex min-w-0 flex-1 flex-col">
					<span className="truncate text-sm">{value}</span>
					{detail && (
						<span className="break-all font-mono text-muted-foreground text-xs">
							{detail}
						</span>
					)}
				</div>
			) : (
				<span className="text-muted-foreground text-sm">
					{t('admin.userDetail.notConnected')}
				</span>
			)}
		</div>
	)
}

export function UserLinksTab({ user }: { user: AdminUserDetail }) {
	const t = useTranslations()
	return (
		<Card.Root>
			<Card.Header>
				<Card.Title>
					<Icon icon="lucide:link" />
					{t('admin.userDetail.linkedAccounts')}
				</Card.Title>
			</Card.Header>
			<Card.Content>
				<div className="flex flex-col gap-2">
					<LinkedAccount
						detail={user.discord_auth?.discord_id}
						icon="lucide:message-circle"
						name={t('admin.userDetail.providers.discord')}
						value={user.discord_auth?.username ?? ''}
					/>
					<LinkedAccount
						detail={user.telegram_auth?.telegram_id}
						icon="lucide:send"
						name={t('admin.userDetail.providers.telegram')}
						value={
							user.telegram_auth?.login ||
							user.telegram_auth?.name ||
							''
						}
					/>
					<LinkedAccount
						detail={
							user.exbo_auth
								? user.exbo_auth.region
									? `${user.exbo_auth.login} · ${user.exbo_auth.region}`
									: user.exbo_auth.login
								: undefined
						}
						icon="lucide:gamepad-2"
						name={t('admin.userDetail.providers.exbo')}
						value={user.exbo_auth?.username ?? ''}
					/>
				</div>
			</Card.Content>
		</Card.Root>
	)
}
