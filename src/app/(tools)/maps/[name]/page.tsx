import MapView from '@/views/maps/map/MapView'

export default async function MapPage({
	params,
}: {
	params: Promise<{ name: string }>
}) {
	const { name } = await params

	return <MapView mapName={name} />
}
