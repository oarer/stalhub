'use client'

import { Icon } from '@iconify/react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { userQueries } from '@/queries/user/user.queries'

export function MeWidgetGate({ children }: { children: React.ReactNode }) {
	const t = useTranslations()
	const { data: user, isLoading } = useQuery(userQueries.getMe())

	if (isLoading) {
		return (
			<div className="flex h-full flex-col gap-2 p-4">
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-full w-full" />
			</div>
		)
	}

	if (!user) {
		return (
			<div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
				<Icon
					className="size-9 text-text-accent"
					icon="lucide:lock-keyhole"
				/>
				<p className="max-w-60 font-semibold text-sm text-text-accent">
					{t('dashboard.loginRequired')}
				</p>
				<Link href="/auth">
					<Button size="sm" variant="primary">
						{t('dashboard.signIn')}
					</Button>
				</Link>
			</div>
		)
	}

	return <>{children}</>
}
