export function safeArtistReturn(value: string | null): string | null {
	return value && /^\/artists\/[a-zA-Z0-9_]{3,32}$/.test(value) ? value : null
}

export function persistArtistReturn() {
	const value = safeArtistReturn(
		new URLSearchParams(window.location.search).get('returnUrl')
	)
	if (value) sessionStorage.setItem('artist-return', value)
}

export function consumeArtistReturn(): string | null {
	const value = safeArtistReturn(sessionStorage.getItem('artist-return'))
	sessionStorage.removeItem('artist-return')
	return value
}
