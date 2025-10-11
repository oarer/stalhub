'use client'

import { useEffect, useRef } from 'react'

import { useMap } from 'react-leaflet'

import L from 'leaflet'

type Props = {
    draw: (ctx: CanvasRenderingContext2D, map: L.Map) => void
}

export default function CanvasLayer({ draw }: Props) {
    const map = useMap()
    const canvasRef = useRef<HTMLCanvasElement | null>(null)

    useEffect(() => {
        const canvas = L.DomUtil.create(
            'canvas',
            'leaflet-canvas-layer'
        ) as HTMLCanvasElement
        canvas.style.pointerEvents = 'none'
        canvasRef.current = canvas
        map.getPanes().overlayPane.appendChild(canvas)

        const update = () => {
            if (!canvasRef.current) return
            const ctx = canvasRef.current.getContext('2d')
            if (!ctx) return

            const size = map.getSize()
            canvas.width = size.x
            canvas.height = size.y

            ctx.clearRect(0, 0, canvas.width, canvas.height)
            draw(ctx, map)
        }

        map.on('move resize zoom', update)
        update()

        return () => {
            try {
                map.getPanes().overlayPane.removeChild(canvas)
            } catch {}
            map.off('move resize zoom', update)
        }
    }, [map, draw])

    return null
}
