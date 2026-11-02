import { ArtistView } from '@/views/commissions/ArtistsView'

export default async function Page({
	params,
}: {
	params: Promise<{ username: string }>
}) {
	const { username } = await params
	return <ArtistView username={username} />
}
