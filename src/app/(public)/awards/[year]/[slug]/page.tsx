import AwardsView from '@/views/awards/AwardsView'

export default async function AwardsCategoryPage({
	params,
}: {
	params: Promise<{ year: string; slug: string }>
}) {
	const { slug } = await params
	return <AwardsView initialCategorySlug={slug} />
}
