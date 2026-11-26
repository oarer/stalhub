'use client'

import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { type ReactNode, useEffect } from 'react'
import { userQueries } from '@/queries/user/user.queries'

export default function AwardsAccessGuard({
	children,
}: {
	children: ReactNode
}) {
	const router = useRouter()
	const { data: user, isPending, isError } = useQuery(userQueries.getMe())

	const hasAccess =
		user?.roles?.some((role) => role.name === 'awards') ?? false

	useEffect(() => {
		if (isPending || hasAccess) return
		router.replace(isError ? '/auth' : '/')
	}, [isPending, hasAccess, isError, router])

	if (isPending) {
		return (
			<div className="flex min-h-dvh items-center justify-center">
				<div className="border-primary size-10 animate-spin rounded-full border-2 border-t-transparent" />
			</div>
		)
	}

	if (!hasAccess) return null

	return <>{children}</>
}
