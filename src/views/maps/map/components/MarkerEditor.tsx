'use client'

import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useMap, useMapEvents } from 'react-leaflet'
import { Button } from '@/components/ui/Button'
import { Combobox, type ComboboxOption } from '@/components/ui/Combobox'
import Input from '@/components/ui/Input'
import type { MarkerPoint, MarkerPolygon, MarkersFile } from '@/types/map.type'

type Props = {
	markersFile: MarkersFile | null
	setMarkersFile: (file: MarkersFile) => void
	fullMaxLevel: number
}

type Selection = {
	id: number | string
	polygon: boolean
	clusterId?: number
	groupId?: number
}

type EditorMode = 'select' | 'marker' | 'polygon'

type Coordinates = { lat: number; lng: number }

type TargetGroup = { clusterId: number; groupId: number }

function getObjectName(
	value: { popup?: string; label?: string },
	fallback: string
) {
	return value.popup?.trim() || value.label?.trim() || fallback
}

const newId = () => Date.now() + Math.floor(Math.random() * 1000)

function findMarker(data: MarkersFile | null, selection: Selection | null) {
	if (!selection || selection.polygon) return null
	for (const cluster of data?.markers_clusters ?? [])
		for (const group of cluster.markers) {
			const marker = group.markers.find(
				(item) => String(item.id) === String(selection.id)
			)
			if (marker) return marker
		}
	return null
}

function findPolygon(data: MarkersFile | null, selection: Selection | null) {
	if (!selection?.polygon) return null
	for (const cluster of data?.markers_clusters ?? [])
		for (const group of cluster.markers) {
			const polygon = group.polygons?.find(
				(item) => String(item.id) === String(selection.id)
			)
			if (polygon) return polygon
		}
	return null
}

function getTargetGroup(
	file: MarkersFile
): { clusterId: number; groupId: number } | null {
	const cluster = file.markers_clusters?.[0]
	const group = cluster?.markers[0]
	return cluster && group
		? { clusterId: cluster.id, groupId: group.id }
		: null
}

function addToGroup(
	file: MarkersFile,
	target: TargetGroup | null,
	marker?: MarkerPoint,
	polygon?: MarkerPolygon
) {
	if (!target) return file
	const next = structuredClone(file)
	const group = next.markers_clusters
		?.find((item) => item.id === target.clusterId)
		?.markers.find((item) => item.id === target.groupId)
	if (!group) return file
	if (marker) group.markers.push(marker)
	if (polygon) (group.polygons ??= []).push(polygon)
	return next
}

