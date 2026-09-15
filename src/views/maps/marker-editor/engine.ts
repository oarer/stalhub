import { DEFAULT_COORD_CONFIG } from './constants'
import {
	applyIconStrategyToMarkers,
	buildMarkerRows,
	clampTargetDimension,
	generateUniformMarkers,
	loadImageFromFile,
	prepareImageData,
} from './lib/generation'
import { getGeneratedMarkerTile, waypointToTile } from './lib/geometry'
import { IconStore } from './lib/icons'
import {
	downloadJson,
	parseCfgText,
	reindexWaypointCollection,
	toCfgWaypoint,
	toDisplayWaypoint,
} from './lib/waypoints'
import type {
	CfgWaypointRaw,
	DisplayWaypoint,
	EditorStore,
	GeneratedMarker,
	GeneratedState,
	RenderPoint,
	UiSnapshot,
	WaypointRow,
} from './types'

// thx TeamDima

function createStore(): EditorStore {
	return {
		map: null,
		waypoints: [],
		stagedWaypoints: [],
		generated: null,
		selectedIds: new Set(),
		coordCfg: { ...DEFAULT_COORD_CONFIG },
		highPerfMode: false,
		centerTile: { tileX: 0, tileZ: 0 },
		zoom: 4,
		dragSnapshot: new Map(),
		settings: {
			sourceWidth: 0,
			sourceHeight: 0,
			aspect: 1,
			aspectLocked: true,
			targetWidth: 100,
			targetHeight: 100,
			stickerScale: 1,
			iconIndex: 0,
			autoIcons: true,
		},
		cfgSource: { name: '', loaded: false },
		genStats: 'Нет сгенерированных меток',
		cfgStatus: 'CFG: не выбран (нажми "Выбрать CFG")',
		loadStats: 'Ожидание загрузки...',
	}
}

export class MarkerEditorEngine {
	readonly store: EditorStore
	readonly icons: IconStore

	onUi: ((snapshot: UiSnapshot) => void) | null = null
	onPerf: ((text: string) => void) | null = null

	private lastImageFile: File | null = null
	private lastUiSync = 0
	private dragAnchorId: string | null = null

	constructor() {
		this.store = createStore()
		this.icons = new IconStore()
		this.icons.onRedraw = () => this.syncUi()
	}

	syncUi(): void {
		this.onUi?.(this.buildSnapshot())
		this.onPerf?.(this.buildPerfText())
	}

	syncUiThrottled(): void {
		const now = performance.now()
		if (now - this.lastUiSync < 120) return
		this.lastUiSync = now
		this.syncUi()
	}

	onViewChange(lat: number, lng: number, zoom: number): void {
		this.store.zoom = zoom
		this.store.centerTile = {
			tileX: lng,
			tileZ: this.store.coordCfg.invertZ ? lat : -lat,
		}
		this.syncUiThrottled()
	}

	clearSelection(): void {
		if (!this.store.selectedIds.size) return
		this.store.selectedIds.clear()
		this.syncUi()
	}

	selectPoint(id: string, append: boolean): void {
		if (append) {
			if (this.store.selectedIds.has(id)) {
				this.store.selectedIds.delete(id)
			} else {
				this.store.selectedIds.add(id)
			}
		} else if (
			this.store.selectedIds.size > 1 ||
			!this.store.selectedIds.has(id)
		) {
			this.store.selectedIds.clear()
			this.store.selectedIds.add(id)
		}
		this.syncUi()
	}

	selectIds(ids: readonly string[], append: boolean): void {
		if (append) {
			for (const id of ids) {
				if (!this.store.selectedIds.has(id)) {
					this.store.selectedIds.add(id)
				}
			}
		} else {
			this.store.selectedIds = new Set(ids)
		}
		this.syncUi()
	}

	dragStart(id: string): void {
		const snapshot = new Map<string, { tileX: number; tileZ: number }>()
		for (const point of this.buildPoints()) {
			if (this.store.selectedIds.has(point.id)) {
				snapshot.set(point.id, {
					tileX: point.tileX,
					tileZ: point.tileZ,
				})
			}
		}
		this.store.dragSnapshot = snapshot
		this.dragAnchorId = id
	}

	dragTo(tileX: number, tileZ: number): void {
		const anchorId = this.dragAnchorId
		if (!anchorId) return
		const anchor = this.store.dragSnapshot.get(anchorId)
		if (!anchor) return

		const deltaTileX = tileX - anchor.tileX
		const deltaTileZ = tileZ - anchor.tileZ
		for (const [id, start] of this.store.dragSnapshot) {
			this.movePoint(
				id,
				start.tileX + deltaTileX,
				start.tileZ + deltaTileZ
			)
		}
		this.syncUiThrottled()
	}

