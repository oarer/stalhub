'use client'

import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useState,
} from 'react'

declare global {
	interface Window {
		Telegram?: {
			WebApp?: {
				initData: string
				platform?: string
				colorScheme?: 'light' | 'dark'
				expand?: () => void
				ready?: () => void
			}
		}
	}
}

type MiniAppState = {
	isTelegram: boolean
	platform: string | null
}

const MiniAppContext = createContext<MiniAppState>({
	isTelegram: false,
	platform: null,
})

export function useMiniApp(): MiniAppState {
	return useContext(MiniAppContext)
}

function detectTelegram(): MiniAppState {
	if (typeof window === 'undefined') {
		return { isTelegram: false, platform: null }
	}
	const tg = window.Telegram?.WebApp
	if (tg?.initData) {
		return { isTelegram: true, platform: tg.platform ?? null }
	}
	if (window.location.hash.includes('tgWebAppData=')) {
		return { isTelegram: true, platform: tg?.platform ?? null }
	}
	return { isTelegram: false, platform: null }
}

export default function MiniAppProvider({ children }: { children: ReactNode }) {
	const [state, setState] = useState<MiniAppState>({
		isTelegram: false,
		platform: null,
	})

	useEffect(() => {
		setState(detectTelegram())
	}, [])

	return (
		<MiniAppContext.Provider value={state}>
			{children}
		</MiniAppContext.Provider>
	)
}
