'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useMap, useMapEvents } from 'react-leaflet'
import { Button } from '@/components/ui/Button'
import { Combobox, type ComboboxOption } from '@/components/ui/Combobox'
import { useMarkerText, useSettlementText } from '@/hooks/useMarkerText'
import type { AtlasWaypoint } from '@/types/map.type'
import { buildAtlasMarkersFile } from '../lib/worldAtlas'
import { imagePxToWorld } from '../lib/worldCoords'

type Props = {
	spots: AtlasWaypoint[]
	setSpots: (update: (current: AtlasWaypoint[]) => AtlasWaypoint[]) => void
	fullMaxLevel: number
	selectedUuid: string | null
	onSelect: (uuid: string | null) => void
}

type EditorMode = 'select' | 'add' | 'move'

export default function WorldMarkerEditor({
	spots,
	setSpots,
	fullMaxLevel,
	selectedUuid,
	onSelect,
}: Props) {
	const map = useMap()
	const t = useTranslations('map.editor')
	const [enabled, setEnabled] = useState(false)
	const [mode, setMode] = useState<EditorMode>('select')
	const [newIcon, setNewIcon] = useState('')
	const [message, setMessage] = useState('')
	const [mounted, setMounted] = useState(false)
	const text = useMarkerText()
	const settlementText = useSettlementText()

	const iconOptions = useMemo<ComboboxOption[]>(() => {
		const seen = new Set<string>()
		for (const spot of spots) seen.add(spot.icon)
		return [...seen].sort().map((icon) => ({ value: icon, label: icon }))
	}, [spots])

	const selectedSpot = useMemo(
		() => spots.find((spot) => spot.uuid === selectedUuid) ?? null,
		[spots, selectedUuid]
	)

	useEffect(() => setMounted(true), [])

	useEffect(() => {
		map.getContainer().classList.toggle('map-editor-mode', enabled)
		map.setMaxZoom(enabled ? fullMaxLevel + 4 : fullMaxLevel)
		const onPicked = (event: Event) => {
			if (!enabled || mode === 'add') return
			const spot = (event as CustomEvent<AtlasWaypoint>).detail
			onSelect(spot.uuid)
			setMessage(t('picked', { name: text(spot.title_key) || spot.uuid }))
		}
		window.addEventListener('world-marker-picked', onPicked)
		return () => {
			map.getContainer().classList.remove('map-editor-mode')
			map.setMaxZoom(fullMaxLevel)
			window.removeEventListener('world-marker-picked', onPicked)
		}
	}, [enabled, fullMaxLevel, map, mode, onSelect, t, text])

	useMapEvents({
		click(event) {
			if (!enabled) return
			if (mode === 'add') {
				const point = map.project(event.latlng, fullMaxLevel)
				const placed = imagePxToWorld(point.x, point.y)
				const icon =
					newIcon || spots.find((spot) => spot.icon)?.icon || ''
				const spot: AtlasWaypoint = {
					uuid: crypto.randomUUID(),
					icon,
					title_key: 'custom.waypoint',
					goal_key: '',
					settlement: '',
					x: placed.x,
					z: placed.z,
				}
				setSpots((current) => [...current, spot])
				onSelect(spot.uuid)
				setMode('select')
				setMessage(t('added'))
				return
			}
			if (mode === 'move' && selectedUuid) {
				const point = map.project(event.latlng, fullMaxLevel)
				const placed = imagePxToWorld(point.x, point.y)
				setSpots((current) =>
					current.map((spot) =>
						spot.uuid === selectedUuid
							? { ...spot, x: placed.x, z: placed.z }
							: spot
					)
				)
				setMessage(t('moved'))
			}
		},
	})

	const patchSelected = (patch: Partial<AtlasWaypoint>) => {
		if (!selectedUuid) return
		setSpots((current) =>
			current.map((spot) =>
				spot.uuid === selectedUuid ? { ...spot, ...patch } : spot
			)
		)
	}

	const deleteSelected = () => {
		if (!selectedUuid) return
		setSpots((current) => current.filter((s) => s.uuid !== selectedUuid))
		onSelect(null)
		setMessage(t('deleted'))
	}

	const download = () => {
		const blob = new Blob(
			[JSON.stringify(buildAtlasMarkersFile(spots), null, 2)],
			{ type: 'application/json' }
		)
		const url = URL.createObjectURL(blob)
		const link = document.createElement('a')
		link.href = url
		link.download = 'markers.json'
		link.click()
		URL.revokeObjectURL(url)
		setMessage(t('downloaded'))
	}

	const editor = (
		<div className="flex w-full flex-col gap-2 border-primary/20 border-t-2 pt-3 text-xs">
			<Button
				onClick={() => {
					setEnabled((value) => !value)
					setMode('select')
					onSelect(null)
				}}
				type="button"
				variant="primary"
			>
				{enabled ? t('close') : t('open')}
			</Button>
			{enabled && (
				<>
					<p>{t('hint')}</p>
					<div className="grid grid-cols-3 gap-1">
						{(
							[
								['select', 'select'],
								['add', 'add'],
								['move', 'move'],
							] as const
						).map(([value, label]) => (
							<Button
								disabled={mode === value}
								key={value}
								onClick={() => {
									setMode(value)
									if (value !== 'add') onSelect(null)
									setMessage(
										value === 'select'
											? t('msgSelect')
											: value === 'add'
												? t('msgAdd')
												: t('msgMove')
									)
								}}
								size="sm"
								type="button"
								variant="secondary"
							>
								{t(label)}
							</Button>
						))}
					</div>
					{mode === 'add' && (
						<Combobox
							className="w-full"
							emptyText={t('noIcons')}
							onValueChange={setNewIcon}
							options={iconOptions}
							placeholder={t('iconForNew')}
							searchPlaceholder={t('searchIcon')}
							translateOptions={false}
							value={newIcon}
						/>
					)}
					{selectedSpot && (
						<>
							{(text(selectedSpot.title_key) !==
								selectedSpot.title_key ||
								settlementText(
									selectedSpot.settlement ?? ''
								) !== (selectedSpot.settlement ?? '')) && (
								<p className="rounded bg-primary/10 px-2 py-1">
									{text(selectedSpot.title_key)}
									{selectedSpot.settlement ? (
										<>
											<br />
											{settlementText(
												selectedSpot.settlement
											)}
										</>
									) : null}
								</p>
							)}
							<label>
								{t('titleField')}
								<input
									className="w-full rounded border bg-background px-2 py-1"
									onChange={(event) =>
										patchSelected({
											title_key: event.target.value,
										})
									}
									value={selectedSpot.title_key}
								/>
							</label>
							<label>
								{t('settlementField')}
								<input
									className="w-full rounded border bg-background px-2 py-1"
									onChange={(event) =>
										patchSelected({
											settlement: event.target.value,
										})
									}
									value={selectedSpot.settlement ?? ''}
								/>
							</label>
							<Combobox
								className="w-full"
								emptyText={t('noIcons')}
								onValueChange={(icon) =>
									patchSelected({ icon })
								}
								options={iconOptions}
								placeholder={t('iconField')}
								searchPlaceholder={t('searchIcon')}
								translateOptions={false}
								value={selectedSpot.icon}
							/>
							<p className="text-muted-foreground">
								{t('xz', {
									x: selectedSpot.x.toFixed(2),
									z: selectedSpot.z.toFixed(2),
								})}
							</p>
						</>
					)}
					{(selectedSpot || mode === 'move') && (
						<button
							className="rounded bg-destructive px-2 py-1 text-destructive-foreground"
							disabled={!selectedSpot}
							onClick={deleteSelected}
							type="button"
						>
							{t('delete')}
						</button>
					)}
					<button
						className="rounded bg-secondary px-2 py-1"
						onClick={download}
						type="button"
					>
						{t('download')}
					</button>
				</>
			)}
			{message && <p>{message}</p>}
		</div>
	)

	return mounted && document.getElementById('map-editor-sidebar')
		? createPortal(
				editor,
				document.getElementById('map-editor-sidebar') as HTMLElement
			)
		: null
}
