import type { MarkersFile } from '@/types/map.type'

export function serverMarkersToGeoJSON(
    markersFile: MarkersFile | null,
    imageWidth = 0,
    imageHeight = 0
) {
    const features: GeoJSON.Feature[] = []
    if (!markersFile?.markers_clusters)
        return { type: 'FeatureCollection', features }

    for (const cluster of markersFile.markers_clusters) {
        for (const group of cluster.markers) {
            for (const point of group.markers) {
                const coords = point.coordinates
                const isPixelCoord =
                    coords.lat >= 0 &&
                    coords.lng >= 0 &&
                    coords.lat <= imageHeight &&
                    coords.lng <= imageWidth

                const geometry: GeoJSON.Point = {
                    type: 'Point',
                    coordinates: [coords.lng, coords.lat],
                }

                features.push({
                    type: 'Feature',
                    properties: {
                        clusterId: cluster.id,
                        clusterName: cluster.name,
                        groupId: group.id,
                        groupSlug: group.slug,
                        groupName: group.name,
                        settings: group.settings,
                        description: point.description,
                        isPixelCoord,
                    },
                    geometry,
                })
            }
        }
    }

    return { type: 'FeatureCollection', features }
}
