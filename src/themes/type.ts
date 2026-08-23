export interface TweakcnTheme {
	name: string
	url?: string
	cssVars: {
		theme?: Record<string, string>
		light: Record<string, string>
		dark: Record<string, string>
	}
}

export interface ThemeStore {
	active: string | null
	themes: Record<string, TweakcnTheme>
}

export const STORAGE_KEY = 'themes'
export const THEME_CHANGE_EVENT = 'theme-change'

export const DEFAULT_STORE: ThemeStore = {
	active: null,
	themes: {},
}
