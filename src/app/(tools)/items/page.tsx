import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/Skeleton'
import ItemCatalogView from '@/views/items/ItemCatalogView'

export const metadata: Metadata = {
	title: 'Каталог предметов · StalHub',
	description:
		'Поиск по предметам StalZone и быстрый переход к подробной информации.',
}

function CatalogFallback() {
	return (
		<section className="mx-auto flex max-w-380 flex-col gap-6 px-4 pt-32 pb-12 md:px-8 xl:pt-36">
			<Skeleton className="h-9 w-48" />
			<Skeleton className="h-11 w-full max-w-sm" />
			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{Array.from({ length: 8 }, (_, index) => (
					<Skeleton className="h-20" key={index} />
				))}
			</div>
		</section>
	)
}

export default function ItemsCatalogPage() {
	return (
		<Suspense fallback={<CatalogFallback />}>
			<ItemCatalogView />
		</Suspense>
	)
}
