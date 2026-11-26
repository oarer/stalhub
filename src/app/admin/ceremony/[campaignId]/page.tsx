import AwardsCeremonyAdminView from '@/views/admin/awards/AwardsCeremonyAdminView'

export default async function Page({
	params,
	searchParams,
}: {
	params: Promise<{ campaignId: string }>
	searchParams: Promise<{ category?: string }>
}) {
	const { campaignId } = await params
	const { category } = await searchParams

	return (
		<AwardsCeremonyAdminView
			campaignId={campaignId}
			categorySlug={category}
		/>
	)
}
