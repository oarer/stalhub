'use client'

import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { usePathname } from 'next/navigation'
import { getQueryClient } from '@/providers/QueryProvider'
import { userQueries } from '@/queries/user/user.queries'
import { userService } from '@/services/user/user.service'
import type { BgVariant } from '@/types/user.type'
import NavTabs from '@/views/me/components/NavTabs'
import UserCard from '@/views/me/components/UserCard'

export default function MeSection() {
	const pathname = usePathname()
	const queryClient = getQueryClient()
	const { data: user } = useSuspenseQuery(userQueries.getMe())
	const { data: unreadCount } = useSuspenseQuery(userQueries.getUnreadCount())

	const bgVariant = (user.settings?.bg_variant ?? 'NONE') as BgVariant
	const bgColor = user.settings?.bg_color ?? '#000000'

	const bgUpdateMutation = useMutation({
		mutationFn: (data: { bg_variant?: BgVariant; bg_color?: string }) =>
			userService.patchMe(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['user'] })
		},
	})

	return (
		<div className="flex flex-col gap-4">
			<UserCard
				bgColor={bgColor}
				bgVariant={bgVariant}
				onBgChange={bgUpdateMutation.mutate}
				user={user}
			/>
			<NavTabs pathname={pathname} unreadCount={unreadCount} />
		</div>
	)
}