	dragEnd(): void {
		this.dragAnchorId = null
		this.store.dragSnapshot.clear()
		this.syncUi()
	}

	private movePoint(id: string, tileX: number, tileZ: number): void {
		const coordCfg = this.store.coordCfg

		if (id.startsWith('wp:') || id.startsWith('staged:')) {
			const waypoint = this.findWaypointById(id)
			if (!waypoint) return
			waypoint.pos.x = (tileX - coordCfg.offsetX) * coordCfg.scale
			waypoint.pos.z = (tileZ - coordCfg.offsetZ) * coordCfg.scale
			return
		}

		if (id.startsWith('gen:') && this.store.generated) {
			const generated = this.store.generated
			const index = Number(id.slice(4))
			const marker = generated.markers[index]
			if (!marker) return
			const scaleX = Math.max(0.0001, generated.scaleTiles)
			const scaleZ = Math.max(
				0.0001,
				generated.scaleTiles * (generated.height / generated.width)
			)
			marker.nx = (tileX - generated.centerTileX) / scaleX
			marker.ny = (tileZ - generated.centerTileZ) / scaleZ
		}
	}

	private findWaypointById(id: string): DisplayWaypoint | null {
		if (id.startsWith('wp:')) {
			return (
				this.store.waypoints.find((wp) => `wp:${wp.id}` === id) ?? null
			)
		}
		if (id.startsWith('staged:')) {
			return (
				this.store.stagedWaypoints.find(
					(wp) => `staged:${wp.id}` === id
				) ?? null
			)
		}
		return null
	}

	private buildPoints(): RenderPoint[] {
		const s = this.store
		const points: RenderPoint[] = []

		for (const wp of s.waypoints) {
			const tile = waypointToTile(s.coordCfg, wp)
			points.push({
				id: `wp:${wp.id}`,
				kind: 'wp',
				name: wp.name,
				tileX: tile.x,
				tileZ: tile.z,
				colorHex: wp.color?.hex || '#ff8b5e',
				iconIndex: wp.iconIndex ?? 0,
				selected: s.selectedIds.has(`wp:${wp.id}`),
				buffer: false,
			})
		}

		for (const wp of s.stagedWaypoints) {
			const tile = waypointToTile(s.coordCfg, wp)
			const id = `staged:${wp.id}`
			points.push({
				id,
				kind: 'staged',
				name: wp.name,
				tileX: tile.x,
				tileZ: tile.z,
				colorHex: wp.color?.hex || '#ff8b5e',
				iconIndex: wp.iconIndex ?? 0,
				selected: s.selectedIds.has(id),
				buffer: true,
			})
		}

		const generated = s.generated
		if (generated?.markers?.length) {
			for (let i = 0; i < generated.markers.length; i += 1) {
				const marker = generated.markers[i]
				const tile = getGeneratedMarkerTile(generated, marker)
				const id = `gen:${i}`
				points.push({
					id,
					kind: 'gen',
					name: '',
					tileX: tile.tileX,
					tileZ: tile.tileZ,
					colorHex: marker.colorHex,
					iconIndex: generated.useAutoIcons
						? (marker.iconIndex ?? generated.iconIndex)
						: generated.iconIndex,
					selected: s.selectedIds.has(id),
					buffer: false,
				})
			}
		}

		return points
	}

	async setSourceImage(file: File): Promise<void> {
		this.lastImageFile = file
		try {
			const image = await loadImageFromFile(file)
			const srcW = Math.max(1, image.naturalWidth || image.width || 1)
			const srcH = Math.max(1, image.naturalHeight || image.height || 1)
			this.store.settings.sourceWidth = srcW
			this.store.settings.sourceHeight = srcH
			this.store.settings.aspect = srcW / srcH

			if (this.store.settings.aspectLocked) {
				this.applyTargetWidth(this.store.settings.targetWidth)
			}
		} catch (error) {
			this.store.settings.sourceWidth = 0
			this.store.settings.sourceHeight = 0
			this.store.genStats = `Источник: ошибка (${(error as Error).message})`
		}
		this.syncUi()
	}

