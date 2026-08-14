'use client'

import cyrillicToTranslit from 'cyrillic-to-translit-js'

import Fuse from 'fuse.js'
import { useEffect, useMemo, useRef } from 'react'

import type { Locale } from '@/types/item.type'

const translit = cyrillicToTranslit({ preset: 'ru' })

export function normalizeText(s: string) {
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

export type PreparedEntry<T> = T & {
	searchName: string
	searchNameNorm: string
	searchNameTranslit: string
	searchNameFolded: string
	key: string
}

interface UseFuseSearchOptions<T> {
	getName: (entry: T) => string
	getKey?: (entry: T) => string
	locale?: Locale
	minLength?: number
	threshold?: number
	alwaysTranslit?: boolean
}

export function useFuseSearch<T>(
	entries: T[],
	query: string,
	opts: UseFuseSearchOptions<T>
) {
	const {
		getName,
		getKey,
		locale = 'ru',
		minLength = 2,
		threshold = 0.4,
		alwaysTranslit = false,
	} = opts
	const useTranslit = locale === 'ru' || alwaysTranslit

	const getNameRef = useRef(getName)
	const getKeyRef = useRef(getKey)

	useEffect(() => {
		getNameRef.current = getName
	}, [getName])

	useEffect(() => {
		getKeyRef.current = getKey
	}, [getKey])

	const preparedEntries = useMemo<PreparedEntry<T>[]>(() => {
		if (!entries || entries.length === 0) return []

		return entries.map((entry, index) => {
			const raw = getNameRef.current(entry) ?? ''

			const norm = normalizeText(raw)
			const translitName = useTranslit ? transliterateRuToLat(raw) : ''
			const folded = foldHomoglyphsToLatin(raw)

			return {
				...entry,
				searchName: raw,
				searchNameNorm: norm,
				searchNameTranslit: translitName,
				searchNameFolded: folded,
				key: getKeyRef.current?.(entry) ?? `${norm}-${index}`,
			}
		})
	}, [entries, useTranslit])

	const fuse = useMemo(() => {
		if (!preparedEntries || preparedEntries.length === 0) return null

		const keys: string[] = ['searchNameNorm', 'searchNameFolded']
		if (useTranslit) keys.unshift('searchNameTranslit')
		keys.push('searchName')

		return new Fuse(preparedEntries, {
			keys,
			threshold,
			ignoreLocation: true,
			findAllMatches: true,
			includeScore: true,
		})
	}, [preparedEntries, threshold, useTranslit])

	const filteredEntries = useMemo(() => {
		const q = query.trim()
		if (q.length < minLength || !fuse) return []

		const qNorm = normalizeText(q)
		const qTranslit = useTranslit
			? transliterateRuToLat(q).replace(/\s+/g, '')
			: ''
		const qFolded = foldHomoglyphsToLatin(q)

		const results: PreparedEntry<T>[] = []
		const addResults = (arr: PreparedEntry<T>[]) => {
			arr.forEach((item) => {
				if (!results.includes(item)) results.push(item)
			})
		}

		addResults(fuse.search(qNorm).map((r) => r.item))
		if (qTranslit) addResults(fuse.search(qTranslit).map((r) => r.item))
		addResults(fuse.search(qFolded).map((r) => r.item))

		return results
	}, [query, fuse, minLength, useTranslit])

	return { preparedEntries, filteredEntries }
}
