export type DownloadPlatform =
	| 'windows'
	| 'linux-appimage'
	| 'linux-deb'
	| 'linux-rpm'
	| 'mac'
	| 'other'

export interface DownloadAsset {
	name: string
	size: number
	downloadCount: number
	url: string
	platform: DownloadPlatform
}

export interface DownloadRelease {
	id: number
	name: string
	tag: string
	prerelease: boolean
	publishedAt: string
	htmlUrl: string
	body: string | null
	assets: DownloadAsset[]
}