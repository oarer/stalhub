import type { DownloadPlatform } from '@/types/download.type'

export function formatBytes(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`
	const kb = bytes / 1024
	if (kb < 1024) return `${kb.toFixed(1)} KB`
	const mb = kb / 1024
	if (mb < 1024) return `${mb.toFixed(1)} MB`
	return `${(mb / 1024).toFixed(1)} GB`
}

export function detectOs(): DownloadPlatform | null {
	if (typeof window === 'undefined') return null
	const ua = navigator.userAgent
	if (/Windows/i.test(ua)) return 'windows'
	if (/Macintosh|Mac OS X|iPhone|iPad/i.test(ua)) return 'mac'

	return 'linux-appimage'
}

export function isLinuxPlatform(platform: DownloadPlatform | null): boolean {
	return (
		platform === 'linux-deb' ||
		platform === 'linux-rpm' ||
		platform === 'linux-appimage'
	)
}