import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { notFound } from 'next/navigation'
import { getQueryClient } from '@/providers/QueryProvider'
import { personalQueries } from '@/queries/personal/personal.queries'
import { PublicPersonalView } from '@/views/personal/PublicPersonalView'

type PageProps = {
	params: Promise<{ username: string }>
}

export default async function PublicStatsPage({ params }: PageProps) {
	const { username } = await params
	const qc = getQueryClient()
	try {
		await qc.prefetchQuery(personalQueries.getPublic(decodeURIComponent(username)))
	} catch {
		notFound()
	}
	return (
		<HydrationBoundary state={dehydrate(qc)}>
			<PublicPersonalView username={decodeURIComponent(username)} />
		</HydrationBoundary>
	)
}
