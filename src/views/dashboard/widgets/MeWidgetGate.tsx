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
					className="text-foreground size-9"
					icon="lucide:lock-keyhole"
				/>
				<p className="text-foreground max-w-60 text-sm font-semibold">
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
