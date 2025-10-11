import MapPage from '@/components/pages/map/MapPage'

export default function Page({ params }: { params: { name: string } }) {
    return <MapPage mapName={params.name} />
}
