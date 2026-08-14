'use client'

import { useQuery } from '@tanstack/react-query'
import { getQueryClient } from '@/providers/QueryProvider'
import { clanQueries } from '@/queries/clan/clan.queries'
import { HoverCard, type HoverCardSide } from '../HoverCard'
import ClanCard from './ClanCard'

type Props = {
	clanId: string
	side?: HoverCardSide
	children: React.ReactNode
}

export default function HoverClanCard({ clanId, side, children }: Props) {
	const queryClient = getQueryClient()

	const { data: clan } = useQuery({
		...clanQueries.getPublicClan(clanId),
		enabled: false,
	})

	const handleMouseEnter = () => {
		queryClient.prefetchQuery(clanQueries.getPublicClan(clanId))
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
				{clan && <ClanCard clan={clan} className="w-full p-0" />}
			</HoverCard.Content>
		</HoverCard.Root>
	)
}
