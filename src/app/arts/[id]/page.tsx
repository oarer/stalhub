import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { getQueryClient } from '@/providers/QueryProvider'
import { artQueries } from '@/queries/art/art.queries'
import { artService } from '@/services/art/art.service'
import ArtView from '@/views/arts/ArtView'

type PageProps = {
	params: Promise<{ id: string }>
}

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const { id } = await params
	const t = await getTranslations()

	try {
		const art = await artService.get(id)
		const images = art.image_url
			? [
					{
						url: `https://api.stalhub.dev${art.image_url}`,
						width: 1200,
						height: 630,
					},
				]
			: []

		const description = t('arts.byAuthor', {
			author: art.author.username,
		})

		return {
			title: `${art.title} · StalHub`,
			description,
			openGraph: {
				title: `${art.title} · StalHub`,
				description,
				type: 'article',
				publishedTime: art.created_at,
				modifiedTime: art.updated_at,
				authors: [art.author.username],
				tags: art.tags,
				images,
			},
		}
	} catch {
		return {
			title: `${t('arts.notFound')} · StalHub`,
			robots: { index: false, follow: true },
		}
	}
}

export default async function ArtPage({ params }: PageProps) {
	const { id } = await params

	const queryClient = getQueryClient()

	try {
		await queryClient.query(artQueries.get(id))
	} catch {
		notFound()
	}

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<ArtView artId={id} />
		</HydrationBoundary>
	)
}
