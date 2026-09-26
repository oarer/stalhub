import type { DownloadPlatform } from '@/types/download.type'

export const GITHUB_RELEASES = 'https://github.com/oarer/stalhub_app/releases'

export const PLATFORM_ICONS: Record<DownloadPlatform, string> = {
	windows: 'simple-icons:windows',
	mac: 'simple-icons:apple',
	'linux-deb': 'simple-icons:debian',
	'linux-rpm': 'simple-icons:fedora',
	'linux-appimage': 'simple-icons:appimage',
	android: 'simple-icons:android',
	other: 'lucide:file-archive',
}

export const LINUX_PREFERENCES: DownloadPlatform[] = [
	'linux-appimage',
	'linux-deb',
	'linux-rpm',
]