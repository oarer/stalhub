'use client'

import { useCallback, useEffect, useState } from 'react'
import {
	DEFAULT_STORE,
	STORAGE_KEY,
	THEME_CHANGE_EVENT,
	type ThemeStore,
	type TweakcnTheme,
} from '@/themes/type'

function readStore(): ThemeStore {
	if (typeof window === 'undefined') return DEFAULT_STORE
	try {
		const raw = localStorage.getItem(STORAGE_KEY)
		if (!raw) return DEFAULT_STORE
		const parsed = JSON.parse(raw)
		if (parsed && typeof parsed === 'object' && 'themes' in parsed) {
			return parsed as ThemeStore
		}
		return DEFAULT_STORE
	} catch {
		return DEFAULT_STORE
	}
}

function writeStore(store: ThemeStore) {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
	dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT))
}


function validateTheme(data: unknown): data is TweakcnTheme {
	if (!data || typeof data !== 'object') return false
	const obj = data as Record<string, unknown>
	if (!obj.cssVars || typeof obj.cssVars !== 'object') return false
	const cv = obj.cssVars as Record<string, unknown>
	if (!cv.light || typeof cv.light !== 'object') return false
	if (!cv.dark || typeof cv.dark !== 'object') return false
	return true
}

function extractNameFromUrl(url: string): string {
	try {
		const isTweakcn = u.hostname === 'tweakcn.com'
		const parts = u.pathname.split('/')
		const last = parts[parts.length - 1]
		return last.replace(/\.json$/, '') || 'custom'
	} catch {
		return 'custom'
	}
}

export function useCustomTheme() {
	const [store, setStore] = useState<ThemeStore>(DEFAULT_STORE)
	const [loaded, setLoaded] = useState(false)

	useEffect(() => {
		setStore(readStore())
		setLoaded(true)
	}, [])

	useEffect(() => {
		const handler = () => setStore(readStore())
		window.addEventListener(THEME_CHANGE_EVENT, handler)
		return () => window.removeEventListener(THEME_CHANGE_EVENT, handler)
	}, [])

	const addTheme = useCallback((theme: TweakcnTheme) => {
		const s = readStore()
		s.themes[theme.name] = theme
		writeStore(s)
		setStore({ ...s })
	}, [])

	const removeTheme = useCallback((name: string) => {
		const s = readStore()
		delete s.themes[name]
		if (s.active === name) s.active = null
		writeStore(s)
		setStore({ ...s })
	}, [])

	const setActiveTheme = useCallback((name: string | null) => {
		const s = readStore()
		s.active = name
		writeStore(s)
		setStore({ ...s })
	}, [])

	const fetchThemeFromUrl = useCallback(
		async (url: string): Promise<TweakcnTheme> => {
			const res = await fetch(url)
			if (!res.ok) throw new Error(`HTTP ${res.status}`)
			const data = await res.json()
			if (!validateTheme(data)) throw new Error('Invalid tweakcn theme format')
			const name = data.name || extractNameFromUrl(url)
			return { name, url, cssVars: data.cssVars }
		},
		[]
	)

	const parseThemeFromJson = useCallback(
		(json: string): TweakcnTheme => {
			const data = JSON.parse(json)
			if (!validateTheme(data)) throw new Error('Invalid tweakcn theme format')
			const name = data.name || 'custom'
			return { name, cssVars: data.cssVars }
		},
		[]
	)

	const getActiveTheme = useCallback((): TweakcnTheme | null => {
		if (!store.active) return null
		return store.themes[store.active] ?? null
	}, [store])

	return {
		store,
		loaded,
		activeTheme: getActiveTheme(),
		addTheme,
		removeTheme,
		setActiveTheme,
		fetchThemeFromUrl,
		parseThemeFromJson,
	}
}
