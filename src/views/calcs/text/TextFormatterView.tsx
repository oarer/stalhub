'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { useMemo, useRef, useState } from 'react'
import { mtsExtended } from '@/app/fonts'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { CopyButton } from '@/components/ui/CopyButton'
import { Divider } from '@/components/ui/Divider'
import { Tabs } from '@/components/ui/Tabs'
import { Textarea } from '@/components/ui/Textarea'
import { Tooltip } from '@/components/ui/Tooltip'
import { StalcraftText } from '@/components/wiki/StalcraftText'
import {
	buildCompressedGradient,
	buildMultiGradient,
	countColorCodes,
	plainToRawRange,
	STALCRAFT_COLORS,
	stripStalcraftCodes,
} from '@/lib/stalcraft-text'

const BASE_CODES = [
	'0',
	'1',
	'2',
	'3',
	'4',
	'5',
	'6',
	'7',
	'8',
	'9',
	'A',
	'B',
	'C',
	'D',
	'E',
	'F',
]

const MAX_COLORS = 6
const MIN_COLORS = 2

type Preset = {
	name: string
	colors: string[]
}

const GRADIENT_PRESETS: Preset[] = [
	{ name: 'Gold', colors: ['#FFD700', '#FF6B00'] },
	{ name: 'Toxic', colors: ['#55FF55', '#00AAAA'] },
	{ name: 'Ocean', colors: ['#55FFFF', '#5555FF'] },
	{ name: 'Sunset', colors: ['#FF5555', '#FF55FF', '#FFD700'] },
	{ name: 'Neon', colors: ['#00FFFF', '#FF55FF'] },
	{ name: 'Blood', colors: ['#FF5555', '#AA0000'] },
	{ name: 'Ice', colors: ['#E8FFFF', '#55FFFF'] },
	{ name: 'Lava', colors: ['#FFD700', '#FF5500', '#AA0000'] },
	{ name: 'Amethyst', colors: ['#CC88FF', '#5555FF'] },
	{ name: 'Slime', colors: ['#55FF55', '#00AA00'] },
	{ name: 'Candy', colors: ['#55FFFF', '#FF55FF', '#FFFF55'] },
	{ name: 'Shadow', colors: ['#AAAAAA', '#555555'] },
]

type ColorMode = 'gradient' | 'solid'
type LimitMode = 'none' | 'pda' | 'clan'

const LIMITS: Record<Exclude<LimitMode, 'none'>, number> = {
	pda: 800,
	clan: 320,
}

function randomHex(): string {
	return `#${Math.floor(Math.random() * 0xffffff)
		.toString(16)
		.padStart(6, '0')
		.toUpperCase()}`
}

