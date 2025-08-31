'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'

interface Beam {
    id: number
    isVertical: boolean
    lineIndex: number
    start: number
    end: number
    duration: number
    length: number
}

interface GridBackgroundWithBeamsProps {
    rows?: number
    cols?: number
    cellSize?: number
    lineWidth?: number
    lineColor?: string
    beamColor?: string
    maxBeams?: number
    beamInterval?: number
    glowColor?: string
    glowIntensity?: number
}

function hexOrRgbToRgba(input: string, alpha = 1): string {
    const s = input.trim()
    if (s.startsWith('#')) {
        const hex = s.slice(1)
        let r = 0,
            g = 0,
            b = 0
        if (hex.length === 3) {
            r = parseInt(hex[0] + hex[0], 16)
            g = parseInt(hex[1] + hex[1], 16)
            b = parseInt(hex[2] + hex[2], 16)
        } else if (hex.length === 6) {
            r = parseInt(hex.slice(0, 2), 16)
            g = parseInt(hex.slice(2, 4), 16)
            b = parseInt(hex.slice(4, 6), 16)
        } else return s
        return `rgba(${r}, ${g}, ${b}, ${alpha})`
    }
    const rgbMatch = s.match(/rgba?\(\s*([^\)]+)\)/i)
    if (rgbMatch) {
        const parts = rgbMatch[1].split(',').map((p) => p.trim())
        const r = parts[0] ?? '0'
        const g = parts[1] ?? '0'
        const b = parts[2] ?? '0'
        const existingA = parts[3] !== undefined ? parseFloat(parts[3]) : 1
        const finalA = Math.max(0, Math.min(1, existingA * alpha))
        return `rgba(${r}, ${g}, ${b}, ${finalA})`
    }
    return s
}

const BeamView = React.memo(function ({
    beam,
    cellSize,
    beamColor,
    glowColor,
    glowIntensity,
    lineWidth,
    onDone,
}: {
    beam: Beam
    cellSize: number
    beamColor: string
    glowColor: string
    glowIntensity: number
    lineWidth: number
    onDone: (id: number) => void
}) {
    const finalPos = beam.end - beam.length
    const blur = Math.max(6, Math.round(beam.length * 0.6 * glowIntensity))
    const spread = Math.round(beam.length * 0.12 * glowIntensity)
    const primaryGlow = hexOrRgbToRgba(
        glowColor,
        Math.min(1, 0.9 * glowIntensity)
    )
    const secondaryGlow = hexOrRgbToRgba(
        glowColor,
        Math.min(1, 0.5 * glowIntensity)
    )
    const boxShadow = `0 0 ${blur}px ${spread}px ${primaryGlow}, 0 0 ${Math.round(
        blur * 1.5
    )}px ${Math.round(spread * 0.7)}px ${secondaryGlow}`

    if (beam.isVertical) {
        return (
            <motion.div
                animate={{ translateY: finalPos, opacity: [0, 1, 0] }}
                exit={{ opacity: 0 }}
                initial={{ translateY: beam.start, opacity: 0 }}
                key={beam.id}
                onAnimationComplete={() => onDone(beam.id)}
                style={{
                    position: 'absolute',
                    left: beam.lineIndex * cellSize,
                    width: Math.max(2, lineWidth),
                    height: beam.length,
                    background: 'var(--beam-color)',
                    boxShadow,
                    borderRadius: 1,
                    willChange: 'transform, opacity',
                    pointerEvents: 'none',
                }}
                transition={{ duration: beam.duration / 1000, ease: 'linear' }}
            />
        )
    } else {
        return (
            <motion.div
                animate={{ translateX: finalPos, opacity: [0, 1, 0] }}
                exit={{ opacity: 0 }}
                initial={{ translateX: beam.start, opacity: 0 }}
                key={beam.id}
                onAnimationComplete={() => onDone(beam.id)}
                style={{
                    position: 'absolute',
                    top: beam.lineIndex * cellSize - 2,
                    height: Math.max(2, lineWidth),
                    width: beam.length,
                    background: beamColor,
                    boxShadow,
                    borderRadius: 1,
                    willChange: 'transform, opacity',
                    pointerEvents: 'none',
                }}
                transition={{ duration: beam.duration / 1000, ease: 'linear' }}
            />
        )
    }
})