export default function MarkerEditor({
	markersFile,
	setMarkersFile,
	fullMaxLevel,
}: Props) {
	const map = useMap()
	const [enabled, setEnabled] = useState(false)
	const [mode, setMode] = useState<EditorMode>('select')
	const [selection, setSelection] = useState<Selection | null>(null)
	const [polygonDraft, setPolygonDraft] = useState<Coordinates[]>([])
	const [message, setMessage] = useState('')
	const [targetGroup, setTargetGroup] = useState<TargetGroup | null>(null)
	const [mounted, setMounted] = useState(false)
	const [newCategoryName, setNewCategoryName] = useState('')
	const [newCategoryIcon, setNewCategoryIcon] = useState('')
	const selectedMarker = useMemo(
		() => findMarker(markersFile, selection),
		[markersFile, selection]
	)
	const selectedPolygon = useMemo(
		() => findPolygon(markersFile, selection),
		[markersFile, selection]
	)
	const groups = useMemo(
		() =>
			(markersFile?.markers_clusters ?? []).flatMap((cluster) =>
				cluster.markers.map((group) => ({ cluster, group }))
			),
		[markersFile]
	)
	const groupOptions = useMemo<ComboboxOption[]>(
		() =>
			groups.map(({ cluster, group }) => ({
				value: `${cluster.id}:${group.id}`,
				label: `${cluster.name?.ru ?? cluster.slug ?? cluster.id} / ${group.name?.ru ?? group.settings.name ?? group.slug}`,
			})),
		[groups]
	)
	const effectiveTarget =
		targetGroup ?? (markersFile ? getTargetGroup(markersFile) : null)

	useEffect(() => setMounted(true), [])
	const selectedGroupIcon = useMemo(() => {
		if (!selection || selection.polygon) return undefined
		for (const cluster of markersFile?.markers_clusters ?? [])
			for (const group of cluster.markers)
				if (
					cluster.id === selection.clusterId &&
					group.id === selection.groupId
				)
					return group.settings.image
		return undefined
	}, [markersFile, selection])

	// biome-ignore lint/correctness/useExhaustiveDependencies: handler captures the selected polygon state
	useEffect(() => {
		map.getContainer().classList.toggle('map-editor-mode', enabled)
		const onMarker = (event: Event) => {
			if (!enabled || mode !== 'select') return
			const detail = (event as CustomEvent<Selection>).detail
			setSelection({ ...detail, polygon: false })
			setMessage('Метка выбрана')
		}
		const onPolygon = (event: Event) => {
			if (!enabled || mode !== 'select') return
			const detail = (
				event as CustomEvent<{ polygonId: number | string }>
			).detail
			setSelection({ id: detail.polygonId, polygon: true })
			setMessage('Полигон выбран')
		}
		const onPolygonPoints = (event: Event) => {
			const detail = (
				event as CustomEvent<{
					polygonId: number | string
					points: Coordinates[]
				}>
			).detail
			if (!enabled || String(selection?.id) !== String(detail.polygonId))
				return
			updatePolygon({ points: detail.points })
			setMessage('Вершины полигона обновлены')
		}
		window.addEventListener('map-calibration-marker', onMarker)
		window.addEventListener('map-editor-polygon', onPolygon)
		window.addEventListener('map-editor-polygon-points', onPolygonPoints)
		return () => {
			map.getContainer().classList.remove('map-editor-mode')
			window.removeEventListener('map-calibration-marker', onMarker)
			window.removeEventListener('map-editor-polygon', onPolygon)
			window.removeEventListener(
				'map-editor-polygon-points',
				onPolygonPoints
			)
		}
	}, [enabled, map, mode, selection?.id])

	useMapEvents({
		click(event) {
			if (!enabled) return
			if (mode === 'marker') {
				if (!markersFile || !effectiveTarget) {
					setMessage('Сначала добавь хотя бы одну группу маркеров')
					return
				}
				const point = map.project(event.latlng, fullMaxLevel)
				const marker: MarkerPoint = {
					id: newId(),
					coordinates: { lat: point.y, lng: point.x },
					popup: 'Новая метка',
				}
				setMarkersFile(addToGroup(markersFile, effectiveTarget, marker))
				setMode('select')
				setMessage('Метка создана в выбранной категории')
				return
			}
			if (mode === 'polygon') {
				const point = map.project(event.latlng, fullMaxLevel)
				setPolygonDraft((current) => [
					...current,
					{ lat: point.y, lng: point.x },
				])
			}
		},
	})

	const updateMarker = (
		patch: Partial<MarkerPoint>,
		applyToGroup = false
	) => {
		if (!markersFile || !selectedMarker || !selection) return
		const next = structuredClone(markersFile)
		for (const cluster of next.markers_clusters ?? [])
			for (const group of cluster.markers) {
				if (
					applyToGroup &&
					group.id === selection.groupId &&
					cluster.id === selection.clusterId
				) {
					if (patch.iconUrl !== undefined)
						group.settings.image = patch.iconUrl
					for (const marker of group.markers) {
						const markerPatch = { ...patch }
						delete markerPatch.iconUrl
						Object.assign(marker, markerPatch)
					}
				} else {
					const marker = group.markers.find(
						(item) => String(item.id) === String(selection.id)
					)
					if (marker) Object.assign(marker, patch)
				}
			}
		setMarkersFile(next)
	}

	const updatePolygon = (patch: Partial<MarkerPolygon>) => {
		if (!markersFile || !selectedPolygon || !selection) return
		const next = structuredClone(markersFile)
		for (const cluster of next.markers_clusters ?? [])
			for (const group of cluster.markers)
				for (const polygon of group.polygons ?? [])
					if (String(polygon.id) === String(selection.id))
						Object.assign(polygon, patch)
		setMarkersFile(next)
	}

	const updateGroupIcon = (iconUrl: string) => {
		if (!markersFile || !selection || selection.polygon) return
		const next = structuredClone(markersFile)
		for (const cluster of next.markers_clusters ?? [])
			for (const group of cluster.markers)
				if (
					group.id === selection.groupId &&
					cluster.id === selection.clusterId
				) {
					group.settings.image = iconUrl
					for (const marker of group.markers) delete marker.iconUrl
				}
		setMarkersFile(next)
	}

	const deleteSelection = () => {
		if (!markersFile || !selection) return
		const next = structuredClone(markersFile)
		for (const cluster of next.markers_clusters ?? [])
			for (const group of cluster.markers) {
				if (selection.polygon)
					group.polygons = group.polygons?.filter(
						(item) => String(item.id) !== String(selection.id)
					)
				else
					group.markers = group.markers.filter(
						(item) => String(item.id) !== String(selection.id)
					)
			}
		setMarkersFile(next)
		setSelection(null)
		setMessage('Объект удалён')
	}

	const finishPolygon = () => {
		if (!markersFile || polygonDraft.length < 3) {
			setMessage('Для полигона нужно минимум 3 точки')
			return
		}
		const polygon: MarkerPolygon = {
			id: newId(),
			points: polygonDraft,
			popup: 'Новый полигон',
			color: '#58a6ff',
			fillColor: '#58a6ff',
		}
		setMarkersFile(
			addToGroup(markersFile, effectiveTarget, undefined, polygon)
		)
		setPolygonDraft([])
		setMode('select')
		setMessage('Полигон создан в выбранной категории')
	}

	const download = () => {
		if (!markersFile) return
		const blob = new Blob([JSON.stringify(markersFile, null, 2)], {
			type: 'application/json',
		})
		const url = URL.createObjectURL(blob)
		const link = document.createElement('a')
		link.href = url
		link.download = 'markers-edited.json'
		link.click()
		URL.revokeObjectURL(url)
		setMessage('Файл markers-edited.json скачан')
	}

	const createCategory = () => {
		if (!markersFile || !newCategoryName.trim()) return
		const next = structuredClone(markersFile)
		const cluster = next.markers_clusters?.[0]
		if (!cluster) return
		const id = newId()
		cluster.markers.push({
			id,
			slug:
				newCategoryName
					.trim()
					.toLowerCase()
					.replace(/[^a-zа-яё0-9]+/gi, '-')
					.replace(/^-|-$/g, '') || `category-${id}`,
			name: { ru: newCategoryName.trim() },
			settings: {
				name: newCategoryName.trim(),
				image: newCategoryIcon.trim() || undefined,
			},
			markers: [],
		})
		setMarkersFile(next)
		setTargetGroup({ clusterId: cluster.id, groupId: id })
		setNewCategoryName('')
		setNewCategoryIcon('')
		setMessage('Категория создана и выбрана')
	}

	const selectObject = (object: Selection) => {
		setMode('select')
		setSelection(object)
		setMessage(
			object.polygon
				? 'Полигон выбран в списке'
				: 'Метка выбрана в списке'
		)
	}

	const editor = (
		<div className="flex w-full flex-col gap-2 border-primary/20 border-t-2 pt-3 text-xs">
			<Button
				onClick={() => {
					setEnabled((value) => !value)
					setMode('select')
					setSelection(null)
					setPolygonDraft([])
				}}
				type="button"
				variant="primary"
			>
				{enabled
					? 'Закончить редактирование'
					: 'Открыть редактор карты'}
			</Button>
			{enabled && (
				<>
					<details open>
						<summary className="cursor-pointer font-semibold">
							Объекты
						</summary>
						<div className="mt-2 flex max-h-64 flex-col gap-2 overflow-y-auto">
							{groups.map(({ cluster, group }) => (
								<div
									className="rounded border border-primary/20 p-2"
									key={`${cluster.id}:${group.id}`}
								>
									<button
										className="w-full text-left font-semibold"
										onClick={() =>
											setTargetGroup({
												clusterId: cluster.id,
												groupId: group.id,
											})
										}
										type="button"
									>
										{group.name?.ru ??
											group.settings.name ??
											group.slug}{' '}
										(
										{group.markers.length +
											(group.polygons?.length ?? 0)}
										)
									</button>
									<div className="mt-1 flex flex-col gap-1 pl-2">
										{group.markers.map((marker, index) => (
											<button
												className="truncate text-left text-[11px] hover:text-primary"
												key={String(marker.id ?? index)}
												onClick={() =>
													selectObject({
														id: marker.id ?? index,
														clusterId: cluster.id,
														groupId: group.id,
														polygon: false,
													})
												}
												type="button"
											>
												📍{' '}
												{getObjectName(
													marker,
													`Метка ${index + 1}`
												)}
											</button>
										))}
										{(group.polygons ?? []).map(
											(polygon, index) => (
												<button
													className="truncate text-left text-[11px] hover:text-primary"
													key={String(
														polygon.id ?? index
													)}
													onClick={() =>
														selectObject({
															id:
																polygon.id ??
																index,
															clusterId:
																cluster.id,
															groupId: group.id,
															polygon: true,
														})
													}
													type="button"
												>
													⬡{' '}
													{getObjectName(
														polygon,
														`Полигон ${index + 1}`
													)}{' '}
													({polygon.points.length})
												</button>
											)
										)}
									</div>
								</div>
							))}
						</div>
					</details>
					<details>
						<summary className="cursor-pointer font-semibold">
							Создать категорию
						</summary>
						<div className="mt-2 flex flex-col gap-1">
							<Input
								onChange={(event) =>
									setNewCategoryName(event.target.value)
								}
								placeholder="Название"
								value={newCategoryName}
							/>
							<Input
								onChange={(event) =>
									setNewCategoryIcon(event.target.value)
								}
								placeholder="URL иконки (необязательно)"
								value={newCategoryIcon}
							/>
							<Button
								disabled={!newCategoryName.trim()}
								onClick={createCategory}
								size="sm"
								type="button"
								variant="secondary"
							>
								Создать категорию
							</Button>
						</div>
					</details>
					<div className="flex flex-col gap-1">
						<span className="font-semibold">
							Категория для создания
						</span>
						<Combobox
							className="w-full"
							emptyText="Ничего не найдено"
							onValueChange={(value) => {
								const [clusterId, groupId] = value
									.split(':')
									.map(Number)
								setTargetGroup({ clusterId, groupId })
							}}
							options={groupOptions}
							placeholder="Выбери категорию"
							searchPlaceholder="Поиск категории"
							translateOptions={false}
							value={
								effectiveTarget
									? `${effectiveTarget.clusterId}:${effectiveTarget.groupId}`
									: ''
							}
						/>
					</div>
					<div className="grid grid-cols-3 gap-1">
						{(
							[
								['select', 'Выбор'],
								['marker', 'Новая метка'],
								['polygon', 'Новый полигон'],
							] as const
						).map(([value, label]) => (
							<Button
								disabled={mode === value}
								key={value}
								onClick={() => {
									setMode(value)
									setSelection(null)
									if (value !== 'polygon') setPolygonDraft([])
								}}
								size="sm"
								type="button"
								variant="secondary"
							>
								{label}
							</Button>
						))}
					</div>
					{mode === 'marker' && (
						<p>
							Кликни по карте, чтобы создать метку. Она попадёт в
							выбранную категорию.
						</p>
					)}
					{mode === 'polygon' && (
						<>
							<p>
								Кликай по карте, чтобы добавить вершины:{' '}
								{polygonDraft.length}.
							</p>
							<div className="flex gap-1">
								<Button
									disabled={polygonDraft.length < 3}
									onClick={finishPolygon}
									size="sm"
									type="button"
									variant="primary"
								>
									Завершить полигон
								</Button>
								<Button
									onClick={() => setPolygonDraft([])}
									size="sm"
									type="button"
									variant="secondary"
								>
									Сбросить
								</Button>
							</div>
						</>
					)}
					{mode === 'select' && (
						<p>
							Выбери метку или полигон кликом по объекту. Для
							полигона сначала нажми по его заливке, затем
							используй кнопку редактирования вершин.
						</p>
					)}
					{selectedMarker && (
						<>
							<label>
								Текст popup
								<input
									className="w-full rounded border bg-background px-2 py-1"
									onChange={(event) =>
										updateMarker({
											popup: event.target.value,
										})
									}
									value={selectedMarker.popup ?? ''}
								/>
							</label>
							<label>
								URL иконки всей группы
								<input
									className="w-full rounded border bg-background px-2 py-1"
									onChange={(event) =>
										updateGroupIcon(event.target.value)
									}
									value={
										selectedGroupIcon ??
										selectedMarker.iconUrl ??
										''
									}
								/>
							</label>
							<label>
								URL картинки popup
								<input
									className="w-full rounded border bg-background px-2 py-1"
									onChange={(event) =>
										updateMarker({
											popupImage: event.target.value,
										})
									}
									value={selectedMarker.popupImage ?? ''}
								/>
							</label>
						</>
					)}
					{selectedPolygon && (
						<>
							<label>
								Текст полигона
								<textarea
									className="w-full rounded border bg-background px-2 py-1"
									onChange={(event) =>
										updatePolygon({
											popup: event.target.value,
										})
									}
									value={selectedPolygon.popup ?? ''}
								/>
							</label>
							<label>
								Цвет
								<input
									className="h-8 w-full rounded border bg-background px-2 py-1"
									onChange={(event) =>
										updatePolygon({
											color: event.target.value,
											fillColor: event.target.value,
										})
									}
									type="color"
									value={selectedPolygon.color ?? '#58a6ff'}
								/>
							</label>
							<button
								className="rounded bg-secondary px-2 py-1"
								onClick={() =>
									window.dispatchEvent(
										new CustomEvent(
											'map-editor-edit-polygon',
											{
												detail: {
													polygonId:
														selectedPolygon.id ??
														'',
												},
											}
										)
									)
								}
								type="button"
							>
								Редактировать вершины на карте
							</button>
							<p>
								Появятся синие точки-вершины. Перетаскивай их
								мышью. Для удаления вершины кликни по ней правой
								кнопкой. Минимум — 3 вершины.
							</p>
						</>
					)}
					{(selectedMarker || selectedPolygon) && (
						<button
							className="rounded bg-destructive px-2 py-1 text-destructive-foreground"
							onClick={deleteSelection}
							type="button"
						>
							Удалить выбранный объект
						</button>
					)}
					<button
						className="rounded bg-secondary px-2 py-1"
						onClick={download}
						type="button"
					>
						Скачать JSON
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
