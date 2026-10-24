import { Suspense } from 'react'
import { breadcrumbJsonLd, JsonLd } from '@/components/seo/JsonLd'
import { SITE_META } from '@/constants/meta'
import PlayerComparisonView from '@/views/player/PlayerComparisonView'
import ComparisonLoading from './loading'

export default function Page() {
	return (
		<>
			<JsonLd
				data={breadcrumbJsonLd(SITE_META.SITE_URL, [
					{
						name: 'Players',
						path: '/player',
					},
					{
						name: 'Compare',
						path: '/player/compare',
					},
				])}
			/>
			<Suspense fallback={<ComparisonLoading />}>
				<PlayerComparisonView />
			</Suspense>
		</>
	)
}
