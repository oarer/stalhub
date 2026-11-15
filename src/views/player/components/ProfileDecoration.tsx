'use client'

import { useEffect, useState } from 'react'
import type { PlayerCustomization, PlayerSticker } from '@/types/player.type'

const STICKER_BASE_URL = 'https://static.stalhub.dev/sc/'
const CARD_ASPECT = 2120 / 320

export function resolveAssetUrl(url: string): string {
	if (url.startsWith('/') || /^https?:\/\//i.test(url)) return url
	return `${STICKER_BASE_URL}${url}`
}

function normalizeSticker(
	sticker: string | PlayerSticker
): PlayerSticker | null {
	const src = resolveAssetUrl(
		typeof sticker === 'string' ? sticker : sticker.src
	)
	return typeof sticker === 'string' ? { src } : { ...sticker, src }
}

function StickerElement({ sticker }: { sticker: PlayerSticker }) {
	const { flipbook } = sticker
	const [frame, setFrame] = useState(0)

	useEffect(() => {
		if (!flipbook || flipbook.frames <= 1) return
		const fps = flipbook.fps > 0 ? flipbook.fps : 10
		const id = setInterval(() => {
			setFrame((f) => (f + 1) % flipbook.frames)
		}, 1000 / fps)
		return () => clearInterval(id)
	}, [flipbook])

	const isFlipbook = !!flipbook && flipbook.frames > 1
	const columns = flipbook?.columns ?? 1
	const rows = flipbook?.rows ?? 1

	const frameWidth =
		sticker.image_width != null ? sticker.image_width / columns : null
	const frameHeight =
		sticker.image_height != null ? sticker.image_height / rows : null
	const stickerAspect =
		frameWidth != null && frameHeight != null && frameHeight > 0
			? frameWidth / frameHeight
			: 1

	const rawWidth = sticker.width ?? 0
	const absWidth = rawWidth === 0 ? 15 : Math.abs(rawWidth)
	const isMirrored = rawWidth < 0

	const widthCqi = (absWidth / CARD_ASPECT).toFixed(4)

	const sharedStyle: React.CSSProperties = {
		position: 'absolute',
		display: 'block',
		left: sticker.left != null ? `${sticker.left}%` : undefined,
		top: sticker.top != null ? `${sticker.top}%` : undefined,
		width: `${widthCqi}cqi`,
		aspectRatio: `${stickerAspect.toFixed(4)}`,
		transform: [
			'translate(-50%, -50%)',
			sticker.rotate ? `rotate(${sticker.rotate}deg)` : '',
			isMirrored ? 'scaleX(-1)' : '',
		]
			.filter(Boolean)
			.join(' '),
	}

	if (isFlipbook) {
		let actualFrame = frame
		if (flipbook.pingPong) {
			const cycleLen = flipbook.frames * 2 - 2
			const pos = frame % (cycleLen || 1)
			actualFrame = pos < flipbook.frames ? pos : cycleLen - pos
		}
		const col = actualFrame % columns
		const row = Math.floor(actualFrame / columns)
		const bgPosX = columns > 1 ? `${(col / (columns - 1)) * 100}%` : '0%'
		const bgPosY = rows > 1 ? `${(row / (rows - 1)) * 100}%` : '0%'

		const paddingBottom = `calc(${widthCqi}cqi / ${stickerAspect.toFixed(4)})`

		return (
			<div
				aria-hidden="true"
				style={{
					...sharedStyle,
					aspectRatio: undefined,
					height: 0,
					paddingBottom,
					backgroundImage: `url(${sticker.src})`,
					backgroundSize: `${columns * 100}% ${rows * 100}%`,
					backgroundRepeat: 'no-repeat',
					backgroundPosition: `${bgPosX} ${bgPosY}`,
				}}
			/>
		)
	}

	return (
		<img
			alt=""
			aria-hidden="true"
			draggable={false}
			src={sticker.src}
			style={sharedStyle}
		/>
	)
}

export function ProfileStickers({
	customization,
}: {
	customization?: PlayerCustomization | null
}) {
	const validStickers = (customization?.stickers || [])
		.map(normalizeSticker)
		.filter((s): s is PlayerSticker => s !== null)

	if (validStickers.length === 0) return null

	return (
		<div
			className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl"
			style={{ zIndex: 0, containerType: 'inline-size' }}
		>
			{validStickers.map((sticker, index) => (
				<StickerElement key={index} sticker={sticker} />
			))}
		</div>
	)
}

export default function ProfileDecoration({
	customization,
	children,
}: {
	customization?: PlayerCustomization | null
	children: React.ReactNode
}) {
	if (!customization) return <>{children}</>

	const { background, pattern, frame } = customization
	const backgroundUrl = background ? resolveAssetUrl(background) : null
	const patternUrl = pattern ? resolveAssetUrl(pattern) : null
	const frameUrl = frame ? resolveAssetUrl(frame) : null

	return (
		<div className="relative">
			{backgroundUrl && (
				<div
					className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg"
					style={{ zIndex: 0 }}
				>
					<img
						alt=""
						aria-hidden="true"
						className="h-full w-full object-cover"
						draggable={false}
						src={backgroundUrl}
					/>
				</div>
			)}

			{patternUrl && (
				<div
					className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg"
					style={{ zIndex: 1 }}
				>
					<img
						alt=""
						aria-hidden="true"
						className="h-full w-full object-cover opacity-30 mix-blend-overlay"
						draggable={false}
						src={patternUrl}
					/>
				</div>
			)}

			<div className="relative" style={{ zIndex: 2 }}>
				{children}
			</div>

			{frameUrl && (
				<div
					className="pointer-events-none absolute inset-0"
					style={{ zIndex: 3 }}
				>
					<img
						alt=""
						aria-hidden="true"
						className="h-full w-full object-contain"
						draggable={false}
						src={frameUrl}
					/>
				</div>
			)}
		</div>
	)
}
