import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
	findGameAssets,
	gameFolderFiles,
} from '../src/views/map3d/local-folder'
import {
	DEFAULT_EDITOR_SETTINGS,
	editorLocation,
	readEditorSettings,
} from '../src/views/map3d/settings'

test('editor settings reject corrupt storage and keep block/object presets independent', () => {
	const s = { ...DEFAULT_EDITOR_SETTINGS, blocks: 'low', objects: 'high' }
	assert.deepEqual(readEditorSettings(JSON.stringify(s)), s)
	for (const v of [
		'{bad',
		JSON.stringify({ ...s, cacheMB: 0 }),
		JSON.stringify({ ...s, blocks: 'ultra' }),
		JSON.stringify({ ...s, version: 2 }),
	])
		assert.equal(readEditorSettings(v), null)
	assert.equal(
		editorLocation(-9947.3, 3025.27),
		'/map/3d?x=-9947.3&z=3025.27'
	)
	assert.throws(() => editorLocation(NaN, 3))
	assert.throws(() => editorLocation(1, Infinity))
})
test('folder upload locates assets and never includes XEON', () => {
	const file = (name: string, path: string) => {
		const f = new File([new Uint8Array(32)], name)
		Object.defineProperty(f, 'webkitRelativePath', { value: path })
		return f
	}
	const result = gameFolderFiles([
		file(
			'blockMap.ta',
			'game/modassets/assets/stalcraft/textures/blockMap.ta'
		),
		file('configs.xeon', 'game/modassets/assets/configs.xeon'),
	])
	assert.equal(result.serverFallback, true)
	assert.deepEqual(
		result.files?.map((r) => r.path),
		['stalcraft/textures/blockMap.ta']
	)
	assert.throws(() => gameFolderFiles([file('x', 'game/x')]))
})
test('directory lookup reads only texture archive metadata and supports assets root', async () => {
	const opened: string[] = []
	const textures = {
		getFileHandle: async (name: string) => {
			opened.push(name)
			return { getFile: async () => ({ size: 32 }) }
		},
	}
	const stalcraft = {
		getDirectoryHandle: async (name: string) => {
			assert.equal(name, 'textures')
			return textures
		},
	}
	const root = {
		name: 'assets',
		getDirectoryHandle: async (name: string) => {
			if (name !== 'stalcraft') throw Error('missing')
			return stalcraft
		},
	}
	const selected = await findGameAssets(
		root as unknown as FileSystemDirectoryHandle
	)
	assert.equal(selected.name, 'assets')
	assert.deepEqual(opened, ['blockMap.ta'])
})

import {
	type Preparation,
	preparationComplete,
} from '../src/views/map3d/preparation.ts'

test('prepared means geometry, horizon, objects and first texture ACKs are complete', () => {
	const p: Preparation = {
		world: {
			selected: 49,
			loaded: 49,
			failed: 0,
			horizon: { wanted: 239, ready: 239, active: 0, failed: 0 },
			objects: {
				chunks: 49,
				completedChunks: 49,
				publishedChunks: 49,
				activeChunks: 0,
				queuedChunks: 0,
				active: 0,
				waiting: 0,
				objects: 100,
				templates: 10,
			},
			textures: {
				resident: 900,
				firstActive: 0,
				firstQueued: 0,
				refining: 0,
			},
		},
		network: {
			requests: 1,
			transferBytes: 1,
			httpCacheHits: 0,
			groups: {},
		},
		elapsedMs: 1000,
	}
	assert.equal(preparationComplete(p), true)
	for (const mutate of [
		(c: Preparation) => c.world.loaded--,
		(c: Preparation) => c.world.horizon!.ready--,
		(c: Preparation) => c.world.objects!.waiting++,
		(c: Preparation) => c.world.textures!.firstActive++,
		(c: Preparation) => c.world.failed++,
		(c: Preparation) => (c.world.readyBytes = 1024),
	]) {
		const c = structuredClone(p)
		mutate(c)
		assert.equal(preparationComplete(c), false)
	}
	assert.equal(preparationComplete(undefined), false)
})

import { sumPreparationTraffic } from '../src/views/map3d/preparation.ts'

test('preparation traffic includes earlier destinations and map tiles, without charging cached bodies again', () => {
	const previous = {
			requests: 2,
			transferBytes: 1100,
			httpCacheHits: 1,
			groups: { textures: { requests: 2, transferBytes: 1100 } },
		},
		current = {
			requests: 3,
			transferBytes: 500,
			httpCacheHits: 0,
			groups: {
				textures: { requests: 1, transferBytes: 500 },
				horizon: { requests: 2, transferBytes: 0 },
			},
		},
		map = {
			requests: 1,
			transferBytes: 200,
			httpCacheHits: 0,
			groups: { map: { requests: 1, transferBytes: 200 } },
		}
	const total = sumPreparationTraffic(previous, current, map)
	assert.equal(total.transferBytes, 1800)
	assert.equal(total.requests, 6)
	assert.equal(total.groups.textures.transferBytes, 1600)
	assert.equal(total.groups.horizon.transferBytes, 0)
	assert.equal(previous.transferBytes, 1100)
})
