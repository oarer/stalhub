'use client'

import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import { mtsExtended } from '@/app/fonts'
import { Button } from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { StalcraftText } from '@/components/wiki/StalcraftText'
import {
	buildGradient,
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

export default function TextFormatterView() {
	const t = useTranslations()
	const [raw, setRaw] = useState('§6Сталкрафт§R — это §2круто§R!')
	const [gradText, setGradText] = useState('Тот самый сталкер')
	const [from, setFrom] = useState('#FFD700')
	const [to, setTo] = useState('#00FF00')
	const [mode, setMode] = useState<'pda' | 'clan'>('pda')
	const limit = mode === 'pda' ? 800 : 320
	const plainLen = stripStalcraftCodes(raw).length

	const insertCode = (code: string) => setRaw((p) => `${p}§${code}`)

	const applyGradient = () => {
		const g = buildGradient(gradText, from, to)
		setRaw((p) => (p ? `${p} ${g}` : g))
	}

	const copyGame = async () => {
		try {
			await navigator.clipboard.writeText(raw)
		} catch {}
	}

	const preview = useMemo(() => raw, [raw])

	return (
		<section className="mx-auto flex max-w-380 flex-col gap-8 px-4 pt-32 pb-12 md:px-8 xl:pt-36">
			<div>
				<h1
					className={`${mtsExtended.className} font-semibold text-[28px] leading-none`}
				>
					{t('textFormatter.title')}
				</h1>
				<p className="mt-2 font-medium text-muted-foreground text-sm">
					{t('textFormatter.subtitle')}
				</p>
			</div>

			<div className="grid gap-4 lg:grid-cols-2">
				<div className="flex flex-col gap-4 rounded-xl border-2 border-primary/20 bg-card p-5">
					<div className="flex items-center gap-2">
						<Button
							onClick={() => setMode('pda')}
							size="sm"
							variant={mode === 'pda' ? 'primary' : 'outline'}
						>
							PDA · 800
						</Button>
						<Button
							onClick={() => setMode('clan')}
							size="sm"
							variant={mode === 'clan' ? 'primary' : 'outline'}
						>
							{t('textFormatter.clan')} · 320
						</Button>
						<span
							className={`ml-auto font-mono text-xs ${raw.length > limit ? 'text-red-400' : 'text-text-accent'}`}
						>
							{raw.length} / {limit}
						</span>
					</div>

					<textarea
						className="min-h-40 w-full resize-y rounded-lg border border-border bg-background p-3 font-mono text-sm outline-none focus:border-primary"
						onChange={(e) => setRaw(e.target.value)}
						value={raw}
					/>
					<div className="font-mono text-text-accent text-xs">
						{t('textFormatter.plainLen')}: {plainLen}
					</div>

					<div className="flex flex-wrap gap-1.5">
						{BASE_CODES.map((c) => (
							<button
								className="flex size-8 items-center justify-center rounded-md border border-border font-bold font-mono text-xs"
								key={c}
								onClick={() => insertCode(c)}
								style={{
									background: STALCRAFT_COLORS[c],
									color: '#000',
								}}
								title={`§${c}`}
								type="button"
							>
								{c}
							</button>
						))}
						<button
							className="rounded-md border border-border px-2 font-mono text-xs"
							onClick={() => insertCode('R')}
							type="button"
						>
							§R
						</button>
					</div>

					<div className="flex flex-col gap-2 rounded-lg bg-accent/40 p-3">
						<span className="font-semibold text-sm">
							{t('textFormatter.gradient')}
						</span>
						<Input
							label="textFormatter.gradientText"
							onChange={(e) => setGradText(e.target.value)}
							value={gradText}
						/>
						<div className="flex items-center gap-2">
							<input
								className="size-9 cursor-pointer rounded border border-border bg-transparent"
								onChange={(e) => setFrom(e.target.value)}
								type="color"
								value={from}
							/>
							<input
								className="size-9 cursor-pointer rounded border border-border bg-transparent"
								onChange={(e) => setTo(e.target.value)}
								type="color"
								value={to}
							/>
							<Button
								onClick={applyGradient}
								size="sm"
								variant="primary"
							>
								{t('textFormatter.applyGradient')}
							</Button>
						</div>
					</div>

					<div className="flex gap-2">
						<Button onClick={copyGame} variant="primary">
							{t('textFormatter.copy')}
						</Button>
						<Button onClick={() => setRaw('')} variant="outline">
							{t('textFormatter.clear')}
						</Button>
					</div>
				</div>

				<div className="flex flex-col gap-4 rounded-xl border-2 border-primary/20 bg-card p-5">
					<span className="font-semibold text-sm">
						{t('textFormatter.preview')}
					</span>
					<div className="min-h-40 rounded-lg bg-black/80 p-4 font-mono text-[15px] leading-relaxed">
						<StalcraftText text={preview} />
					</div>
					<div className="rounded-lg bg-accent/40 p-3 text-text-accent text-xs">
						{t('textFormatter.hint')}
					</div>
				</div>
			</div>
		</section>
	)
}
