'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { getSafeHref } from '@/lib/safe-href'
import type { PlayerMusic } from '@/types/player.type'

function musicModel(music: PlayerMusic | string | null | undefined) {
	if (!music) return null
	if (typeof music === 'string')
		return { url: music, title: null, artist: null, cover: null }
	return music
}

type MusicSource =
	| { kind: 'audio'; url: string }
	| { kind: 'embed'; url: string; embedUrl: string }
	| { kind: 'link'; url: string }

type ScWidget = {
	bind: (event: string, listener: () => void) => void
	pause: () => void
	play: () => void
	toggle: () => void
}
type ScWidgetGlobal = {
	Widget: (frame: HTMLIFrameElement) => ScWidget
	Events: Record<'FINISH' | 'PAUSE' | 'PLAY', string>
}

function musicSource(url: string): MusicSource {
	try {
		const parsed = new URL(url)
		const host = parsed.hostname.toLowerCase()

		if (host === 'youtu.be' || host.endsWith('youtube.com')) {
			const videoId =
				host === 'youtu.be'
					? parsed.pathname.slice(1).split('/')[0]
					: (parsed.searchParams.get('v') ??
						parsed.pathname.match(
							/\/(?:embed|shorts)\/([^/]+)/
						)?.[1])
			if (videoId) {
				return {
					kind: 'embed',
					url,
					embedUrl: `https://www.youtube.com/embed/${encodeURIComponent(videoId)}?rel=0`,
				}
			}
		}

		if (host === 'open.spotify.com') {
			const path = parsed.pathname.replace(/^\/+/, '')
			if (/^(track|album|playlist|episode)\/[\w-]+/.test(path)) {
				return {
					kind: 'embed',
					url,
					embedUrl: `https://open.spotify.com/embed/${path}?utm_source=generator`,
				}
			}
		}

		if (host === 'soundcloud.com' || host === 'www.soundcloud.com') {
			return {
				kind: 'embed',
				url,
				embedUrl: `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23f59e0b&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false`,
			}
		}

		if (
			/\.(?:mp3|wav|ogg|m4a|aac|flac)(?:[?#]|$)/i.test(
				parsed.pathname + parsed.search
			)
		) {
			return { kind: 'audio', url }
		}
	} catch {
		return { kind: 'link', url }
	}

	return { kind: 'link', url }
}

export function ProfileStrings({ strings }: { strings?: string[] }) {
	const visible = strings?.filter(Boolean) ?? []
	if (visible.length === 0) return null

	return (
		<div className="flex flex-wrap items-center gap-1.5">
			{visible.map((value) => {
				const href = getSafeHref(value)
				const label = href
					? value.replace(/^https?:\/\//, '').replace(/\/$/, '')
					: value
				const content = (
					<Badge
						className="max-w-full truncate font-mono text-[10px]"
						key={value}
						variant="secondary"
					>
						{label}
					</Badge>
				)

				return href ? (
					<a
						className="max-w-full transition-opacity hover:opacity-75"
						href={href}
						key={value}
						rel="noreferrer"
						target="_blank"
					>
						{content}
					</a>
				) : (
					<span key={value}>{content}</span>
				)
			})}
		</div>
	)
}

export default function ProfileMusic({
	music,
}: {
	music?: PlayerMusic | string | null
}) {
	const t = useTranslations()
	const audioRef = useRef<HTMLAudioElement>(null)
	const scFrameRef = useRef<HTMLIFrameElement>(null)
	const [isPlaying, setIsPlaying] = useState(false)
	const [isScReady, setIsScReady] = useState(false)

	const model = musicModel(music)
	const source = model?.url ? musicSource(model.url) : null
	const isAudio = source?.kind === 'audio'
	const isSc =
		source?.kind === 'embed' && source.embedUrl.includes('soundcloud')
	const getScWidget = useCallback((): ScWidget | null => {
		const sc = (window as typeof window & { SC?: ScWidgetGlobal }).SC
		if (!sc || !scFrameRef.current) return null
		return sc.Widget(scFrameRef.current)
	}, [])

	useEffect(() => {
		if (!isSc || !isPlaying || isScReady) return
		let cancelled = false
		let timer: ReturnType<typeof setTimeout> | null = null
		let attempts = 0

		const tryBind = () => {
			if (cancelled) return
			attempts += 1
			const widget = getScWidget()
			if (widget) {
				const sc = (window as typeof window & { SC?: ScWidgetGlobal })
					.SC
				if (sc) {
					widget.bind(sc.Events.PLAY, () => setIsPlaying(true))
					widget.bind(sc.Events.PAUSE, () => setIsPlaying(false))
					widget.bind(sc.Events.FINISH, () => setIsPlaying(false))
				}
				widget.play()
			} else if (attempts < 20) {
				timer = setTimeout(tryBind, 250)
			}
		}

		const scWindow = window as typeof window & { SC?: ScWidgetGlobal }
		if (!scWindow.SC) {
			const script = document.createElement('script')
			script.src = 'https://w.soundcloud.com/player/api.js'
			script.async = true
			script.onload = tryBind
			document.head.appendChild(script)
		} else {
			tryBind()
		}

		return () => {
			cancelled = true
			if (timer) clearTimeout(timer)
		}
	}, [isSc, isPlaying, isScReady, getScWidget])

	if (!model?.url || !source) return null

	const openSource = () => {
		window.open(model.url, '_blank', 'noopener,noreferrer')
	}

	const togglePlayback = async () => {
		if (isSc) {
			if (!isPlaying) {
				setIsScReady(true)
				setIsPlaying(true)
				return
			}
			const widget = getScWidget()
			if (widget) {
				widget.pause()
			}
			setIsPlaying(false)
			return
		}
		const audio = audioRef.current
		if (!audio) return

		if (audio.paused) {
			await audio.play()
			setIsPlaying(true)
		} else {
			audio.pause()
			setIsPlaying(false)
		}
	}

	return (
		<div className="flex items-stretch gap-4 py-1 sm:gap-4">
			<div className="flex min-w-0 flex-1 items-stretch gap-4">
				<button
					aria-label={
						isAudio && isPlaying
							? t('player.music.pause')
							: t('player.music.play')
					}
					className="group relative size-24 shrink-0 overflow-hidden rounded-lg border border-primary/50 bg-[#101217] shadow-[0_8px_18px_rgba(0,0,0,.3)] outline-none transition-transform hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-primary sm:size-28"
					onClick={togglePlayback}
					type="button"
				>
					{model.cover ? (
						<div
							aria-hidden="true"
							className="absolute inset-0 bg-center bg-cover"
							style={{ backgroundImage: `url(${model.cover})` }}
						/>
					) : (
						<div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_35%_25%,#35506b,#11151f_55%,#08090c)]">
							<Icon
								className="text-4xl text-primary/70"
								icon="lucide:disc-3"
							/>
						</div>
					)}
					<span className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/35" />
					<span className="absolute inset-0 flex items-center justify-center">
						{isPlaying ? (
							<span className="flex h-5 items-end gap-0.75 rounded-full bg-black/65 px-2 py-1 shadow-lg backdrop-blur-sm">
								<span className="music-eq-bar w-0.75 rounded-sm bg-white [animation-delay:0ms]" />
								<span className="music-eq-bar w-0.75 rounded-sm bg-white [animation-delay:150ms]" />
								<span className="music-eq-bar w-0.75 rounded-sm bg-white [animation-delay:300ms]" />
								<span className="music-eq-bar w-0.75 rounded-sm bg-white [animation-delay:450ms]" />
							</span>
						) : (
							<span className="flex size-9 items-center justify-center rounded-full bg-black/65 text-white shadow-lg backdrop-blur-sm">
								<Icon className="size-4" icon="lucide:play" />
							</span>
						)}
					</span>
				</button>

				<div className="flex min-w-0 flex-1 flex-col justify-between gap-3 py-0.5">
					<div className="min-w-0">
						<p className="mt-1 truncate font-semibold text-sm sm:text-base">
							{model.title || t('player.music.untitled')}
						</p>
						{model.artist && (
							<p className="truncate text-muted-foreground text-xs sm:text-sm">
								{model.artist}
							</p>
						)}
					</div>
					<a
						className="flex w-fit items-center gap-1.5 rounded-md bg-primary px-2.5 py-1.5 font-semibold text-[11px] text-primary-foreground transition-opacity hover:opacity-85"
						href={model.url}
						rel="noreferrer"
						target="_blank"
					>
						<Icon
							className="size-3.5"
							icon="lucide:external-link"
						/>
						{t('player.music.open')}
					</a>
				</div>
			</div>
			{source.kind === 'audio' && (
				<audio
					onEnded={() => setIsPlaying(false)}
					onPause={() => setIsPlaying(false)}
					onPlay={() => setIsPlaying(true)}
					preload="none"
					ref={audioRef}
					src={source.url}
				/>
			)}
			{isSc && isPlaying && (
				<iframe
					allow="autoplay; clipboard-write"
					className="pointer-events-none absolute size-0 overflow-hidden opacity-0"
					loading="lazy"
					ref={scFrameRef}
					src={source.embedUrl.replace(
						'auto_play=false',
						'auto_play=true'
					)}
					title={model.title ?? model.url}
				/>
			)}
		</div>
	)
}
