'use client'

import { useMemo } from 'react'

import Fuse from 'fuse.js'
import cyrillicToTranslit from 'cyrillic-to-translit-js'

import { useSearchItem } from '@/hooks/useSearchItem'
import type { ItemListing, ItemName } from '@/types/api.type'
import { LOCALE as DEFAULT_LOCALE } from '@/types/item.type'

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

interface UsePreparedSearchOptions {
    locale?: keyof ItemName
    minLength?: number
    threshold?: number
}

export function usePreparedSearch(
    query: string,
    opts?: UsePreparedSearchOptions
) {
    const MIN_LENGTH = opts?.minLength ?? 2
    const locale: keyof ItemName = opts?.locale ?? DEFAULT_LOCALE
    const threshold = opts?.threshold ?? 0.4

    const { items, loading, error } = useSearchItem()

    const preparedItems = useMemo<PreparedItem[]>(() => {
        if (!items || items.length === 0) return []

        return items.map((i: ItemListing) => {
            const raw = (i.name && i.name[locale]) ?? ''

            const norm = normalizeText(raw)
            const translitName =
                locale === 'ru' ? transliterateRuToLat(raw) : ''
            const folded = foldHomoglyphsToLatin(raw)

            return {
                ...i,
                searchName: raw,
                searchNameNorm: norm,
                searchNameTranslit: translitName,
                searchNameFolded: folded,
                key: `${i.data ?? ''}-${norm}-${i.icon ?? ''}`,
            }
        })
    }, [items, locale])

    const fuse = useMemo(() => {
        if (!preparedItems || preparedItems.length === 0) return null

        const keys: string[] = ['searchNameNorm', 'searchNameFolded']
        if (locale === 'ru') keys.unshift('searchNameTranslit')
        keys.push('searchName')

        return new Fuse(preparedItems, {
            keys,
            threshold,
            ignoreLocation: true,
            findAllMatches: true,
            includeScore: true,
        })
    }, [preparedItems, locale, threshold])

    const filteredItems = useMemo(() => {
        const q = query.trim()
        if (q.length < MIN_LENGTH || !fuse) return []

        const qNorm = normalizeText(q)
        const qTranslit =
            locale === 'ru' ? transliterateRuToLat(q).replace(/\s+/g, '') : ''
        const qFolded = foldHomoglyphsToLatin(q)

        const results: PreparedItem[] = []
        const addResults = (arr: PreparedItem[]) => {
            arr.forEach((item) => {
                if (!results.includes(item)) results.push(item)
            })
        }

        addResults(fuse.search<PreparedItem>(qNorm).map((r) => r.item))
        if (qTranslit)
            addResults(fuse.search<PreparedItem>(qTranslit).map((r) => r.item))
        addResults(fuse.search<PreparedItem>(qFolded).map((r) => r.item))

        return results
    }, [query, fuse, MIN_LENGTH, locale])

    return { filteredItems, preparedItems, loading, error }
}
