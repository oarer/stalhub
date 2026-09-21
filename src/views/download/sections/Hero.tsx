'use client'

import { Icon } from '@iconify/react'
import { AnimatePresence, motion } from 'motion/react'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useState } from 'react'
import { montserrat, unbounded } from '@/app/fonts'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import GradientText from '@/components/ui/GradientText'
import { CLink } from '@/components/ui/Link'
import {
	GITHUB_RELEASES,
	LINUX_PREFERENCES,
	PLATFORM_ICONS,
} from '@/constants/download.const'
import { buttonVariants } from '@/constants/ui/button.const'
import { cn } from '@/lib/cn'
import { detectOs, formatBytes, isLinuxPlatform } from '@/lib/download'
import type { DownloadAsset, DownloadRelease } from '@/types/download.type'

interface HeroProps {
	latest: DownloadRelease | null
	loading: boolean
	hasError: boolean
	onReload: () => void
}

export default function Hero({
	latest,
	loading,
	hasError,
	onReload,
}: HeroProps) {
	const t = useTranslations()
	const [linuxOpen, setLinuxOpen] = useState(false)

	useEffect(() => {
		if (isLinuxPlatform(detectOs())) {
			setLinuxOpen(true)
		}
	}, [])

	const windowsAsset = useMemo(
		() =>
			latest?.assets.find((asset) => asset.platform === 'windows') ??
			null,
		[latest]
	)

	const linuxAssets = useMemo(() => {
		if (!latest) return []
		return latest.assets
			.filter((asset) => isLinuxPlatform(asset.platform))
			.sort(
				(a, b) =>
					LINUX_PREFERENCES.indexOf(a.platform) -
					LINUX_PREFERENCES.indexOf(b.platform)
			)
	}, [latest])

	return (
		<section className="flex flex-col items-center gap-6 text-center">
			<motion.div
				animate={{ y: 0, opacity: 1 }}
				initial={{ y: 30, opacity: 0 }}
				transition={{ duration: 0.6, delay: 0.2 }}
			>
				<Badge variant="secondary">
					<Icon
						className={cn(
							'text-primary text-xl',
							loading && !latest && 'animate-spin'
						)}
						icon={
							loading && !latest
								? 'lucide:loader-circle'
								: 'lucide:download-cloud'
						}
					/>
					<span className="text-xs md:text-sm">
						{latest
							? t('download.app.latest', {
									version: latest.tag,
								})
							: t('download.app.loading')}
					</span>
				</Badge>
			</motion.div>

			<motion.h1
				animate={{ y: 0, opacity: 1 }}
				className={`${unbounded.className} font-bold text-3xl tracking-tight sm:text-4xl md:text-nowrap md:text-6xl lg:text-7xl`}
				initial={{ y: 30, opacity: 0 }}
				transition={{ duration: 0.6, delay: 0.35 }}
			>
				<GradientText
					className="py-0"
					colors={['var(--primary)', '#afc7d4']}
					yoyo={false}
				>
					{t('download.app.gradient')}
				</GradientText>
				<span className="dark:text-foreground">
					{t('download.app.version')}
				</span>
			</motion.h1>

			<motion.p
				animate={{ y: 0, opacity: 1 }}
				className="max-w-2xl px-4 text-center font-semibold text-sm leading-relaxed md:text-xl dark:text-white"
				initial={{ y: 30, opacity: 0 }}
				transition={{ duration: 0.6, delay: 0.5 }}
			>
				{t('download.app.tagline')}
			</motion.p>

			{hasError && !latest ? (
				<motion.div
					animate={{ y: 0, opacity: 1 }}
					initial={{ y: 30, opacity: 0 }}
					transition={{ duration: 0.6, delay: 0.6 }}
				>
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
				</motion.div>
			) : (
				<div className="flex w-full flex-col items-center gap-4 px-4">
					<AnimatePresence initial={false} mode="popLayout">
						{linuxOpen && linuxAssets.length > 0 ? (
							<motion.div
								animate={{ opacity: 1, x: 0 }}
								className="flex flex-wrap items-center justify-center gap-4"
								exit={{ opacity: 0, x: -24 }}
								initial={{ opacity: 0, x: -24 }}
								key="linux-options"
								transition={{ duration: 0.25 }}
							>
								<LinuxToggleButton
									onToggle={() => setLinuxOpen(false)}
									open
								/>
								{linuxAssets.map((asset) => (
									<LinuxOption
										asset={asset}
										key={asset.url}
									/>
								))}
							</motion.div>
						) : (
							<motion.div
								animate={{ opacity: 1, x: 0 }}
								className="flex flex-wrap items-center justify-center gap-4"
								exit={{ opacity: 0, x: 24 }}
								initial={{ opacity: 0, x: 24 }}
								key="os-buttons"
								transition={{ duration: 0.25 }}
							>
								{windowsAsset && (
									<WindowsButton asset={windowsAsset} />
								)}
								{linuxAssets.length > 0 && (
									<LinuxToggleButton
										onToggle={() => setLinuxOpen(true)}
										open={false}
									/>
								)}
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			)}

			<motion.div
				animate={{ y: 0, opacity: 1 }}
				initial={{ y: 30, opacity: 0 }}
				transition={{ duration: 0.6, delay: 0.9 }}
			>
				<CLink
					className="gap-2 rounded-xl"
					href={latest?.htmlUrl ?? GITHUB_RELEASES}
					variant="ghost"
				>
					<Icon icon="simple-icons:github" />
					{t('download.app.github')}
				</CLink>
			</motion.div>
		</section>
	)
}

function WindowsButton({ asset }: { asset: DownloadAsset }) {
	const t = useTranslations()

	return (
		<a
			className={cn(
				buttonVariants({ variant: 'primary', size: 'lg' }),
				'gap-3 rounded-xl'
			)}
			href={asset.url}
			rel="noopener noreferrer"
			target="_blank"
		>
			<Icon className="text-2xl" icon={PLATFORM_ICONS.windows} />
			<span className="flex flex-col items-start text-left">
				<span className="font-semibold text-lg">
					{t('download.app.platforms.windows')}
				</span>
				<span
					className={`${montserrat.className} font-medium text-xs opacity-80`}
				>
					{formatBytes(asset.size)}
				</span>
			</span>
			<Icon className="ml-1 text-xl" icon="lucide:download" />
		</a>
	)
}

function LinuxToggleButton({
	open,
	onToggle,
}: {
	open: boolean
	onToggle: () => void
}) {
	const t = useTranslations()

	return (
		<button
			aria-expanded={open}
			className={cn(
				buttonVariants({ variant: 'secondary', size: 'lg' }),
				'gap-3 rounded-xl'
			)}
			onClick={onToggle}
			type="button"
		>
			<Icon className="text-2xl" icon="simple-icons:linux" />
			<span className="flex flex-col items-start text-left">
				<span className="font-semibold text-lg">
					{t('download.app.platforms.linux')}
				</span>
				<span className="font-medium text-xs opacity-80">
					{open ? t('download.app.close') : t('download.app.select')}
				</span>
			</span>
			<Icon
				className="ml-1 text-xl transition-transform duration-300"
				icon={open ? 'lucide:chevron-up' : 'lucide:chevron-down'}
			/>
		</button>
	)
}

function LinuxOption({ asset }: { asset: DownloadAsset }) {
	const t = useTranslations()

	return (
		<a
			className={cn(
				buttonVariants({ variant: 'secondary', size: 'lg' }),
				'gap-3 rounded-xl'
			)}
			href={asset.url}
			rel="noopener noreferrer"
			target="_blank"
		>
			<Icon
				className="text-2xl text-primary"
				icon={PLATFORM_ICONS[asset.platform]}
			/>
			<span className="flex flex-col items-start text-left">
				<span className="font-semibold text-lg">
					{t(`download.app.platforms.${asset.platform}`)}
				</span>
				<span
					className={`${montserrat.className} font-medium text-xs opacity-80`}
				>
					{formatBytes(asset.size)}
				</span>
			</span>
			<Icon className="ml-1 text-xl" icon="lucide:download" />
		</a>
	)
}
