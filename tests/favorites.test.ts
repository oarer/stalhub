import { beforeEach, expect, test } from 'bun:test'

const memory = new Map<string, string>()

const localStorageMock = {
	getItem: (key: string) => memory.get(key) ?? null,
	setItem: (key: string, value: string) => {
		memory.set(key, value)
	},
	removeItem: (key: string) => {
		memory.delete(key)
	},
	clear: () => memory.clear(),
}

Object.defineProperty(globalThis, 'window', {
	configurable: true,
	value: { localStorage: localStorageMock },
})
Object.defineProperty(globalThis, 'localStorage', {
	configurable: true,
	value: localStorageMock,
})

const { useFavoritesStore } = await import('@/stores/useFavorites.store')

Reflect.deleteProperty(globalThis, 'window')
Reflect.deleteProperty(globalThis, 'localStorage')

const state = () => useFavoritesStore.getState()

beforeEach(() => {
	state().clearFavorites()
})

test('toggleFavorite adds then removes an effect favorite', () => {
	state().toggleFavorite('positive-effect', 'stat.regen')
	expect(state().isFavorite('positive-effect', 'stat.regen')).toBe(true)

	state().toggleFavorite('positive-effect', 'stat.regen')
	expect(state().isFavorite('positive-effect', 'stat.regen')).toBe(false)
	expect(state().favorites).toHaveLength(0)
})

test('addFavorite and toggleFavorite do not create duplicates per namespace', () => {
	state().addFavorite('effect', 'stat.rad')
	state().addFavorite('effect', 'stat.rad')
	expect(state().getFavoritesByType('effect')).toHaveLength(1)

	state().toggleFavorite('effect', 'stat.rad')
	state().toggleFavorite('effect', 'stat.rad')
	expect(state().getFavoritesByType('effect')).toHaveLength(1)
})

test('effect namespaces are isolated from each other and from item types', () => {
	state().addFavorite('positive-effect', 'stat.shared')
	state().addFavorite('negative-effect', 'stat.shared')
	state().addFavorite('effect', 'stat.shared')
	state().addFavorite('artefact', 'stat.shared')

	expect(state().favorites).toHaveLength(4)

	state().removeFavorite('negative-effect', 'stat.shared')
	expect(state().isFavorite('negative-effect', 'stat.shared')).toBe(false)
	expect(state().isFavorite('positive-effect', 'stat.shared')).toBe(true)
	expect(state().isFavorite('effect', 'stat.shared')).toBe(true)
	expect(state().isFavorite('artefact', 'stat.shared')).toBe(true)
	expect(
		state()
			.getFavoritesByType('positive-effect')
			.map((f) => f.itemId)
	).toEqual(['stat.shared'])
})

test('favorites persist with their namespaces and survive rehydration', async () => {
	state().addFavorite('positive-effect', 'stat.a')
	state().addFavorite('negative-effect', 'stat.b')
	state().addFavorite('container', 'item.c')

	const stored = JSON.parse(memory.get('favorites-storage') ?? 'null')
	expect(stored.version).toBe(1)
	expect(
		stored.state.favorites.map(
			(f: { type: string; itemId: string }) => `${f.type}:${f.itemId}`
		)
	).toEqual([
		'positive-effect:stat.a',
		'negative-effect:stat.b',
		'container:item.c',
	])

	const snapshot = memory.get('favorites-storage') as string
	useFavoritesStore.setState({ favorites: [] })
	expect(state().favorites).toHaveLength(0)
	memory.set('favorites-storage', snapshot)

	await useFavoritesStore.persist.rehydrate()
	expect(state().isFavorite('positive-effect', 'stat.a')).toBe(true)
	expect(state().isFavorite('negative-effect', 'stat.b')).toBe(true)
	expect(state().isFavorite('container', 'item.c')).toBe(true)
	expect(state().isFavorite('effect', 'stat.a')).toBe(false)
})

test('existing favorites of other types are untouched by effect toggles', () => {
	state().addFavorite('weapon', 'w1')
	state().toggleFavorite('effect', 'w1')
	state().toggleFavorite('effect', 'w1')

	expect(state().isFavorite('weapon', 'w1')).toBe(true)
	expect(state().favorites).toHaveLength(1)
})
