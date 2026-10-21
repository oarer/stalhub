import { Suspense } from 'react'
import { breadcrumbJsonLd, JsonLd } from '@/components/seo/JsonLd'
import { SITE_META } from '@/constants/meta'
import ItemComparisonView from '@/views/items/ItemComparisonView'
import ComparisonLoading from './loading'

export default function Page() {
	return (
		<>
			<JsonLd
				data={breadcrumbJsonLd(SITE_META.SITE_URL, [
					{
						name: 'Items',
						path: '/items/compare',
					},
				])}
			/>
			<Suspense fallback={<ComparisonLoading />}>
				<ItemComparisonView />
			</Suspense>
		</>
	)
}
