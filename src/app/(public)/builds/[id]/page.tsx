import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { dynamicAlternates, dynamicTwitter } from '@/lib/seo'
import { getQueryClient } from '@/providers/QueryProvider'
import { buildApiQueries } from '@/queries/build-api/build-api.queries'
import { buildApiService } from '@/services/build-api/build-api.service'
import BuildDetailView from '@/views/builds/BuildDetailView'

export async function generateMetadata({
	params,
}: {
	params: Promise<{ id: string }>
}): Promise<Metadata> {
	const { id } = await params
	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://stalhub.dev'
	try {
		const build = await buildApiService.get(id)
		const description = `★ ${build.stars_count} · 💬 ${build.comments_count ?? 0} · от @${build.author.username}`
		const title = `${build.title} · StalHub`
		const image = `${baseUrl}/api/og/build/${id}`
		return {
			title,
			description,
			alternates: dynamicAlternates(`/builds/${id}`),
			openGraph: {
				title,
				description,
				url: `${baseUrl}/builds/${id}`,
				type: 'article',
				images: [{ url: image, width: 1200, height: 630 }],
			},
			twitter: dynamicTwitter({ title, description, images: [image] }),
		}
	} catch {
		return {
			title: 'Сборка не найдена · StalHub',
			robots: { index: false, follow: true },
		}
	}
}

export default async function BuildDetailPage({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const { id } = await params
	const queryClient = getQueryClient()
	try {
		await queryClient.fetchQuery(buildApiQueries.get(id))
	} catch {
		notFound()
	}
	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<BuildDetailView id={id} />
		</HydrationBoundary>
	)
}
