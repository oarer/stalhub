'use client'

import { Icon } from '@iconify/react'
import { useLocale, useTranslations } from 'next-intl'
import { useMemo } from 'react'
import { montserrat, unbounded } from '@/app/fonts'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PLATFORM_ICONS } from '@/constants/download.const'
import { formatBytes } from '@/lib/download'
import type { DownloadRelease } from '@/types/download.type'

interface ReleasesProps {
	releases: DownloadRelease[]
	loading: boolean
	hasError: boolean
	onReload: () => void
}

export default function Releases({
	releases,
	loading,
	hasError,
	onReload,
}: ReleasesProps) {
	const t = useTranslations()

	return (
		<section className="flex flex-col gap-4">
			<h2
				className={`${unbounded.className} font-semibold text-2xl tracking-tight`}
			>
				{t('download.app.all_releases')}
			</h2>

			{loading ? (
				<Card.Root className="gap-3">
					<p className="flex items-center gap-2 font-semibold text-text-accent">
						<Icon
							className="animate-spin text-primary"
							icon="lucide:loader-circle"
						/>
						{t('download.app.loading')}
					</p>
				</Card.Root>
			) : hasError ? (
				<Card.Root className="gap-3">
					<p className="flex items-center gap-2 font-semibold text-destructive">
						<Icon icon="lucide:triangle-alert" />
						{t('download.app.error')}
					</p>
					<Button
						className="gap-2"
						onClick={onReload}
						variant="secondary"
					>
						<Icon icon="lucide:refresh-cw" />
						{t('download.app.retry')}
					</Button>
				</Card.Root>
			) : (
				releases.map((release) => (
					<ReleaseCard key={release.id} release={release} />
				))
			)}
		</section>
	)
}

function ReleaseCard({ release }: { release: DownloadRelease }) {
	const t = useTranslations()
	const locale = useLocale()

	const formatter = useMemo(
		() =>
			new Intl.DateTimeFormat(locale, {
				dateStyle: 'medium',
			}),
		[locale]
	)
	const numberFormatter = useMemo(
		() => new Intl.NumberFormat(locale),
		[locale]
	)
	const totalDownloads = useMemo(
		() =>
			release.assets.reduce((sum, asset) => sum + asset.downloadCount, 0),
		[release.assets]
	)

	return (
		<Card.Root className="gap-4">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<div className="flex flex-wrap items-center gap-2">
					<Icon className="text-primary text-xl" icon="lucide:tag" />
					<h3 className="font-semibold text-lg">{release.name}</h3>
					{release.prerelease && (
						<Badge variant="secondary">
							<Icon
								className="text-primary"
								icon="lucide:flask-conical"
							/>
							{t('download.app.prerelease')}
						</Badge>
					)}
				</div>
				<span className="font-semibold text-muted-foreground text-sm">
					{t('download.app.published', {
						date: formatter.format(new Date(release.publishedAt)),
					})}
				</span>
			</div>

			<div className="flex items-center gap-1.5 font-semibold text-muted-foreground text-sm">
				<Icon icon="lucide:download" />
				{t('download.app.downloads', {
					count: numberFormatter.format(totalDownloads),
				})}
			</div>

			{release.assets.length > 0 ? (
				<div className="flex flex-col gap-2">
					<span className="font-semibold text-sm text-text-accent">
						{t('download.app.files')}
					</span>
					<div className="grid gap-2 sm:grid-cols-2">
						{release.assets.map((asset) => (
							<a
								className="flex items-center gap-3 rounded-lg bg-accent/40 px-3 py-2 transition-colors hover:bg-accent/70"
								href={asset.url}
								key={asset.url}
								rel="noopener noreferrer"
								target="_blank"
							>
								<Icon
									className="shrink-0 text-lg text-primary"
									icon={PLATFORM_ICONS[asset.platform]}
								/>
								<span className="min-w-0 flex-1">
									<span className="block truncate font-semibold text-sm">
										{asset.name}
									</span>
									<span className={`${montserrat.className} block font-semibold text-muted-foreground text-xs`}>
										{t(
											`download.app.platforms.${asset.platform}`
										)}
									</span>
								</span>
								<span
									className={`${montserrat.className} shrink-0 font-medium text-muted-foreground text-xs`}
								>
									{formatBytes(asset.size)}
								</span>
							</a>
						))}
					</div>
				</div>
			) : (
				<p className="font-semibold text-muted-foreground text-sm">
					{t('download.app.no_assets')}
				</p>
			)}
		</Card.Root>
	)
}
