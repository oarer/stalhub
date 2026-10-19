export type Preparation = {
	world: {
		selected: number
		loaded: number
		failed: number
		readyBytes?: number
		horizon?: {
			wanted: number
			ready: number
			active: number
			failed: number
		}
		objects?: {
			chunks: number
			completedChunks: number
			publishedChunks: number
			activeChunks: number
			queuedChunks: number
			active: number
			waiting: number
			objects: number
			templates: number
		}
		textures?: {
			firstActive: number
			firstQueued: number
			refining: number
			resident: number
		}
		cacheHits?: number
	}
	network: {
		requests: number
		transferBytes: number
		httpCacheHits: number
		groups: Record<string, { requests: number; transferBytes: number }>
	}
	elapsedMs: number
}
export function preparationComplete(p: Preparation | undefined) {
	if (!p?.world.selected || p.world.failed) return false
	const w = p.world,
		o = w.objects,
		t = w.textures,
		h = w.horizon
	return (
		!w.readyBytes &&
		w.loaded === w.selected &&
		!!o &&
		o.chunks >= w.selected &&
		o.completedChunks === o.chunks &&
		!o.activeChunks &&
		!o.queuedChunks &&
		!o.active &&
		!o.waiting &&
		!!t &&
		!t.firstActive &&
		!t.firstQueued &&
		!!h &&
		h.ready === h.wanted &&
		!h.active &&
		!h.failed
	)
}
export const preloadGroups: Record<string, string> = {
	map: '2D-карта выбора места',
	horizon: 'Дальний обзор',
	middle: 'Промежуточные LOD',
	terrain: 'Блоки и ландшафт',
	objects: 'Размещение объектов',
	models: 'Модели объектов',
	textures: 'Текстуры',
	lighting: 'Небо и освещение',
	effects: 'Эффекты',
	metadata: 'Каталог ресурсов',
	app: 'Движок',
}
export function trafficLabel(bytes: number) {
	return bytes < 1024 ** 2
		? `${(bytes / 1024).toFixed(0)} КБ`
		: `${(bytes / 1024 ** 2).toFixed(1)} МБ`
}

export type PreparationTraffic = Preparation['network']
export function sumPreparationTraffic(
	...sources: (PreparationTraffic | undefined)[]
): PreparationTraffic {
	const total: PreparationTraffic = {
		requests: 0,
		transferBytes: 0,
		httpCacheHits: 0,
		groups: {},
	}
	for (const source of sources)
		if (source) {
			total.requests += source.requests
			total.transferBytes += source.transferBytes
			total.httpCacheHits += source.httpCacheHits
			for (const [key, g] of Object.entries(source.groups)) {
				let row = total.groups[key]
				if (!row) {
					row = { requests: 0, transferBytes: 0 }
					total.groups[key] = row
				}
				row.requests += g.requests
				row.transferBytes += g.transferBytes
			}
		}
	return total
}
