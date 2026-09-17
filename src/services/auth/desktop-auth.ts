import { apiClient } from '@/app/api/interceptors/root.interceptor'

const INTENT_KEY = 'stalhub.desktop.intent'
export type DesktopIntent = { desktop_state: string; code_challenge: string }

export function persistDesktopIntent(intent: DesktopIntent): void {
	sessionStorage.setItem(INTENT_KEY, JSON.stringify(intent))
}
export function getDesktopIntent(): DesktopIntent | null {
	const raw = sessionStorage.getItem(INTENT_KEY)
	if (!raw) return null
	try {
		const value = JSON.parse(raw) as DesktopIntent
		if (
			typeof value.desktop_state === 'string' &&
			typeof value.code_challenge === 'string'
		)
			return value
	} catch {
		/* ignore malformed intent */
	}
	return null
}
export function clearDesktopIntent(): void {
	sessionStorage.removeItem(INTENT_KEY)
}

export async function issueDesktopLoginUrl(): Promise<string> {
	const intent = getDesktopIntent()
	if (!intent) throw new Error('No desktop intent')
	const { data } = await apiClient.post<{ url: string }>(
		'/api/v1/auth/desktop/issue',
		intent
	)
	return data.url
}