	async generateFromImage(): Promise<void> {
		const file = this.lastImageFile
		if (!file) {
			this.store.genStats = 'Выбери картинку для генерации'
			this.syncUi()
			return
		}

		const target = {
			width: this.store.settings.targetWidth,
			height: this.store.settings.targetHeight,
		}
		const fixedIconIndex = this.store.settings.iconIndex
		const useAutoIcons = this.store.settings.autoIcons

		this.store.genStats = 'Генерация: равномерный посев точек...'
		this.syncUi()

		try {
			const image = await loadImageFromFile(file)
			const imageData = prepareImageData(
				image,
				target.width,
				target.height
			)
			const markers = generateUniformMarkers(imageData, {
				useAutoIcons,
				fixedIconIndex,
			})

			const center = this.store.centerTile
			this.store.generated = {
				fileName: file.name,
				width: imageData.width,
				height: imageData.height,
				markers,
				markerRows: buildMarkerRows(
					imageData.width,
					imageData.height,
					markers
				),
				resolution: target.width,
				centerTileX: center.tileX,
				centerTileZ: center.tileZ,
				scaleTiles: Math.max(
					0.2,
					this.store.settings.stickerScale || 1
				),
				iconIndex: fixedIconIndex,
				useAutoIcons,
			}

			this.store.genStats = `Готово: ${markers.length} меток, рендер ${imageData.width}x${imageData.height}`
			this.syncUi()
		} catch (error) {
			this.store.genStats = `Ошибка генерации: ${(error as Error).message}`
			this.syncUi()
		}
	}

	bakeImageToBuffer(): void {
		const generated = this.store.generated
		if (!generated || !generated.markers.length) {
			this.store.genStats = 'Нечего запекать из картинки'
			this.syncUi()
			return
		}

		const data = this.buildGeneratedWaypoints(generated)
		const startIndex = this.store.stagedWaypoints.length
		for (let i = 0; i < data.length; i += 1) {
			this.store.stagedWaypoints.push(
				toDisplayWaypoint(data[i], startIndex + i, true)
			)
		}

		this.store.generated = null
		this.store.selectedIds.clear()
		this.store.genStats = `Запечено в буфер: +${data.length} (в буфере ${this.store.stagedWaypoints.length})`
		this.syncUi()
	}

	private buildGeneratedWaypoints(
		generated: GeneratedState
	): CfgWaypointRaw[] {
		const coordCfg = this.store.coordCfg
		const now = Date.now()
		const scaleX = generated.scaleTiles
		const scaleZ =
			generated.scaleTiles * (generated.height / generated.width)
		const useAutoIcons = generated.useAutoIcons

		return generated.markers.map((marker, index) => {
			const tileX = generated.centerTileX + marker.nx * scaleX
			const tileZ = generated.centerTileZ + marker.ny * scaleZ
			const worldX = (tileX - coordCfg.offsetX) * coordCfg.scale
			const worldZ = (tileZ - coordCfg.offsetZ) * coordCfg.scale
			const colorRaw =
				(255 << 24) | (marker.r << 16) | (marker.g << 8) | marker.b | 0

			return {
				color: colorRaw,
				can_position_float: true,
				time: now + index,
				icon_index: useAutoIcons
					? (marker.iconIndex ?? generated.iconIndex)
					: generated.iconIndex,
				pos: {
					x: Number(worldX.toFixed(3)),
					y: 70.0,
					z: Number(worldZ.toFixed(3)),
				},
				name: '',
				type: 'manual',
			}
		})
	}

	clearGenerated(): void {
		this.store.generated = null
		this.store.genStats = 'Нет сгенерированных меток'
		this.syncUi()
	}

	private refreshGeneratedIconStrategy(): void {
		const generated = this.store.generated
		if (!generated) return

		const useAutoIcons = this.store.settings.autoIcons
		const fixedIconIndex = this.store.settings.iconIndex
		generated.useAutoIcons = useAutoIcons
		generated.iconIndex = fixedIconIndex

		applyIconStrategyToMarkers(
			generated.markers,
			useAutoIcons,
			fixedIconIndex
		)
		this.syncUi()
	}

	setStickerScale(value: number): void {
		const scale = Math.max(0.2, Number(value) || 1)
		this.store.settings.stickerScale = scale
		if (this.store.generated) {
			this.store.generated.scaleTiles = scale
		}
		this.syncUi()
	}

	setIconIndex(value: number): void {
		this.store.settings.iconIndex = Math.max(
			0,
			Math.min(6, Math.round(Number(value) || 0))
		)
		this.refreshGeneratedIconStrategy()
	}

	setAutoIcons(value: boolean): void {
		this.store.settings.autoIcons = value
		this.refreshGeneratedIconStrategy()
	}

	setHighPerfMode(value: boolean): void {
		this.store.highPerfMode = value
		this.syncUi()
	}

