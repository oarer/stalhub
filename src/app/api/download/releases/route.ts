import axios from 'axios'
import { NextResponse } from 'next/server'
import type {
	DownloadAsset,
	DownloadPlatform,
	DownloadRelease,
} from '@/types/download.type'

export const revalidate = 3600

interface GitHubAsset {
	name: string
	size: number
	download_count: number
	browser_download_url: string
}

interface GitHubRelease {
	id: number
	name: string
	tag_name: string
	prerelease: boolean
	published_at: string
	html_url: string
	body: string | null
	assets: GitHubAsset[]
}

const SKIP_PATTERN = /\.(yml|yaml|blockmap|sha256|sha512|sig|json)$/i

function detectPlatform(name: string): DownloadPlatform {
	const lower = name.toLowerCase()
	if (/\.exe$/i.test(lower)) return 'windows'
	if (/\.appimage$/i.test(lower)) return 'linux-appimage'
	if (/\.deb$/i.test(lower)) return 'linux-deb'
	if (/\.rpm$/i.test(lower)) return 'linux-rpm'
	if (/\.(dmg|pkg)$/i.test(lower)) return 'mac'
	return 'other'
}

export async function GET() {
	try {
		const { data } = await axios.get<GitHubRelease[]>(
			'https://api.github.com/repos/oarer/stalhub_app/releases?per_page=20',
			{
				headers: {
					Accept: 'application/vnd.github+json',
					'User-Agent': 'StalHub-Web',
				},
			}
		)

		const releases: DownloadRelease[] = data.map((release) => ({
			id: release.id,
			name: release.name || release.tag_name,
			tag: release.tag_name,
			prerelease: release.prerelease,
			publishedAt: release.published_at,
			htmlUrl: release.html_url,
			body: release.body,
			assets: release.assets
				.filter((asset) => !SKIP_PATTERN.test(asset.name))
				.map((asset): DownloadAsset => ({
					name: asset.name,
					size: asset.size,
					downloadCount: asset.download_count,
					url: asset.browser_download_url,
					platform: detectPlatform(asset.name),
				})),
		}))

		return NextResponse.json(releases)
	} catch (err) {
		const error = err as { response?: { status?: number; data?: { message?: string } }; message?: string }
		const status = error.response?.status ?? 500
		const message =
			error.response?.data?.message ?? error.message ?? 'Unknown error'
		return NextResponse.json({ error: message }, { status })
	}
}