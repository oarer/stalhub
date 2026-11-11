'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { CopyButton } from '@/components/ui/CopyButton'
import { cn } from '@/lib/cn'

const MODES = {
	classic: '@%#*+=-:. ',
	dense: '█▓▒░ .',
	soft: ' .:-=+*#%@',
	lines: '─│╱╲',
} as const

type Mode = keyof typeof MODES

function renderLineArt(
	pixels: Uint8ClampedArray,
	width: number,
	height: number,
	invert: boolean
) {
	const gray = Array.from({ length: width * height }, (_, index) => {
		const offset = index * 4
		const value =
			(pixels[offset] * 0.299 +
				pixels[offset + 1] * 0.587 +
				pixels[offset + 2] * 0.114) /
			255
		return invert ? 1 - value : value
	})
	const lines: string[] = []

	for (let y = 0; y < height; y += 1) {
		let line = ''
		for (let x = 0; x < width; x += 1) {
			const current = gray[y * width + x]
			const right = gray[y * width + Math.min(x + 1, width - 1)]
			const down = gray[Math.min(y + 1, height - 1) * width + x]
			const horizontal = right - current
			const vertical = down - current
			const strength = Math.abs(horizontal) + Math.abs(vertical)

			if (strength < 0.14) line += ' '
			else if (Math.abs(horizontal) > Math.abs(vertical) * 1.35)
				line += '│'
			else if (Math.abs(vertical) > Math.abs(horizontal) * 1.35)
				line += '─'
			else line += horizontal * vertical >= 0 ? '╲' : '╱'
		}
		lines.push(line)
	}

	return lines.join('\n')
}

export default function AsciiConverter() {
	const t = useTranslations()
	const [imageUrl, setImageUrl] = useState<string | null>(null)
	const [output, setOutput] = useState('')
	const [mode, setMode] = useState<Mode>('classic')
	const [width, setWidth] = useState(64)
	const [invert, setInvert] = useState(false)

	useEffect(() => {
		if (!imageUrl) {
			setOutput('')
			return
		}

		let cancelled = false
		const image = new Image()
		image.onload = () => {
			if (cancelled) return
			const canvas = document.createElement('canvas')
			const height = Math.max(
				1,
				Math.round(((width * image.height) / image.width) * 0.48)
			)
			canvas.width = width
			canvas.height = height
			const context = canvas.getContext('2d', {
				willReadFrequently: true,
			})
			if (!context) return

			context.drawImage(image, 0, 0, width, height)
			const pixels = context.getImageData(0, 0, width, height).data
			if (mode === 'lines') {
				setOutput(renderLineArt(pixels, width, height, invert))
				return
			}

			const chars = MODES[mode]
			const lines: string[] = []

			for (let y = 0; y < height; y += 1) {
				let line = ''
				for (let x = 0; x < width; x += 1) {
					const offset = (y * width + x) * 4
					const brightness =
						(pixels[offset] * 0.299 +
							pixels[offset + 1] * 0.587 +
							pixels[offset + 2] * 0.114) /
						255
					const value = invert ? brightness : 1 - brightness
					const index = Math.min(
						chars.length - 1,
						Math.floor(value * chars.length)
					)
					line += chars[index]
				}
				lines.push(line)
			}

			setOutput(lines.join('\n'))
		}
		image.src = imageUrl

		return () => {
			cancelled = true
		}
	}, [imageUrl, invert, mode, width])

	const handleFile = (file: File | undefined) => {
		if (!file) return
		setImageUrl(URL.createObjectURL(file))
	}

	return (
		<Card.Root className="gap-4">
			<div className="flex flex-wrap items-start justify-between gap-3">
				<div>
					<Card.Title className="font-semibold text-lg">
						<Icon
							className="size-5 text-primary"
							icon="lucide:scan-line"
						/>
						{t('textFormatter.ascii.title')}
					</Card.Title>
					<Card.Description className="mt-1 text-xs">
						{t('textFormatter.ascii.description')}
					</Card.Description>
				</div>
				<label className="flex cursor-pointer items-center gap-2 rounded-lg border border-primary/40 px-3 py-2 font-semibold text-xs transition-colors hover:bg-primary/10">
					<Icon className="size-4" icon="lucide:upload" />
					{t('textFormatter.ascii.upload')}
					<input
						accept="image/*"
						className="sr-only"
						onChange={(event) =>
							handleFile(event.target.files?.[0])
						}
						type="file"
					/>
				</label>
			</div>

			<div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
				<div className="flex flex-col gap-3 rounded-xl bg-muted/35 p-3">
					<div>
						<p className="mb-1.5 font-semibold text-xs">
							{t('textFormatter.ascii.mode')}
						</p>
						<div className="grid grid-cols-2 gap-1 sm:grid-cols-4">
							{(Object.keys(MODES) as Mode[]).map((value) => (
								<Button
									className="px-1 font-mono text-xs"
									key={value}
									onClick={() => setMode(value)}
									size="sm"
									variant={
										mode === value ? 'primary' : 'outline'
									}
								>
									{t(`textFormatter.ascii.modes.${value}`)}
								</Button>
							))}
						</div>
					</div>
					<label className="flex flex-col gap-1 text-xs">
						<span className="flex justify-between font-semibold">
							{t('textFormatter.ascii.width')}{' '}
							<span className="font-mono text-primary">
								{width}
							</span>
						</span>
						<input
							max="96"
							min="24"
							onChange={(event) =>
								setWidth(Number(event.target.value))
							}
							step="4"
							type="range"
							value={width}
						/>
					</label>
					<label className="flex cursor-pointer items-center gap-2 text-xs">
						<input
							checked={invert}
							onChange={(event) =>
								setInvert(event.target.checked)
							}
							type="checkbox"
						/>
						{t('textFormatter.ascii.invert')}
					</label>
					{imageUrl && (
						<Button
							onClick={() => setImageUrl(null)}
							size="sm"
							variant="ghost"
						>
							<Icon className="size-4" icon="lucide:x" />
							{t('textFormatter.ascii.clear')}
						</Button>
					)}
				</div>

				<div className="min-h-56 overflow-auto rounded-xl border border-border bg-[#080b0b] p-4">
					{output ? (
						<pre
							className={cn(
								'font-mono text-[#b7ffcf] text-[7px] leading-[0.9] sm:text-[9px] sm:leading-[0.92]'
							)}
						>
							{output}
						</pre>
					) : (
						<div className="flex min-h-48 flex-col items-center justify-center gap-2 text-center text-muted-foreground">
							<Icon className="size-8" icon="lucide:image-plus" />
							<p className="text-xs">
								{t('textFormatter.ascii.empty')}
							</p>
						</div>
					)}
				</div>
			</div>

			{output && (
				<div className="flex items-center gap-2">
					<CopyButton
						className="p-4"
						size="md"
						text={output}
						variant="primary"
					/>
					<span className="font-mono text-muted-foreground text-xs">
						{output.length} {t('textFormatter.ascii.chars')}
					</span>
				</div>
			)}
		</Card.Root>
	)
}
