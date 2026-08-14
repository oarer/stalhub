'use client'

import { useSuspenseQuery } from '@tanstack/react-query'
import { usePathname, useRouter } from 'next/navigation'
import { Suspense, useEffect } from 'react'
import { userQueries } from '@/queries/user/user.queries'
import { usePatchMe } from '@/views/me/hooks/usePatchMe'
import ClassicLayout from '@/views/me/layouts/ClassicLayout'
import CompactLayout from '@/views/me/layouts/CompactLayout'
import ModernLayout from '@/views/me/layouts/ModernLayout'
import MobileMeNav from '@/views/me/MobileMeNav'

export default function MeLayout({ children }: { children: React.ReactNode }) {
	const pathname = usePathname()
	const router = useRouter()
	const { data: user } = useSuspenseQuery(userQueries.getMe())
	const { data: unreadCount } = useSuspenseQuery(userQueries.getUnreadCount())
	const userCardUpdateMutation = usePatchMe()

	const isOnboarding = pathname === '/me/onboarding'
	const isArticleEditor =
		pathname.startsWith('/me/articles/') && pathname.endsWith('/edit')

	useEffect(() => {
		if (!user.onboarded && !isOnboarding) {
			router.replace('/me/onboarding')
		}
	}, [user.onboarded, isOnboarding, router])

	if (!user.onboarded) {
		return <>{children}</>
	}

	if (isArticleEditor) {
		return <>{children}</>
	}

	const layoutProps = {
		children,
		user,
		unreadCount,
		pathname,
		onCardChange: userCardUpdateMutation.mutate,
	}

	const layout = user.customization.layout

	return (
		<>
			{layout === 'MODERN' ? (
				<ModernLayout {...layoutProps} />
			) : layout === 'COMPACT' ? (
				<CompactLayout {...layoutProps} />
			) : (
				<ClassicLayout {...layoutProps} />
			)}
			<Suspense fallback={null}>
				<MobileMeNav />
			</Suspense>
		</>
	)
}
