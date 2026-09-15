'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { CheckBox } from '@/components/ui/CheckBox'
import { Combobox, type ComboboxOption } from '@/components/ui/Combobox'
import { toast } from '@/components/ui/Toast'
import { cn } from '@/lib/cn'
import { WAYPOINT_ICON_OPTIONS } from './constants'
import type { MarkerEditorEngine } from './engine'
import type { UiSnapshot, WaypointRow } from './types'

const WAYPOINT_LIST_LIMIT = 250

function WaypointList({ waypoints }: { waypoints: WaypointRow[] }) {
	const t = useTranslations('map.convert')

	if (!waypoints.length) {
		return (
			<p className="font-semibold text-muted-foreground text-xs leading-relaxed">
				{t('noMarkers')}
			</p>
		)
	}

	const shown = waypoints.slice(0, WAYPOINT_LIST_LIMIT)
	const rest = waypoints.length - shown.length

	return (
		<div className="max-h-64 overflow-y-auto rounded-lg border border-border bg-muted/30">
			{shown.map((wp) => (
				<div
					className="border-border/60 border-b px-2 py-1.5 text-xs last:border-b-0"
					key={wp.key}
				>
					<p className="font-semibold">
						{wp.buffer ? '[B] ' : ''}
						{wp.name}
					</p>
					<p className="font-semibold text-muted-foreground text-xs leading-relaxed">
						{t('color')}{' '}
						<span
							className="inline-block h-2.5 w-2.5 rounded-sm border border-foreground/45 align-baseline"
							style={{ background: wp.colorHex }}
						/>
						{' ' + wp.colorHex}
					</p>
					<p className="font-semibold text-muted-foreground text-xs leading-relaxed">
						X: {wp.x.toFixed(2)} Y: {wp.y.toFixed(2)} Z:{' '}
						{wp.z.toFixed(2)}
					</p>
					<p className="font-semibold text-muted-foreground text-xs leading-relaxed">
						Tile X: {wp.tileX.toFixed(2)} Tile Z:{' '}
						{wp.tileZ.toFixed(2)}
					</p>
				</div>
			))}
			{rest > 0 && (
				<p className="px-2 py-1.5 font-medium text-muted-foreground text-xs">
					{t('moreMarkers', { rest, shown: shown.length })}
				</p>
			)}
		</div>
	)
}

type NumberFieldProps = {
	value: number
	onCommit: (value: number) => void
	min?: number
	max?: number
	step?: number
	id?: string
	className?: string
}

function NumberField({
	value,
	onCommit,
	min,
	max,
	step = 1,
	id,
	className,
}: NumberFieldProps) {
	const [draftValue, setDraftValue] = useState(String(value))
	const [focused, setFocused] = useState(false)
	const lastValid = useRef(String(value))

	useEffect(() => {
		if (focused) return
		setDraftValue(String(value))
		lastValid.current = String(value)
	}, [focused, value])

	const isValidNumber = (raw: string) => {
		if (raw === '') return true
		if (!/^-?\d*(\.\d*)?$/.test(raw)) return false
		const num = Number(raw)
		if (Number.isNaN(num)) return false
		if (min !== undefined && num < min) return false
		if (max !== undefined && num > max) return false
		return true
	}

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const raw = e.target.value
		setDraftValue(raw)
		if (!isValidNumber(raw)) return
		lastValid.current = raw
		onCommit(Number(raw))
	}

	const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
		setFocused(false)
		const raw = e.target.value
		if (raw === '') return
		let normalized = String(Number(raw))
		if (min !== undefined) {
			normalized = String(Math.max(Number(normalized), min))
		}
		if (max !== undefined) {
			normalized = String(Math.min(Number(normalized), max))
		}
		setDraftValue(normalized)
		lastValid.current = normalized
		onCommit(Number(normalized))
	}

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			e.preventDefault()
			;(e.target as HTMLInputElement).blur()
			return
		}
		if (e.key === 'Escape') {
			e.preventDefault()
			setDraftValue(lastValid.current)
			;(e.target as HTMLInputElement).blur()
		}
	}

	return (
		<input
			className={cn(
				'w-full rounded-lg border-2 border-muted bg-card px-2.5 py-1.5 font-semibold text-foreground outline-none transition-all duration-300 placeholder:text-muted-foreground focus:border-primary',
				className
			)}
			id={id}
			max={max}
			min={min}
			onBlur={handleBlur}
			onChange={handleChange}
			onFocus={() => setFocused(true)}
			onKeyDown={handleKeyDown}
			step={step}
			type="number"
			value={draftValue}
		/>
	)
}

type EngineControlsProps = {
	engineOf: () => MarkerEditorEngine | null
	ui: UiSnapshot | null
}

