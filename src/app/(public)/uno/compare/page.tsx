import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getQueryClient } from '@/providers/QueryProvider'
import { unoQueries } from '@/queries/uno/uno.queries'
import UnoCompareView from '@/views/uno/UnoCompareView'

type SearchParams = Promise<Record<string, string | string[] | undefined>>

const firstParam = (value: string | string[] | undefined): string =>
	Array.isArray(value) ? (value[0] ?? '') : (value ?? '')

export default async function UnoComparePage({
	searchParams,
}: {
	searchParams: SearchParams
}) {
	const query = await searchParams
	const left = firstParam(query.left ?? query.clanA)
	const right = firstParam(query.right ?? query.clanB)
	const queryClient = getQueryClient()
	if (left && right) {
		await queryClient.prefetchQuery(
			unoQueries.vs({ leftClanId: left, rightClanId: right })
		)
	}

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<UnoCompareView leftClanId={left} rightClanId={right} />
		</HydrationBoundary>
	)
}
