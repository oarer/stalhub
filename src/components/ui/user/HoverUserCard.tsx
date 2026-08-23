'use client'

import { useQuery } from '@tanstack/react-query'
import { getQueryClient } from '@/providers/QueryProvider'
import { userQueries } from '@/queries/user/user.queries'
import UserCard from '@/views/me/components/UserCard'
import { HoverCard, type HoverCardSide } from '../HoverCard'

type Props =
	| { id: number; username?: never; side?: HoverCardSide; children: React.ReactNode }
	| { username: string; id?: never; side?: HoverCardSide; children: React.ReactNode }

export default function HoverUserCard({
	id,
	username,
	side,
	children,
}: Props) {
	const queryClient = getQueryClient()

	const query = id ? userQueries.getUser(id) : userQueries.getUserByUsername(username!)

	const { data: user } = useQuery({
		...query,
		enabled: false,
	})

	const handleMouseEnter = () => {
		queryClient.prefetchQuery(query)
	}

	return (
		<HoverCard.Root>
			<HoverCard.Trigger
				asChild
				className="cursor-pointer"
				onMouseEnter={handleMouseEnter}
			>
				{children}
			</HoverCard.Trigger>

			<HoverCard.Content asChild side={side}>
				{user && (
					<UserCard
						cardBackground={
							user.customization.card_background ?? 'NONE'
						}
						cardColor={user.customization.card_color ?? '#000000'}
						user={user}
					/>
				)}
			</HoverCard.Content>
		</HoverCard.Root>
	)
}