export default function TextFormatterView() {
	const t = useTranslations()
	const [raw, setRaw] = useState('Сталкрафт — это круто!')
	const [colors, setColors] = useState<string[]>([
		'#00FF88',
		'#00AAFF',
		'#8800FF',
	])
	const [solid, setSolid] = useState('#FFD700')
	const [colorMode, setColorMode] = useState<ColorMode>('gradient')
	const [limitMode, setLimitMode] = useState<LimitMode>('none')
	const [sel, setSel] = useState({ start: 0, end: 0, text: '' })
	const [buildInfo, setBuildInfo] = useState<{
		runs: number
		compressed: boolean
	} | null>(null)
	const areaRef = useRef<HTMLTextAreaElement>(null)
	const limit = limitMode === 'none' ? null : LIMITS[limitMode]

	const plain = useMemo(() => stripStalcraftCodes(raw), [raw])
	const codeCount = useMemo(() => countColorCodes(raw), [raw])

	const hasSelection = sel.end > sel.start && sel.text.length > 0

	const syncSelection = () => {
		const el = areaRef.current
		if (!el) return
		const start = el.selectionStart ?? 0
		const end = el.selectionEnd ?? 0
		setSel({ start, end, text: el.value.slice(start, end) })
	}

	const handleTextChange = (value: string) => {
		setRaw(value)
		setBuildInfo(null)
	}

	const applyPreset = (p: Preset) => {
		setColors([...p.colors])
	}

	const addColor = (hex: string) => {
		setColors((prev) => {
			if (prev.length >= MAX_COLORS) return prev
			return [...prev, hex.toUpperCase()]
		})
	}

	const updateColor = (index: number, hex: string) => {
		setColors((prev) =>
			prev.map((c, i) => (i === index ? hex.toUpperCase() : c))
		)
	}

	const removeColor = (index: number) => {
		setColors((prev) => {
			if (prev.length <= MIN_COLORS) return prev
			return prev.filter((_, i) => i !== index)
		})
	}

	const randomizeColors = () => {
		setColors((prev) => prev.map(() => randomHex()))
	}

	const buildWhole = (
		text: string,
		mode: ColorMode,
		stops: string[],
		solidHex: string,
		max: number
	) => {
		if (!text) return { text: '', runs: 0, compressed: false }
		if (mode === 'solid') {
			return { text: `§${solidHex}${text}§R`, runs: 1, compressed: false }
		}
		const res = buildCompressedGradient(text, stops, max)
		return { text: res.text, runs: res.runs, compressed: res.compressed }
	}

	const handleApply = () => {
		if (limit !== null) {
			const res = buildWhole(plain, colorMode, colors, solid, limit)
			setRaw(res.text)
			setBuildInfo({ runs: res.runs, compressed: res.compressed })
			return
		}
		if (!hasSelection) return
		const selected = plain.slice(sel.start, sel.end)
		if (!selected) return
		const snippet =
			colorMode === 'solid'
				? `§${solid}${selected}§R`
				: buildMultiGradient(selected, colors)
		const [rs, re] = plainToRawRange(raw, sel.start, sel.end)
		setRaw(raw.slice(0, rs) + snippet + raw.slice(re))
		setBuildInfo(null)
		requestAnimationFrame(() => {
			if (!areaRef.current) return
			areaRef.current.focus()
			const pos = sel.start + selected.length
			areaRef.current.setSelectionRange(pos, pos)
			setSel({ start: pos, end: pos, text: '' })
		})
	}

	const handleLimitChange = (value: LimitMode) => {
		setLimitMode(value)
		if (value === 'none' || !plain) {
			setBuildInfo(null)
			return
		}
		const res = buildWhole(plain, colorMode, colors, solid, LIMITS[value])
		setRaw(res.text)
		setBuildInfo({ runs: res.runs, compressed: res.compressed })
	}

	const preview = useMemo(() => raw, [raw])

	const selectionPreview = useMemo(() => {
		if (!sel.text) return ''
		if (colorMode === 'solid') return `§${solid}${sel.text}§R`
		return buildMultiGradient(sel.text, colors)
	}, [sel.text, colors, solid, colorMode])

	const status = useMemo(() => {
		if (!plain)
			return {
				variant: 'default' as const,
				text: t('textFormatter.emptyText'),
			}
		if (limit === null)
			return {
				variant: 'default' as const,
				text: t('textFormatter.exactHint'),
			}
		const fits = raw.length <= limit
		if (!fits)
			return {
				variant: 'destructive' as const,
				text: t('textFormatter.notFit'),
			}
		if (buildInfo?.compressed)
			return {
				variant: 'success' as const,
				text: t('textFormatter.compressedHint', {
					runs: buildInfo.runs,
				}),
			}
		return {
			variant: 'success' as const,
			text: t('textFormatter.fitsExact'),
		}
	}, [plain, limit, raw, buildInfo, t])

	const gradientBar = (stops: string[]) =>
		`linear-gradient(90deg, ${stops.join(', ')})`
	const previewBar = colorMode === 'gradient' ? gradientBar(colors) : solid

	return (
		<section className="mx-auto flex max-w-380 flex-col gap-8 px-4 pt-32 pb-12 md:px-8 xl:pt-36">
			<h1
				className={`${mtsExtended.className} font-semibold text-[28px] leading-none`}
			>
				{t('textFormatter.title')}
			</h1>

			<div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
				<div className="flex min-w-0 flex-col gap-4">
					<Card.Root className="gap-3">
						<Card.Title className="font-semibold text-sm">
							<Icon
								className="size-4 text-muted-foreground"
								icon="lucide:type"
							/>
							{t('textFormatter.textTitle')}
						</Card.Title>
						<Card.Description className="text-xs">
							{t('textFormatter.textHint')}
						</Card.Description>
						<Textarea
							className="min-h-24 w-full border bg-muted p-3 font-mono focus:border-primary/80"
							onChange={(e) => {
								handleTextChange(e.target.value)
								requestAnimationFrame(syncSelection)
							}}
							onClick={syncSelection}
							onKeyUp={syncSelection}
							onSelect={syncSelection}
							ref={areaRef}
							value={plain}
						/>
						<div className="flex items-center justify-between text-muted-foreground text-xs">
							<span>
								{plain.length} {t('textFormatter.chars')}
							</span>
							<span>
								{codeCount} {t('textFormatter.colored')}
							</span>
						</div>

						<Divider />

						{limit === null ? (
							<Alert.Root
								variant={hasSelection ? 'info' : 'default'}
							>
								<Alert.Description>
									{hasSelection ? (
										<>
											<span className="text-muted-foreground">
												{t('textFormatter.selected')}:{' '}
											</span>
											<span className="break-all font-mono">
												«{sel.text.slice(0, 80)}
												{sel.text.length > 80
													? '…'
													: ''}
												»
											</span>
											{selectionPreview && (
												<div className="mt-1.5 rounded bg-black/80 px-2 py-1.5 font-mono text-[13px]">
													<StalcraftText
														text={selectionPreview}
													/>
												</div>
											)}
										</>
									) : (
										<span className="text-muted-foreground">
											{t('textFormatter.noSelection')}
										</span>
									)}
								</Alert.Description>
							</Alert.Root>
						) : (
							<Alert.Root variant="info">
								<Alert.Description>
									{t('textFormatter.wholeHint')}
								</Alert.Description>
							</Alert.Root>
						)}

						<Button
							disabled={limit === null && !hasSelection}
							onClick={handleApply}
							size="sm"
							variant="primary"
						>
							{limit === null
								? t('textFormatter.applyGradient')
								: t('textFormatter.applyWhole')}
						</Button>
					</Card.Root>

					<Card.Root className="gap-3">
						<Card.Title className="font-semibold text-sm">
							{t('textFormatter.preview')}
						</Card.Title>
						<Card.Description className="text-xs">
							{t('textFormatter.previewHint')}
						</Card.Description>
						<span
							className="h-2 w-full rounded-full"
							style={{ background: previewBar }}
						/>
						<div className="min-h-24 rounded-lg bg-muted p-4 font-mono font-semibold text-[15px] leading-relaxed">
							<StalcraftText text={preview} />
						</div>
					</Card.Root>

					<Card.Root className="gap-3">
						<Card.Title className="font-semibold text-sm">
							{t('textFormatter.result')}
						</Card.Title>
						<Card.Description className="text-xs">
							{t('textFormatter.resultSub')}
						</Card.Description>
						<pre className="max-h-48 overflow-auto whitespace-pre-wrap break-all rounded-lg border border-border bg-background p-3 font-mono font-semibold text-xs">
							{raw}
						</pre>
						<div className="flex items-center gap-2">
							<CopyButton
								className="p-4"
								size="md"
								text={raw}
								variant="primary"
							/>
							<span className="text-muted-foreground text-xs">
								{raw.length}
								{limit !== null && ` / ${limit}`}{' '}
								{t('textFormatter.chars')}
							</span>
							{limit !== null && raw.length > limit && (
								<Badge variant="danger">
									{t('textFormatter.overLimit')}
								</Badge>
							)}
							<Button
								className="ml-auto"
								onClick={() => {
									setRaw('')
									setBuildInfo(null)
								}}
								size="sm"
								variant="outline"
							>
								{t('textFormatter.clear')}
							</Button>
						</div>
						<Card.Description className="text-[11px]">
							{t('textFormatter.resultHint')}
						</Card.Description>
					</Card.Root>
				</div>

				<div className="flex min-w-0 flex-col gap-4">
					<Card.Root className="gap-3">
						<Card.Title className="font-semibold text-sm">
							<Icon
								className="size-4 text-muted-foreground"
								icon="lucide:palette"
							/>
							{t('textFormatter.colors')}
						</Card.Title>
						<Tabs.Root
							onValueChange={(v) => setColorMode(v as ColorMode)}
							value={colorMode}
						>
							<Tabs.List className="grid grid-cols-2 gap-1 p-1">
								<Tabs.Trigger
									className="px-2 text-[13px] md:text-[13px]"
									value="gradient"
								>
									{t('textFormatter.gradient')}
								</Tabs.Trigger>
								<Tabs.Trigger
									className="px-2 text-[13px] md:text-[13px]"
									value="solid"
								>
									{t('textFormatter.modeSolid')}
								</Tabs.Trigger>
							</Tabs.List>
							<Tabs.Content
								className="mt-3 flex flex-col gap-3"
								value="gradient"
							>
								<Card.Description className="text-xs">
									{t('textFormatter.colorsHint')}
								</Card.Description>
								<div className="flex flex-col gap-1.5">
									{colors.map((c, i) => (
										<div
											className="flex items-center gap-2"
											key={`${i}-${c}`}
										>
											<span className="w-3 shrink-0 text-muted-foreground text-xs">
												{i + 1}
											</span>
											<input
												className="size-10 shrink-0 cursor-pointer rounded-lg bg-transparent"
												onChange={(e) =>
													updateColor(
														i,
														e.target.value
													)
												}
												type="color"
												value={c}
											/>
											<Badge
												className="font-mono uppercase"
												variant="secondary"
											>
												{c}
											</Badge>
											<Button
												aria-label={`remove-${i + 1}`}
												className="ml-auto px-2"
												disabled={
													colors.length <= MIN_COLORS
												}
												onClick={() => removeColor(i)}
												size="sm"
												variant="ghost"
											>
												<Icon
													className="size-4"
													icon="lucide:trash-2"
												/>
											</Button>
										</div>
									))}
								</div>
								<div className="flex gap-1.5">
									<Button
										className="flex-1"
										disabled={colors.length >= MAX_COLORS}
										onClick={() =>
											addColor(
												colors[colors.length - 1] ??
													'#FFFFFF'
											)
										}
										size="sm"
										variant="outline"
									>
										<Icon
											className="size-4"
											icon="lucide:plus"
										/>
										{t('textFormatter.addColor')}
									</Button>
									<Tooltip.Root>
										<Tooltip.Trigger
											asChild
											underline={false}
										>
											<Button
												aria-label="randomize"
												className="px-2.5"
												onClick={randomizeColors}
												size="sm"
												variant="outline"
											>
												<Icon
													className="size-4"
													icon="lucide:shuffle"
												/>
											</Button>
										</Tooltip.Trigger>
										<Tooltip.Content>
											{t('textFormatter.randomHint')}
										</Tooltip.Content>
									</Tooltip.Root>
								</div>
								<div>
									<span className="mb-1.5 block text-xs">
										{t('textFormatter.baseColors')}
									</span>
									<div className="flex flex-wrap gap-1.5">
										{BASE_CODES.map((c) => (
											<Button
												className="size-8 p-0"
												disabled={
													colors.length >= MAX_COLORS
												}
												key={c}
												onClick={() =>
													addColor(
														STALCRAFT_COLORS[c]
													)
												}
												size="sm"
												style={{
													background:
														STALCRAFT_COLORS[c],
												}}
												variant="secondary"
											>
												<Icon
													className="size-4 text-black"
													icon="lucide:plus"
												/>
											</Button>
										))}
									</div>
									<Card.Description className="mt-1 text-[11px]">
										{t('textFormatter.baseColorsHint')}
									</Card.Description>
								</div>
							</Tabs.Content>
							<Tabs.Content
								className="mt-3 flex flex-col gap-3"
								value="solid"
							>
								<Card.Description className="text-xs">
									{t('textFormatter.solidHint')}
								</Card.Description>
								<div className="flex items-center gap-2">
									<input
										className="size-10 shrink-0 cursor-pointer rounded-lg"
										onChange={(e) =>
											setSolid(
												e.target.value.toUpperCase()
											)
										}
										type="color"
										value={solid}
									/>
									<Badge
										className="font-mono uppercase"
										variant="secondary"
									>
										{solid}
									</Badge>
									<span
										className="h-8 flex-1 rounded-lg"
										style={{ background: solid }}
									/>
								</div>
								<div>
									<span className="mb-1.5 block text-xs">
										{t('textFormatter.baseColors')}
									</span>
									<div className="flex flex-wrap gap-1.5">
										{BASE_CODES.map((c) => (
											<Button
												className="size-8 p-0"
												key={c}
												onClick={() =>
													setSolid(
														STALCRAFT_COLORS[
															c
														].toUpperCase()
													)
												}
												size="sm"
												style={{
													background:
														STALCRAFT_COLORS[c],
												}}
												variant="secondary"
											/>
										))}
									</div>
									<Card.Description className="mt-1 text-[11px]">
										{t('textFormatter.solidBaseHint')}
									</Card.Description>
								</div>
							</Tabs.Content>
						</Tabs.Root>
					</Card.Root>

					<Card.Root className="gap-3">
						<Card.Title className="font-semibold text-sm">
							<Icon
								className="size-4 text-muted-foreground"
								icon="lucide:scissors"
							/>
							{t('textFormatter.smartTitle')}
						</Card.Title>
						<Card.Description className="text-xs">
							{t('textFormatter.smartHint')}
						</Card.Description>
						<Tabs.Root
							onValueChange={(v) =>
								handleLimitChange(v as LimitMode)
							}
							value={limitMode}
						>
							<Tabs.List className="grid grid-cols-3 gap-1 p-1">
								<Tabs.Trigger
									className="px-2 text-[13px] md:text-[13px]"
									value="none"
								>
									{t('textFormatter.noLimit')}
								</Tabs.Trigger>
								<Tabs.Trigger
									className="px-2 text-[13px] md:text-[13px]"
									value="pda"
								>
									800
								</Tabs.Trigger>
								<Tabs.Trigger
									className="px-2 text-[13px] md:text-[13px]"
									value="clan"
								>
									320
								</Tabs.Trigger>
							</Tabs.List>
						</Tabs.Root>
						<Alert.Root variant={status.variant}>
							<Alert.Description>{status.text}</Alert.Description>
						</Alert.Root>
					</Card.Root>

					<Card.Root className="gap-3">
						<Card.Title className="font-semibold text-sm">
							{t('textFormatter.ready')}
						</Card.Title>
						<Card.Description className="text-xs">
							{t('textFormatter.readyHint')}
						</Card.Description>
						<div className="grid grid-cols-2 gap-1.5">
							{GRADIENT_PRESETS.map((p) => (
								<Button
									aria-label={p.name}
									className="h-auto p-1.5"
									key={p.name}
									onClick={() => {
										applyPreset(p)
										setColorMode('gradient')
									}}
									size="sm"
									variant="outline"
								>
									<span
										className="h-5 w-full rounded"
										style={{
											background: gradientBar(p.colors),
										}}
									/>
								</Button>
							))}
						</div>
					</Card.Root>
				</div>
			</div>
		</section>
	)
}