	// ------------------------------------------------------------------
	// Target resolution
	// ------------------------------------------------------------------

	private applyTargetWidth(width: number): void {
		const w = clampTargetDimension(width)
		const settings = this.store.settings
		if (settings.aspectLocked) {
			settings.targetWidth = w
			settings.targetHeight = clampTargetDimension(
				w / Math.max(0.0001, settings.aspect)
			)
		} else {
			settings.targetWidth = w
		}
		this.syncUi()
	}

	private applyTargetHeight(height: number): void {
		const h = clampTargetDimension(height)
		const settings = this.store.settings
		if (settings.aspectLocked) {
			settings.targetHeight = h
			settings.targetWidth = clampTargetDimension(
				h * Math.max(0.0001, settings.aspect)
			)
		} else {
			settings.targetHeight = h
		}
		this.syncUi()
	}

	setTargetWidth(value: number): void {
		this.applyTargetWidth(value)
	}

	setTargetHeight(value: number): void {
		this.applyTargetHeight(value)
	}

	toggleAspectLock(): void {
		const settings = this.store.settings
		settings.aspectLocked = !settings.aspectLocked
		if (settings.aspectLocked) {
			this.applyTargetWidth(settings.targetWidth)
		} else {
			this.syncUi()
		}
	}

	// ------------------------------------------------------------------
	// Selection / deletion / cfg
	// ------------------------------------------------------------------

	deleteSelected(): void {
		if (!this.store.selectedIds.size) {
			this.store.genStats = 'Нет выделенных меток для удаления'
			this.syncUi()
			return
		}

		let removed = 0
		const selected = this.store.selectedIds

		const keptWaypoints: DisplayWaypoint[] = []
		for (const waypoint of this.store.waypoints) {
			const id = `wp:${waypoint.id}`
			if (selected.has(id)) {
				removed += 1
				continue
			}
			keptWaypoints.push(waypoint)
		}
		this.store.waypoints = keptWaypoints
		reindexWaypointCollection(this.store.waypoints)

		const keptStaged: DisplayWaypoint[] = []
		for (const waypoint of this.store.stagedWaypoints) {
			const id = `staged:${waypoint.id}`
			if (selected.has(id)) {
				removed += 1
				continue
			}
			keptStaged.push(waypoint)
		}
		this.store.stagedWaypoints = keptStaged
		reindexWaypointCollection(this.store.stagedWaypoints)

		const generated = this.store.generated
		if (generated?.markers?.length) {
			const keptMarkers: GeneratedMarker[] = []
			for (let i = 0; i < generated.markers.length; i += 1) {
				const id = `gen:${i}`
				if (selected.has(id)) {
					removed += 1
					continue
				}
				keptMarkers.push(generated.markers[i])
			}
			generated.markers = keptMarkers
			if (!generated.markers.length) {
				this.store.generated = null
			} else {
				generated.markerRows = buildMarkerRows(
					generated.width,
					generated.height,
					generated.markers
				)
			}
		}

		this.store.selectedIds.clear()
		this.store.genStats = `Удалено меток: ${removed}`
		this.syncUi()
	}

	private applyWaypointsFromRaw(
		raw: CfgWaypointRaw[],
		sourceLabel = ''
	): void {
		this.store.waypoints = raw.map((item, index) =>
			toDisplayWaypoint(item, index, false)
		)
		this.store.stagedWaypoints = []
		this.store.selectedIds.clear()
		this.store.cfgStatus = sourceLabel
			? `CFG: ${sourceLabel} (${this.store.waypoints.length} меток)`
			: `CFG: ${this.store.waypoints.length} меток`
		this.syncUi()
	}

	async pickCfgFile(file: File): Promise<void> {
		try {
			const text = await file.text()
			const raw = parseCfgText(text)
			this.store.cfgSource.name = file.name
			this.store.cfgSource.loaded = true
			this.applyWaypointsFromRaw(raw, file.name)
		} catch (error) {
			this.store.cfgStatus = `CFG: ошибка (${(error as Error).message})`
			this.syncUi()
		}
	}

	async bakeCfg(): Promise<void> {
		const payload = this.buildCfgPayload()
		downloadJson('waypoints.cfg', payload)
		this.store.cfgSource.name = 'downloads'
		this.store.cfgSource.loaded = true
		this.store.cfgStatus = `CFG: экспортирован в загрузки (${payload.length} меток)`

		this.store.stagedWaypoints = []
		this.store.selectedIds.clear()
		this.store.waypoints = payload.map((item, index) =>
			toDisplayWaypoint(item, index, false)
		)
		this.store.genStats = `Сохранено в cfg: ${payload.length} меток`
		this.syncUi()
	}

