import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from '@tanstack/react-query'

import { playerQueries } from '@/queries/player/player.queries'
import PlayerView from '@/views/player'

export default async function PlayerPage({
	params,
}: {
	params: Promise<{ region: string; character: string }>
}) {
	const { region, character } = await params

	const queryClient = new QueryClient()

	await queryClient.prefetchQuery(playerQueries.get({ region, character }))

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<PlayerView character={character} region={region} />
		</HydrationBoundary>
	)
}
