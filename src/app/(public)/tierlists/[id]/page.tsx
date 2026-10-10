import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { dynamicAlternates, dynamicTwitter } from '@/lib/seo'
import { getQueryClient } from '@/providers/QueryProvider'
import { itemsQueries } from '@/queries/calcs/items.queries'
import { tierListQueries } from '@/queries/tier-list/tier-list.queries'
import { tierListService } from '@/services/tier-list/tier-list.service'
import TierListDetailView from '@/views/tierlists/TierListDetailView'

export async function generateMetadata({
	params,
}: {
	params: Promise<{ id: string }>
}): Promise<Metadata> {
	const { id } = await params
	try {
		const tierList = await tierListService.get(id)
		const title = `${tierList.title} · StalHub`
		const description = `Тирлист «${tierList.title}» — распределение предметов StalZone по тирам от сообщества StalHub.`
		return {
			title,
			description,
			alternates: dynamicAlternates(`/tierlists/${id}`),
			openGraph: {
				title,
				description,
				url: `/tierlists/${id}`,
				type: 'article',
				images: ['/images/og/banner.png'],
			},
			twitter: dynamicTwitter({
				title,
				description,
				images: ['/images/og/banner.png'],
			}),
		}
	} catch {
		return {
			title: 'Тирлист не найден · StalHub',
			robots: { index: false, follow: true },
		}
	}
}

export default async function TierListDetailPage({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const { id } = await params
	const queryClient = getQueryClient()

	await Promise.all([
		queryClient.fetchQuery(tierListQueries.get(id)),
		queryClient.fetchQuery(itemsQueries.get({ type: 'weapons' })),
		queryClient.fetchQuery(itemsQueries.get({ type: 'armor' })),
	])

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<TierListDetailView />
		</HydrationBoundary>
	)
}
