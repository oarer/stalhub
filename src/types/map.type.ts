import type { Locale } from './item.type'

export type LocalizedString = Partial<Record<Locale, string>>

export type MarkerPoint = {
    id?: number
    coordinates: { lat: number; lng: number }
    description?: LocalizedString
    popup?: string
}

export type MarkerGroup = {
    id: number
    slug: string
    name: LocalizedString
    settings: {
        name?: string
        image?: string
        color?: string
        iconWidth?: number
        iconHeight?: number
    }
    markers: MarkerPoint[]
}

export type MarkerClusterFull = {
    id: number
    slug?: string
    name?: LocalizedString
    markers: MarkerGroup[]
}

export type MarkersFile = {
    markers_clusters?: MarkerClusterFull[]
    points?: MarkerPoint[]
    image?: { width?: number; height?: number; maxZoom?: number }
}

export type MapConfig = {
    name: string
    url: string
    title: LocalizedString
    preview_image: string
    image: { width: number; height: number; maxZoom: number }
    markers: string
}
