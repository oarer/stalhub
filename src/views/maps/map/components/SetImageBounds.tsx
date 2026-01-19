'use client'

import L from 'leaflet'
import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

type Props = {
	imageWidth: number
	imageHeight: number
	fullMaxLevel: number
	fit?: boolean
}

export default function SetImageBounds({
	imageWidth,
	imageHeight,
	fullMaxLevel,
	fit = true,
}: Props) {
	const map = useMap()

	useEffect(() => {
		const topLeft = map.unproject([0, 0], fullMaxLevel)
		const bottomRight = map.unproject(
			[imageWidth, imageHeight],
			fullMaxLevel
		)
		const bounds = L.latLngBounds(topLeft, bottomRight)

		map.setMaxBounds(bounds)
		map.options.maxBoundsViscosity = 1.0

		if (fit) {
			map.fitBounds(bounds, { maxZoom: fullMaxLevel })
		}

		return () => {
			map.setMaxBounds(null as unknown as L.LatLngBounds)
		}
	}, [map, imageWidth, imageHeight, fullMaxLevel, fit])

	return null
}
