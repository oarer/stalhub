import type { LotsResponse } from '@/types/item.type'

export type ArtifactAdditional = {
    ndmg?: number
    qlt?: number
    it_transf_count?: number
    upgrade_bonus?: number
    spawn_time?: number
    ptn?: number
    bonus_properties?: string[]
    stats_random?: number
    md_k?: string | number
}

export const qualityPercentRanges: Record<
    number,
    { min: number; max: number }
> = {
    0: { min: 85, max: 100 },
    1: { min: 100, max: 115 },
    2: { min: 115, max: 130 },
    3: { min: 130, max: 145 },
    4: { min: 145, max: 160 },
    5: { min: 160, max: 175 },
    6: { min: 175, max: 190 },
}

export const calcArtifactPercent = (additional: ArtifactAdditional): number => {
    if (additional.qlt === undefined) return 0

    const { ndmg, qlt } = additional
    const range = qualityPercentRanges[qlt] ?? { min: 0, max: 100 }
    const diff = range.max - range.min

    const normalized = ((ndmg || 0) + 2) / 4
    return range.min + diff * normalized
}

export const getQualityName = (qlt?: number): string => {
    switch (qlt) {
        case 0:
            return 'Обычный'
        case 1:
            return 'Необычный'
        case 2:
            return 'Особый'
        case 3:
            return 'Редкий'
        case 4:
            return 'Исключительный'
        case 5:
            return 'Легендарный'
        case 6:
            return 'Уникальный'
        default:
            return 'Неизвестно'
    }
}

export const getArtifactColor = (qlt: number): string => {
    switch (qlt) {
        case 0:
            return '#fff'
        case 1:
            return '#22c55e'
        case 2:
            return '#3b82f6'
        case 3:
            return '#a855f7'
        case 4:
            return '#eab308'
        case 5:
            return '#f97316'
        case 6:
            return '#ef4444'
        default:
            return '#fff'
    }
}

export const getArtifactColorWithAlpha = (qlt: number, alpha = 0.3): string => {
    const color = getArtifactColor(qlt).replace('#', '')
    const r = parseInt(color.substring(0, 2), 16)
    const g = parseInt(color.substring(2, 4), 16)
    const b = parseInt(color.substring(4, 6), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export const sortArtifactsByPercent = <
    T extends { additional: ArtifactAdditional },
>(
    lots: T[]
): T[] => {
    return [...lots].sort(
        (a, b) =>
            calcArtifactPercent(b.additional) -
            calcArtifactPercent(a.additional)
    )
}

export const normalizeLotsData = (data: LotsResponse) => {
    const sorted = [...data.lots].sort(
        (a, b) => new Date(a.endTime).getTime() - new Date(b.endTime).getTime()
    )

    return sorted.map((lot) => ({
        name: new Date(lot.endTime).toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
        }),
        startPrice: lot.startPrice,
        currentPrice: lot.currentPrice,
        buyoutPrice: lot.buyoutPrice,
    }))
}
