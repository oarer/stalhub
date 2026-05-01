import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { generateItemMetadata } from '@/lib/generateItemMetadata'
import { getLocaleServer } from '@/lib/getLocaleServer'
import { getQueryClient } from '@/providers/QueryProvider'
import { auctionQueries } from '@/queries/auction/auction.queries'
import { itemQueries } from '@/queries/item/item.queries'
import ItemsView from '@/views/items'

type PageProps = {
	params: Promise<{ slug: string[] }>
}

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const { slug } = await params
	const locale = await getLocaleServer()

	const itemData = await generateItemMetadata(slug, locale)
	if (!itemData) {
		return {
			title: 'Item not found',
			robots: { index: false, follow: true },
		}
	}

	return {
		title: `${itemData.name} — StalHub`,
		description: itemData.description,
		openGraph: {
			title: itemData.name,
			description: itemData.description,
			images: [
				`https://raw.githubusercontent.com/oarer/sc-db/main${itemData.icon}`,
			],
		},
	}
}
export default async function ItemsPage({ params }: PageProps) {
	const { slug } = await params

	const path = Array.isArray(slug) ? slug : []
	const id = slug[slug.length - 1]
	const githubUrl = `${path.join('/')}.json`

	const queryClient = getQueryClient()

	await Promise.allSettled([
		queryClient.prefetchQuery(itemQueries.byGithubUrl(githubUrl)),
		queryClient.prefetchQuery(itemQueries.barter(id)),

		queryClient.prefetchQuery(auctionQueries.lots({ id })),
		queryClient.prefetchQuery(auctionQueries.history({ id })),
	])

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<ItemsView githubUrl={githubUrl} id={id} path={path} />
		</HydrationBoundary>
	)
}
