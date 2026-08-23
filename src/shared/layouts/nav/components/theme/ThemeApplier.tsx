'use client'

import { useTheme } from 'next-themes'
import { useEffect, useRef } from 'react'
import {
	STORAGE_KEY,
	THEME_CHANGE_EVENT,
	type ThemeStore,
	type TweakcnTheme,
} from '@/themes/type'

function readStore(): ThemeStore {
	if (typeof window === 'undefined') return { active: null, themes: {} }
	try {
		const raw = localStorage.getItem(STORAGE_KEY)
		if (!raw) return { active: null, themes: {} }
		const parsed = JSON.parse(raw)
		if (parsed && typeof parsed === 'object' && 'themes' in parsed) {
			return parsed as ThemeStore
		}
		return { active: null, themes: {} }
	} catch {
		return { active: null, themes: {} }
	}
}

const appliedKeys = new Set<string>()

function clearAppliedVars(root: HTMLElement) {
	for (const key of appliedKeys) {
		root.style.removeProperty(key)
	}
	appliedKeys.clear()
}

function applyVars(
	root: HTMLElement,
	vars: Record<string, string> | undefined,
	prefix = ''
) {
	if (!vars) return
	for (const [key, value] of Object.entries(vars)) {
		const prop = `--${prefix}${key}`
		root.style.setProperty(prop, value)
		appliedKeys.add(prop)
	}
}

function applyThemeToDom(theme: TweakcnTheme, mode: string | undefined) {
	const root = document.documentElement
	clearAppliedVars(root)
	applyVars(root, theme.cssVars.theme)
	const vars = mode === 'dark' ? theme.cssVars.dark : theme.cssVars.light
	applyVars(root, vars)
}

export default function ThemeApplier() {
	const { resolvedTheme } = useTheme()
	const currentThemeRef = useRef<string | null>(null)

	useEffect(() => {
		const store = readStore()
		if (!store.active || !store.themes[store.active]) {
			const root = document.documentElement
			clearAppliedVars(root)
			currentThemeRef.current = null
			return
		}
		const theme = store.themes[store.active]
		if (currentThemeRef.current !== store.active) {
			applyThemeToDom(theme, resolvedTheme)
			currentThemeRef.current = store.active
		} else {
			applyVars(document.documentElement, theme.cssVars.theme)
			const vars =
				resolvedTheme === 'dark'
					? theme.cssVars.dark
					: theme.cssVars.light
			applyVars(document.documentElement, vars)
		}
	}, [resolvedTheme])

	useEffect(() => {
		const handler = () => {
			const store = readStore()
			if (!store.active || !store.themes[store.active]) {
				clearAppliedVars(document.documentElement)
				currentThemeRef.current = null
				return
			}
			const theme = store.themes[store.active]
			currentThemeRef.current = store.active
			applyThemeToDom(theme, resolvedTheme)
		}
		window.addEventListener(THEME_CHANGE_EVENT, handler)
		return () => window.removeEventListener(THEME_CHANGE_EVENT, handler)
	}, [resolvedTheme])

	return null
}
