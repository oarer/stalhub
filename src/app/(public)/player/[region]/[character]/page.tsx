import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import type { AxiosError } from 'axios'
import { getQueryClient } from '@/providers/QueryProvider'
import { playerQueries } from '@/queries/player/player.queries'
import { playerService } from '@/services/player/player.service'
import type { Regions } from '@/types/api.type'
import PlayerNotFoundView from '@/views/errors/playerNotFound/PlayerNotFoundView'
import PlayerView from '@/views/player'
import { dynamicAlternates } from '@/lib/seo'

export async function generateMetadata({
	params,
}: {
	params: Promise<{ region: string; character: string }>
}): Promise<Metadata> {
	const { region, character } = await params
	const title = `${character} — статистика игрока · StalHub`
	const description = `Статистика игрока ${character} (${region.toUpperCase()}) в StalZone: клан, операции и прогресс.`
	try {
		await playerService.get({
			region: region as Regions,
			character,
		})
		return {
			title,
			description,
			alternates: dynamicAlternates(`/player/${region}/${character}`),
			openGraph: {
				title,
				description,
				url: `/player/${region}/${character}`,
				type: 'profile',
			},
		}
	} catch {
		return {
			title: 'Игрок не найден · StalHub',
			robots: { index: false, follow: true },
		}
	}
}

export default async function PlayerPage({
	params,
}: {
	params: Promise<{ region: string; character: string }>
}) {
	const { region, character } = await params

	const queryClient = getQueryClient()
	const playerParams = { region: region as Regions, character }

	try {
		const data = await playerService.get(playerParams)
		queryClient.setQueryData(playerQueries.get(playerParams).queryKey, data)
	} catch (e) {
		const status = (e as AxiosError).response?.status
		if (status === 404) {
			return <PlayerNotFoundView />
		}
		throw e
	}

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<PlayerView character={character} region={region as Regions} />
		</HydrationBoundary>
	)
}
