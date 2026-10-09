import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { breadcrumbJsonLd, JsonLd } from '@/components/seo/JsonLd'
import { SITE_META } from '@/constants/meta'
import { generateItemMetadata } from '@/lib/generateItemMetadata'
import { getLocaleServer } from '@/lib/getLocaleServer'
import { dynamicAlternates, dynamicTwitter } from '@/lib/seo'
import { getQueryClient } from '@/providers/QueryProvider'
import { auctionQueries } from '@/queries/auction/auction.queries'
import { itemQueries } from '@/queries/item/item.queries'
import type { Item } from '@/types/item.type'
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
			title: 'Предмет не найден · StalHub',
			robots: { index: false, follow: true },
		}
	}

	const itemPath = `/items/${slug.join('/')}`

	return {
		title: `${itemData.name} · StalHub`,
		description: itemData.description,
		alternates: dynamicAlternates(itemPath),
		openGraph: {
			title: `${itemData.name} · StalHub`,
			description: itemData.description,
			url: itemPath,
			images: [`https://cdn.stalhub.dev/db${itemData.icon}`],
		},
		twitter: dynamicTwitter({
			title: `${itemData.name} · StalHub`,
			description: itemData.description,
			images: [`https://cdn.stalhub.dev/db${itemData.icon}`],
		}),
	}
}
export default async function ItemsPage({ params }: PageProps) {
	const { slug } = await params

	const path = Array.isArray(slug) ? slug : []

	const id = slug[slug.length - 1]

	const githubUrl = `${path.join('/')}.json`

	const queryClient = getQueryClient()

	await Promise.allSettled([
		queryClient.fetchQuery(itemQueries.byGithubUrl(githubUrl)),
		queryClient.fetchQuery(itemQueries.barter(id)),
		queryClient.fetchInfiniteQuery(auctionQueries.lotsInfinite({ id })),

		queryClient.fetchInfiniteQuery(auctionQueries.historyInfinite({ id })),
	])

	const item = queryClient.getQueryData<Item>(
		itemQueries.byGithubUrl(githubUrl).queryKey
	)

	if (!item) {
		notFound()
	}

	if (item.category.startsWith('weapon/')) {
		await Promise.allSettled([
			queryClient.fetchQuery(itemQueries.attachments(id)),
		])
	}

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<JsonLd
				data={breadcrumbJsonLd(
					SITE_META.SITE_URL,
					path.map((segment, index) => ({
						name: segment,
						path: `/items/${path.slice(0, index + 1).join('/')}`,
					}))
				)}
			/>
			<ItemsView githubUrl={githubUrl} id={id} path={path} />
		</HydrationBoundary>
	)
}