BeamView.displayName = 'BeamView'

export function GridBackgroundWithBeams({
    rows = 10,
    cols = 10,
    cellSize = 40,
    lineWidth = 2,
    beamColor = '#38bdf8',
    maxBeams = 3,
    beamInterval = 500,
    glowColor = 'rgba(56,189,248,0.3)',
    glowIntensity = 1,
}: GridBackgroundWithBeamsProps) {
    const [beams, setBeams] = useState<Beam[]>([])
    const idRef = useRef(1)
    const intervalRef = useRef<number | null>(null)

    const totalVerticalSpan = useMemo(() => rows * cellSize, [rows, cellSize])
    const totalHorizontalSpan = useMemo(() => cols * cellSize, [cols, cellSize])

    const prefersReducedMotion =
        typeof window !== 'undefined' && window.matchMedia
            ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
            : false

    const addOneBeam = useCallback(() => {
        setBeams((prev) => {
            if (prev.length >= maxBeams) return prev
            const isVertical = Math.random() > 0.5
            const lineIndex = isVertical
                ? Math.floor(Math.random() * cols)
                : Math.floor(Math.random() * rows)
            const totalSpan = isVertical
                ? totalVerticalSpan
                : totalHorizontalSpan
            const maxLen = Math.min(totalSpan * 0.6, cellSize * 1.5)
            const length = 6 + Math.random() * Math.max(0, maxLen - 6)
            const start = -length
            const end = length + Math.random() * Math.max(0, totalSpan - length)
            const duration = 1000 + Math.random() * 1000
            const id = idRef.current++
            return [
                ...prev,
                { id, isVertical, lineIndex, start, end, duration, length },
            ]
        })
    }, [cols, rows, cellSize, maxBeams, totalVerticalSpan, totalHorizontalSpan])

    useEffect(() => {
        if (prefersReducedMotion) return
        function spawnIfVisible() {
            if (typeof document !== 'undefined' && document.hidden) return
            addOneBeam()
        }
        intervalRef.current = window.setInterval(spawnIfVisible, beamInterval)
        return () => {
            if (intervalRef.current !== null) clearInterval(intervalRef.current)
            intervalRef.current = null
        }
    }, [addOneBeam, beamInterval, prefersReducedMotion])

    const handleDone = useCallback((id: number) => {
        setBeams((prev) => prev.filter((b) => b.id !== id))
    }, [])

    const gridStyle = useMemo<React.CSSProperties>(() => {
        const vertical = `repeating-linear-gradient(90deg, var(--grid-line) 0 ${lineWidth}px, transparent ${lineWidth}px ${cellSize}px)`
        const horizontal = `repeating-linear-gradient(0deg, var(--grid-line) 0 ${lineWidth}px, transparent ${lineWidth}px ${cellSize}px)`
        return {
            position: 'absolute',
            inset: 0,
            backgroundImage: `${vertical}, ${horizontal}`,
            backgroundSize: `${cellSize}px ${cellSize}px, ${cellSize}px ${cellSize}px`,
            pointerEvents: 'none',
        }
    }, [lineWidth, cellSize])

    return (
        <div className="pointer-events-none fixed inset-0 z-[-1] overflow-hidden">
            <div style={gridStyle} />
            <AnimatePresence>
                {beams.map((b) => (
                    <BeamView
                        beam={b}
                        beamColor={beamColor}
                        cellSize={cellSize}
                        glowColor={glowColor}
                        glowIntensity={glowIntensity}
                        key={b.id}
                        lineWidth={lineWidth}
                        onDone={handleDone}
                    />
                ))}
            </AnimatePresence>
        </div>
    )
}
