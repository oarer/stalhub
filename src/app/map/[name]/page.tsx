import MapPage from '@/components/pages/map/MapPage'

export default async function Page({
    params,
}: {
    params: Promise<{ name: string }>
}) {
    const { name } = await params

    return <MapPage mapName={name} />
}
