import ItemsView from '@/views/items'

type PageProps = {
	params: Promise<{ slug: string[] }>
}

export default async function ItemsPage({ params }: PageProps) {
	const { slug } = await params

	const path = Array.isArray(slug) ? slug : []
	const id = slug[slug.length - 1]

	return <ItemsView id={id} path={path} />
}
