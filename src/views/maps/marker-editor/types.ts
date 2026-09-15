export type Vec2 = { x: number; y: number }

export type TileBounds = {
	minX: number
	maxX: number
	minZ: number
	maxZ: number
}

export type MapTileSize = { tilesX: number; tilesZ: number }

export type MapDef = {
	id: string
	name: string
	tileCount: number
	extension: string
	bounds: TileBounds
	size: MapTileSize
}

export type StaticTileCoord = { x: number; z: number }

export type StaticManifest = {
	map: MapDef
	tiles: StaticTileCoord[]
}

export type ActiveMap = MapDef & { tileKeys: Set<string> }

export type CoordConfig = {
	scale: number
	offsetX: number
	offsetZ: number
	invertZ: boolean
}

export type WaypointPos = { x: number; y: number; z: number }

export type ColorInfo = {
	argb: number
	a: number
	r: number
	g: number
	b: number
	hex: string
}

export type CfgWaypointRaw = {
	color?: number | ColorInfo | null
	colorRaw?: number
	can_position_float?: boolean
	canPositionFloat?: boolean
	time?: number
	icon_index?: number
	iconIndex?: number
	pos?: Partial<WaypointPos>
	name?: string
	type?: string
}

export type DisplayWaypoint = {
	id: number
	name: string
	iconIndex: number
	iconName: string
	colorRaw: number
	color: ColorInfo
	type: string
	canPositionFloat: boolean
	time: number
	fromBuffer: boolean
	pos: WaypointPos
}

export type GeneratedMarker = {
	px: number
	py: number
	nx: number
	ny: number
	area: number
	r: number
	g: number
	b: number
	colorHex: string
	iconIndex?: number
}

export type GeneratedState = {
	fileName: string
	width: number
	height: number
	markers: GeneratedMarker[]
	markerRows: GeneratedMarker[][]
	resolution: number
	centerTileX: number
	centerTileZ: number
	scaleTiles: number
	iconIndex: number
	useAutoIcons: boolean
}

export type PixelBounds = {
	minX: number
	minY: number
	maxX: number
	maxY: number
}

export type ImageEntry = {
	image: HTMLImageElement
	ready: boolean
	failed: boolean
}

export type EditablePoint = {
	id: string
	kind: 'wp' | 'staged' | 'gen'
	waypoint?: DisplayWaypoint
	marker?: GeneratedMarker
	mapPos: Vec2
}

export type CameraState = { scale: number; x: number; y: number }

export type CameraDragState = {
	active: boolean
	startX: number
	startY: number
	cameraX: number
	cameraY: number
}

export type SelectionBoxState = {
	active: boolean
	startMapPx: number
	startMapPy: number
	currentMapPx: number
	currentMapPy: number
	append: boolean
}

export type SelectionSnapshotItem = {
	id: string
	kind: 'wp' | 'staged' | 'gen'
	waypoint?: DisplayWaypoint
	marker?: GeneratedMarker
	x: number
	z: number
	nx?: number
	ny?: number
}

export type SelectionDragState = {
	active: boolean
	startMapPx: number
	startMapPy: number
	snapshot: SelectionSnapshotItem[]
}

export type TileLoadState = { total: number; done: number; inProgress: boolean }

export type WaypointIndexEntry = {
	waypoint: DisplayWaypoint
	x: number
	y: number
	color: string
	iconIndex: number
}

export type WaypointIndex = {
	dirty: boolean
	chunkSizePx: number
	chunks: Map<string, WaypointIndexEntry[]>
	entries: WaypointIndexEntry[]
}

export type PerfStats = {
	selected: number
	zoom: number
	highPerfMode: boolean
	tilesVisible: number
	tilesReady: number
	tilesLoading: number
	tilesFailed: number
	generatedVisible: number
	waypointsVisible: number
	waypointsChecked: number
	generatedCandidates: number
	generatedRows: number
	waypointTinted: number
	waypointFallback: number
	gridLines: number
	selectionRings: number
	selectionBoxActive: boolean
	tClear: number
	tTiles: number
	tGrid: number
	tGenerated: number
	tWaypoints: number
	tSelection: number
	qualityMode: string
}

export type PerfState = {
	lastDrawMs: number
	avgDrawMs: number
	drawCallsWindow: number
	fps: number
	fpsWindowStartedAt: number
	stats: PerfStats
	text: string
	nextOverlayAt: number
}

export type EditorStore = {
	map: ActiveMap | null
	waypoints: DisplayWaypoint[]
	stagedWaypoints: DisplayWaypoint[]
	generated: GeneratedState | null
	selectedIds: Set<string>
	coordCfg: CoordConfig
	highPerfMode: boolean
	centerTile: { tileX: number; tileZ: number }
	zoom: number
	dragSnapshot: Map<string, { tileX: number; tileZ: number }>
	settings: {
		sourceWidth: number
		sourceHeight: number
		aspect: number
		aspectLocked: boolean
		targetWidth: number
		targetHeight: number
		stickerScale: number
		iconIndex: number
		autoIcons: boolean
	}
	cfgSource: {
		name: string
		loaded: boolean
	}
	genStats: string
	cfgStatus: string
	loadStats: string
}

export type WaypointRow = {
	key: string
	buffer: boolean
	name: string
	iconIndex: number
	iconName: string
	colorHex: string
	x: number
	y: number
	z: number
	tileX: number
	tileZ: number
	selected: boolean
}

export type RenderPoint = {
	id: string
	kind: 'wp' | 'staged' | 'gen'
	name: string
	tileX: number
	tileZ: number
	colorHex: string
	iconIndex: number
	selected: boolean
	buffer: boolean
}

export type UiSnapshot = {
	mapName: string
	mapStats: string[]
	loadStats: string
	sourceNote: string
	targetWidth: number
	targetHeight: number
	aspectLocked: boolean
	stickerScale: number
	iconIndex: number
	autoIcons: boolean
	highPerf: boolean
	invertZ: boolean
	zoom: number
	genStats: string
	cfgStatus: string
	generated: boolean
	hasImage: boolean
	waypoints: WaypointRow[]
	points: RenderPoint[]
	waypointTotal: number
	selectedCount: number
}