export default function EngineControls({ engineOf, ui }: EngineControlsProps) {
	const t = useTranslations('map.convert')
	const imageInputRef = useRef<HTMLInputElement | null>(null)
	const cfgInputRef = useRef<HTMLInputElement | null>(null)

	const iconOptions = useMemo<ComboboxOption[]>(
		() =>
			WAYPOINT_ICON_OPTIONS.map((option) => ({
				value: String(option.value),
				label: `map.convert.iconNames.${option.label}`,
			})),
		[]
	)

	const handleImageInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		e.target.value = ''
		if (!file) return
		await engineOf()?.setSourceImage(file)
	}

	const handleCfgInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		e.target.value = ''
		if (!file) return
		await engineOf()?.pickCfgFile(file)
	}

	const width = ui?.targetWidth ?? 100
	const height = ui?.targetHeight ?? 100
	const iconIndex = ui?.iconIndex ?? 0

	return (
		<div className="order-2 flex h-1/2 w-full shrink-0 flex-col gap-3 overflow-y-auto p-4 md:order-1 md:h-full md:w-80">
			<p className="font-bold text-foreground text-sm">{t('tools')}</p>

			<input
				accept="image/*"
				className="hidden"
				onChange={handleImageInput}
				ref={imageInputRef}
				type="file"
			/>
			<Button
				className="w-full"
				onClick={() => imageInputRef.current?.click()}
				type="button"
				variant="outline"
			>
				{t('selectImage')}
			</Button>
			<p className="font-semibold text-muted-foreground text-xs leading-relaxed">
				{ui?.sourceNote ?? t('originalNotLoaded')}
			</p>

			<label
				className="font-semibold text-muted-foreground text-xs"
				htmlFor="target-width"
			>
				{t('targetResolution')}
			</label>
			<div className="flex items-center gap-2">
				<NumberField
					className="min-w-0 flex-1"
					id="target-width"
					max={4096}
					min={1}
					onCommit={(v) => engineOf()?.setTargetWidth(v)}
					step={1}
					value={width}
				/>
				<Button
					aria-label={t('aspectLock')}
					className="size-10 shrink-0 px-0 text-base"
					onClick={() => engineOf()?.toggleAspectLock()}
					title={t('aspectLock')}
					type="button"
					variant={ui?.aspectLocked ? 'primary' : 'outline'}
				>
					<Icon
						className="text-xl"
						icon={
							ui?.aspectLocked ? 'lucide:lock' : 'lucide:unlock'
						}
					/>
				</Button>
				<NumberField
					className="min-w-0 flex-1"
					id="target-height"
					max={4096}
					min={1}
					onCommit={(v) => engineOf()?.setTargetHeight(v)}
					step={1}
					value={height}
				/>
			</div>
			<p className="font-semibold text-muted-foreground text-xs leading-relaxed">
				{width} x {height}
			</p>

			<label
				className="font-semibold text-muted-foreground text-xs"
				htmlFor="gen-icon"
			>
				{t('icon')}
			</label>
			<Combobox
				onValueChange={(value) => {
					if (value !== '') engineOf()?.setIconIndex(Number(value))
				}}
				options={iconOptions}
				placeholder="map.convert.icon"
				searchPlaceholder="map.convert.searchIcon"
				value={String(iconIndex)}
			/>

			<div className="flex flex-col gap-2">
				<CheckBox
					checked={ui?.autoIcons ?? false}
					id="auto-icons"
					label={t('autoIcons')}
					onCheckedChange={(v) => engineOf()?.setAutoIcons(v)}
				/>
				<CheckBox
					checked={ui?.highPerf ?? false}
					id="high-perf-mode"
					label={t('highPerfMode')}
					onCheckedChange={(v) => engineOf()?.setHighPerfMode(v)}
				/>
			</div>

			<label
				className="font-semibold text-muted-foreground text-xs"
				htmlFor="sticker-scale"
			>
				{t('scale')}
			</label>
			<NumberField
				id="sticker-scale"
				max={200}
				min={0.2}
				onCommit={(v) => engineOf()?.setStickerScale(v)}
				step={0.2}
				value={ui?.stickerScale ?? 1}
			/>

			<div className="flex gap-2">
				<Button
					className="flex-1"
					disabled={!ui?.hasImage}
					onClick={() => {
						void engineOf()?.generateFromImage()
					}}
					type="button"
				>
					{t('generate')}
				</Button>
				<Button
					className="flex-1"
					onClick={() => engineOf()?.clearGenerated()}
					type="button"
					variant="outline"
				>
					{t('clear')}
				</Button>
			</div>
			<Button
				className="w-full"
				disabled={!ui?.selectedCount}
				onClick={() => engineOf()?.deleteSelected()}
				type="button"
				variant="danger"
			>
				{t('deleteSelected')}
			</Button>
			<div className="flex gap-2">
				<Button
					className="flex-1"
					disabled={!ui?.generated}
					onClick={() => engineOf()?.bakeImageToBuffer()}
					type="button"
					variant="outline"
				>
					{t('bakeImage')}
				</Button>
				<Button
					className="flex-1"
					disabled={!ui?.waypointTotal}
					onClick={() => {
						void engineOf()?.bakeCfg()
						toast.success(t('success'), { duration: 5000 })
					}}
					type="button"
					variant="outline"
				>
					{t('saveCfg')}
				</Button>
			</div>
			<p className="font-semibold text-muted-foreground text-xs leading-relaxed">
				{ui?.genStats}
			</p>

			<p className="font-bold text-foreground text-sm">{t('cfg')}</p>
			<input
				accept=".cfg,.json,application/json,text/plain"
				className="hidden"
				onChange={handleCfgInput}
				ref={cfgInputRef}
				type="file"
			/>
			<Button
				className="w-full"
				onClick={() => cfgInputRef.current?.click()}
				type="button"
				variant="outline"
			>
				{t('selectCfg')}
			</Button>
			<p className="font-semibold text-muted-foreground text-xs leading-relaxed">
				{ui?.cfgStatus}
			</p>

			<p className="font-bold text-foreground text-sm">
				{t('markers', {
					total: ui?.waypointTotal ?? 0,
					selected: ui?.selectedCount ?? 0,
				})}
			</p>
			<WaypointList waypoints={ui?.waypoints ?? []} />

			<p className="font-medium text-muted-foreground text-xs">
				{t('help')}
			</p>
		</div>
	)
}
