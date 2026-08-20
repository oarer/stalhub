import ArtEditView from '@/views/me/arts/ArtEditView'

export default async function Page({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const { id } = await params

	return <ArtEditView artId={id} />
}
