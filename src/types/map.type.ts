import type { Locale } from './item.type'

export type MarkerPoint = {
    id?: number
    coordinates: { lat: number; lng: number }
    description?: Locale
    popup?: string
}

export type MarkerGroup = {
    id: number
    slug: string
    name: Locale
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
    name?: Locale
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
    title: Record<Locale, string>
    preview_image: string
    image: { width: number; height: number; maxZoom: number }
    markers: string
}
