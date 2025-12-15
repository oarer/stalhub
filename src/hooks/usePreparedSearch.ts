'use client'

import { useMemo } from 'react'

import Fuse from 'fuse.js'
import cyrillicToTranslit from 'cyrillic-to-translit-js'

import { useSearchItem } from '@/hooks/useSearchItem'
import type { ItemListing } from '@/types/api.type'
import { LOCALE } from '@/types/item.type'

const translit = cyrillicToTranslit({ preset: 'ru' })

export type PreparedItem = ItemListing & {
    searchName: string
    searchNameNorm: string
    searchNameTranslit: string
    searchNameFolded: string
    key: string
}

function normalizeText(s: string) {
    if (!s) return ''
    return s
        .toLowerCase()
        .normalize('NFD')
        .replace(/[^^\p{L}\p{N}\s-]/gu, ' ')
        .replace(/\p{Diacritic}/gu, '')
        .replace(/\s+/g, ' ')
        .trim()
}

function transliterateRuToLat(s: string) {
    if (!s) return ''
    return translit.transform(normalizeText(s), '').trim()
}

function foldHomoglyphsToLatin(s: string) {
    if (!s) return ''
    const map: Record<string, string> = {
        а: 'a',
        в: 'v',
        е: 'e',
        ё: 'e',
        з: 'z',
        и: 'i',
        й: 'y',
        к: 'k',
        л: 'l',
        м: 'm',
        н: 'n',
        о: 'o',
        п: 'p',
        р: 'p',
        с: 'c',
        т: 't',
        у: 'y',
        х: 'x',
        б: 'b',
        д: 'd',
        г: 'g',
    }

    return normalizeText(s)
        .split('')
        .map((ch) => map[ch] ?? ch)
        .join('')
        .replace(/\s+/g, ' ')
        .trim()
}

export function usePreparedSearch(
    query: string,
    opts?: {
        locale?: string
        minLength?: number
        threshold?: number
    }
) {
    const MIN_LENGTH = opts?.minLength ?? 2

    const { items, loading, error } = useSearchItem()

    const preparedItems = useMemo<PreparedItem[]>(() => {
        if (!items || items.length === 0) return []
        return items.map((i: ItemListing) => {
            const raw = (i.name && i.name[LOCALE]) ?? ''
            const norm = normalizeText(raw)
            const translitName = transliterateRuToLat(raw)
            const folded = foldHomoglyphsToLatin(raw)

            return {
                ...i,
                searchName: raw,
                searchNameNorm: norm,
                searchNameTranslit: translitName,
                searchNameFolded: folded,
                key: `${i.data}-${norm}-${i.icon}`,
            }
        })
    }, [items])

    const fuse = useMemo(() => {
        if (!preparedItems || preparedItems.length === 0) return null
        return new Fuse(preparedItems, {
            keys: ['searchNameTranslit', 'searchNameFolded'],
            threshold: 0.2,
            ignoreLocation: true,
            findAllMatches: true,
            includeScore: true,
        })
    }, [preparedItems])

    const filteredItems = useMemo(() => {
        const q = query.trim()
        if (q.length < MIN_LENGTH || !fuse) return []

        const qNorm = normalizeText(q)
        const qTranslit = transliterateRuToLat(q).replace(/\s+/g, '')
        const qFolded = foldHomoglyphsToLatin(q)

        const resultsA = fuse.search<PreparedItem>(qNorm).map((r) => r.item)
        const resultsB = fuse.search<PreparedItem>(qTranslit).map((r) => r.item)
        const resultsC = fuse.search<PreparedItem>(qFolded).map((r) => r.item)

        const seen = new Set<string>()
        const merged: PreparedItem[] = []

        ;[...resultsA, ...resultsB, ...resultsC].forEach((it) => {
            const nameFromItem = (it.name && it.name[LOCALE]) ?? it.searchName
            const key =
                (it.data as string) ?? (nameFromItem as string) ?? it.searchName
            if (!seen.has(key)) {
                seen.add(key)
                merged.push(it)
            }
        })

        return merged
    }, [query, fuse, MIN_LENGTH])

    return { filteredItems, preparedItems, loading, error }
}