	private buildCfgPayload(): CfgWaypointRaw[] {
		const payload: CfgWaypointRaw[] = []
		const now = Date.now()
		let cursor = 0

		const push = (waypoint: DisplayWaypoint) => {
			payload.push(toCfgWaypoint(waypoint, now, cursor))
			cursor += 1
		}

		for (const waypoint of this.store.waypoints) push(waypoint)
		for (const waypoint of this.store.stagedWaypoints) push(waypoint)
		return payload
	}

	// ------------------------------------------------------------------
	// Keyboard
	// ------------------------------------------------------------------

	onKeyDown(event: KeyboardEvent): void {
		if (event.key === 'Escape') {
			if (this.store.selectedIds.size) {
				this.store.selectedIds.clear()
				this.syncUi()
			}
			return
		}

		if (event.key !== 'Delete' && event.key !== 'Backspace') return

		const active = document.activeElement
		const isTyping =
			active &&
			(active.tagName === 'INPUT' ||
				active.tagName === 'TEXTAREA' ||
				active.tagName === 'SELECT' ||
				(active as HTMLElement).isContentEditable)
		if (isTyping) return

		if (!this.store.selectedIds.size) return
		event.preventDefault()
		this.deleteSelected()
	}

	// ------------------------------------------------------------------
	// UI snapshot
	// ------------------------------------------------------------------

	private buildSnapshot(): UiSnapshot {
		const s = this.store
		const waypoints: WaypointRow[] = []
		const all = [...s.waypoints, ...s.stagedWaypoints]
		for (const wp of all) {
			const tile = waypointToTile(s.coordCfg, wp)
			const key = wp.fromBuffer ? `staged:${wp.id}` : `wp:${wp.id}`
			waypoints.push({
				key,
				buffer: wp.fromBuffer,
				name: wp.name,
				iconIndex: wp.iconIndex,
				iconName: wp.iconName,
				colorHex: wp.color?.hex || '#FFFFFF',
				x: wp.pos.x,
				y: wp.pos.y,
				z: wp.pos.z,
				tileX: tile.x,
				tileZ: tile.z,
				selected: s.selectedIds.has(key),
			})
		}

		const mapStats: string[] = []
		if (s.map) {
			const widthTiles = s.map.bounds.maxX - s.map.bounds.minX + 1
			const heightTiles = s.map.bounds.maxZ - s.map.bounds.minZ + 1
			mapStats.push(
				`Тайлов: ${s.map.tileCount}`,
				`Тип: .${s.map.extension}`,
				`X: ${s.map.bounds.minX}..${s.map.bounds.maxX}`,
				`Z: ${s.map.bounds.minZ}..${s.map.bounds.maxZ}`,
				`Сетка: ${widthTiles} x ${heightTiles}`
			)
		}

		const hasSource =
			s.settings.sourceWidth > 0 && s.settings.sourceHeight > 0

		return {
			mapName: s.map?.name ?? '',
			mapStats,
			loadStats: s.loadStats,
			sourceNote: hasSource
				? `Источник: ${s.settings.sourceWidth} x ${s.settings.sourceHeight}`
				: 'Оригинал: не загружен',
			targetWidth: s.settings.targetWidth,
			targetHeight: s.settings.targetHeight,
			aspectLocked: s.settings.aspectLocked,
			stickerScale: s.settings.stickerScale,
			iconIndex: s.settings.iconIndex,
			autoIcons: s.settings.autoIcons,
			highPerf: s.highPerfMode,
			invertZ: s.coordCfg.invertZ,
			zoom: s.zoom,
			genStats: s.genStats,
			cfgStatus: s.cfgStatus,
			generated: Boolean(s.generated && s.generated.markers.length),
			hasImage: Boolean(this.lastImageFile),
			waypoints,
			points: this.buildPoints(),
			waypointTotal: all.length,
			selectedCount: s.selectedIds.size,
		}
	}

	private buildPerfText(): string {
		const s = this.store
		const generatedCount = s.generated?.markers.length ?? 0
		return [
			`Зум: ${s.zoom.toFixed(2)}x`,
			`high-perf: ${s.highPerfMode ? 'on' : 'off'}`,
			`Метки: ${s.waypoints.length + s.stagedWaypoints.length}`,
			`В буфере: ${s.stagedWaypoints.length}`,
			`Gen: ${generatedCount}`,
			`Выделено: ${s.selectedIds.size}`,
		].join('\n')
	}
}
