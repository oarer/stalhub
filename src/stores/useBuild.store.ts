import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
	Art,
	BoostCategory,
	Build,
	BuildDefaults,
} from '@/types/build.type'
import { getQualityByPercent } from '@/utils/artUtils'

export type SavedBuild = {
	id: string
	name: string
	build: Build
	defaults: BuildDefaults
	createdAt: number
	updatedAt: number
}

type BuildState = {
	build: Build
	defaults: BuildDefaults
	savedBuilds: SavedBuild[]
	currentBuildId: string | null

	setDefaults: (defaults: Partial<BuildDefaults>) => void

	addArt: (id: string, data?: Partial<Art>, placeInSlot?: number) => void
	updateArt: (id: string, data: Partial<Art>) => void
	removeArt: (id: string) => void
	copyArt: (instanceId: string, toSlot: number) => void

	setArmor: (id: string, level?: number) => void
	removeArmor: () => void

	setContainer: (id: string, slotsCount: number) => void
	removeContainer: () => void

	setBoost: (category: BoostCategory, boostId: string) => void
	removeBoost: (category: BoostCategory) => void

	assignArtToSlot: (
		artId: string,
		slotIndex: number,
		override?: boolean
	) => boolean
	unassignSlot: (slotIndex: number) => void
	findSlotOfArt: (artId: string) => number | -1

	resetBuild: () => void

	saveBuild: (name: string) => void
	loadBuild: (id: string) => void
	deleteBuild: (id: string) => void
	updateBuild: (id: string, data: Partial<Pick<SavedBuild, 'name'>>) => void
	autoSave: () => void

	exportBuild: (name?: string) => Promise<string | null>
	importBuild: (encoded: string) => Promise<boolean>
}

const initialBuild: Build = {
	arts: [],
	boost: {
		'item.effects.effect_type.long_time_medicine': null,
		'item.effects.effect_type.mobility': null,
		'item.effects.effect_type.short_time_medicine': null,
		'item.effects.effect_type.protection': null,
		'item.effects.effect_type.healing': null,
		'item.effects.effect_type.accumulation': null,
	},
	armor: null,
	container: null,
}

const initialDefaults: BuildDefaults = {
	art: {
		percent: 85,
		potential: 0,
	},
	armor: {
		level: 0,
	},
}

const createInstanceId = () => crypto.randomUUID()

const doAutoSave = (
	set: (
		state:
			| Partial<BuildState>
			| ((state: BuildState) => Partial<BuildState>)
	) => void,
	get: () => BuildState
) => {
	const { build, defaults, savedBuilds, currentBuildId } = get()

	if (!currentBuildId) {
		const now = Date.now()
		const id = crypto.randomUUID()
		const newBuild: SavedBuild = {
			id,
			name: 'Новая сборка',
			build: JSON.parse(JSON.stringify(build)),
			defaults: JSON.parse(JSON.stringify(defaults)),
			createdAt: now,
			updatedAt: now,
		}
		set({
			savedBuilds: [...savedBuilds, newBuild],
			currentBuildId: id,
		})
		return
	}

	const index = savedBuilds.findIndex((b) => b.id === currentBuildId)
	if (index === -1) return

	savedBuilds[index] = {
		...savedBuilds[index],
		build: JSON.parse(JSON.stringify(build)),
		defaults: JSON.parse(JSON.stringify(defaults)),
		updatedAt: Date.now(),
	}

	set({ savedBuilds: [...savedBuilds] })
}

export const useBuildStore = create<BuildState>()(
	persist(
		(set, get) => ({
			build: initialBuild,
			defaults: initialDefaults,
			savedBuilds: [],
			currentBuildId: null,

			setDefaults: (defaults) => {
				set((state) => ({
					defaults: {
						...state.defaults,
						...defaults,
					},
				}))
				doAutoSave(set, get)
			},

			addArt: (itemId, data = {}, placeInSlot) => {
				const { container } = get().build
				if (!container) return false
				if (placeInSlot == null) return false
				if (placeInSlot < 0 || placeInSlot >= container.slots.length)
					return false

				set((state) => {
					const currContainer = state.build.container
					if (!currContainer) return { build: state.build }

					const existingInstanceId = currContainer.slots[placeInSlot]
					const existingArt = state.build.arts.find(
						(a) => a.instanceId === existingInstanceId
					)

					if (existingArt?.itemId === itemId) {
						return { build: state.build }
					}

					const d = state.defaults.art
					const percent = data.percent ?? d.percent
					const instanceId = createInstanceId()

					return {
						build: {
							...state.build,
							arts: [
								...state.build.arts.filter(
									(a) => a.instanceId !== existingInstanceId
								),
								{
									instanceId,
									itemId,
									percent,
									potential: data.potential ?? d.potential,
									selectedStats:
										data.selectedStats ??
										Array(3).fill(null),
									qualityClass:
										data.qualityClass ??
										getQualityByPercent(percent),
								},
							],
							container: {
								...currContainer,
								slots: currContainer.slots.map((s, i) =>
									i === placeInSlot ? instanceId : s
								),
							},
						},
					}
				})

				doAutoSave(set, get)
				return get().build.container?.slots[placeInSlot] ?? false
			},

			updateArt: (instanceId, data) => {
				set((state) => ({
					build: {
						...state.build,
						arts: state.build.arts.map((art) => {
							if (art.instanceId !== instanceId) return art

							const nextPercent = data.percent ?? art.percent

							return {
								...art,
								...data,
								selectedStats:
									data.selectedStats ??
									art.selectedStats ??
									Array(3).fill(null),
								qualityClass:
									data.qualityClass ??
									(data.percent != null
										? getQualityByPercent(nextPercent)
										: art.qualityClass),
							}
						}),
					},
				}))
				doAutoSave(set, get)
			},

			removeArt: (id) => {
				set((state) => {
					const newArts = state.build.arts.filter(
						(a) => a.instanceId !== id
					)

					const container = state.build.container
						? {
								...state.build.container,
								slots: state.build.container.slots.map((s) =>
									s === id ? null : s
								),
							}
						: state.build.container

					return {
						build: {
							...state.build,
							arts: newArts,
							container,
						},
					}
				})
				doAutoSave(set, get)
			},

			copyArt: (instanceId, toSlot) => {
				const { build } = get()
				const container = build.container
				if (!container) return
				if (toSlot < 0 || toSlot >= container.slots.length) return

				const sourceArt = build.arts.find(
					(a) => a.instanceId === instanceId
				)
				if (!sourceArt) return

				const newInstanceId = createInstanceId()

				set((state) => {
					const existingInstanceId =
						state.build.container?.slots[toSlot]

					return {
						build: {
							...state.build,
							arts: [
								...state.build.arts.filter(
									(a) => a.instanceId !== existingInstanceId
								),
								{
									...sourceArt,
									instanceId: newInstanceId,
								},
							],
							container: {
								...state.build.container!,
								slots: state.build.container!.slots.map(
									(s, i) => (i === toSlot ? newInstanceId : s)
								),
							},
						},
					}
				})
				doAutoSave(set, get)
			},

			setArmor: (id, level) => {
				const d = get().defaults.armor

				set((state) => ({
					build: {
						...state.build,
						armor: {
							id,
							level: level ?? d.level,
						},
					},
				}))
				doAutoSave(set, get)
			},

			removeArmor: () => {
				set((state) => ({
					build: { ...state.build, armor: null },
				}))
				doAutoSave(set, get)
			},

			setContainer: (id: string, slotsCount: number) => {
				set((state) => {
					const prevSlots = state.build.container?.slots ?? []

					let newSlots: (string | null)[]

					if (slotsCount <= prevSlots.length) {
						newSlots = prevSlots.slice(0, slotsCount)
					} else {
						newSlots = [
							...prevSlots,
							...Array.from(
								{ length: slotsCount - prevSlots.length },
								() => null
							),
						]
					}

					return {
						build: {
							...state.build,
							container: {
								id,
								slots: newSlots,
							},
						},
					}
				})
				doAutoSave(set, get)
			},

			removeContainer: () => {
				set((state) => ({
					build: { ...state.build, container: null },
				}))
				doAutoSave(set, get)
			},

			setBoost: (category, boostId) => {
				set((state) => ({
					build: {
						...state.build,
						boost: {
							...state.build.boost,
							[category]: boostId,
						},
					},
				}))
				doAutoSave(set, get)
			},

			removeBoost: (category) => {
				set((state) => ({
					build: {
						...state.build,
						boost: {
							...state.build.boost,
							[category]: null,
						},
					},
				}))
				doAutoSave(set, get)
			},

			assignArtToSlot: (artId, slotIndex, override = false) => {
				const { container, arts } = get().build
				if (!container) return false
				if (slotIndex < 0 || slotIndex >= container.slots.length)
					return false
				if (!arts.find((a) => a.instanceId === artId)) return false

				const prev = container.slots.indexOf(artId)
				if (prev !== -1) {
					if (prev === slotIndex) return true
					set((s) => ({
						build: {
							...s.build,
							container: {
								...s.build.container!,
								slots: s.build.container!.slots.map((v, i) =>
									i === prev ? null : v
								),
							},
						},
					}))
				}

				if (container.slots[slotIndex] === null) {
					set((s) => ({
						build: {
							...s.build,
							container: {
								...s.build.container!,
								slots: s.build.container!.slots.map((v, i) =>
									i === slotIndex ? artId : v
								),
							},
						},
					}))
					doAutoSave(set, get)
					return true
				}

				if (override) {
					set((s) => ({
						build: {
							...s.build,
							container: {
								...s.build.container!,
								slots: s.build.container!.slots.map((v, i) =>
									i === slotIndex ? artId : v
								),
							},
						},
					}))
					doAutoSave(set, get)
					return true
				}

				return false
			},

			unassignSlot: (slotIndex) => {
				set((state) => {
					if (!state.build.container) return { build: state.build }
					if (
						slotIndex < 0 ||
						slotIndex >= state.build.container.slots.length
					)
						return { build: state.build }

					return {
						build: {
							...state.build,
							container: {
								...state.build.container,
								slots: state.build.container.slots.map(
									(v, i) => (i === slotIndex ? null : v)
								),
							},
						},
					}
				})
				doAutoSave(set, get)
			},

			findSlotOfArt: (artId) => {
				const { container } = get().build
				if (!container) return -1
				return container.slots.indexOf(artId)
			},

			resetBuild: () =>
				set({ build: initialBuild, currentBuildId: null }),

			saveBuild: (name) => {
				const { build, defaults, savedBuilds } = get()
				const now = Date.now()
				const id = crypto.randomUUID()

				const newBuild: SavedBuild = {
					id,
					name,
					build: JSON.parse(JSON.stringify(build)),
					defaults: JSON.parse(JSON.stringify(defaults)),
					createdAt: now,
					updatedAt: now,
				}

				set({
					savedBuilds: [...savedBuilds, newBuild],
					currentBuildId: id,
				})
			},

			loadBuild: (id) => {
				const { build, defaults, savedBuilds, currentBuildId } = get()

				if (currentBuildId) {
					const currentIndex = savedBuilds.findIndex(
						(b) => b.id === currentBuildId
					)
					if (currentIndex !== -1) {
						savedBuilds[currentIndex] = {
							...savedBuilds[currentIndex],
							build: JSON.parse(JSON.stringify(build)),
							defaults: JSON.parse(JSON.stringify(defaults)),
							updatedAt: Date.now(),
						}
					}
				}

				const saved = savedBuilds.find((b) => b.id === id)
				if (!saved) return

				set({
					build: JSON.parse(JSON.stringify(saved.build)),
					defaults: JSON.parse(JSON.stringify(saved.defaults)),
					currentBuildId: id,
				})
			},

			deleteBuild: (id) => {
				const { savedBuilds, currentBuildId } = get()
				set({
					savedBuilds: savedBuilds.filter((b) => b.id !== id),
					currentBuildId:
						currentBuildId === id ? null : currentBuildId,
				})
			},

			updateBuild: (id, data) => {
				const { savedBuilds } = get()
				set({
					savedBuilds: savedBuilds.map((b) =>
						b.id === id
							? { ...b, ...data, updatedAt: Date.now() }
							: b
					),
				})
			},

			autoSave: () => {
				doAutoSave(set, get)
			},

			exportBuild: async (name?: string) => {
				const { build, defaults } = get()
				const data = JSON.stringify({ name, build, defaults })
				const uint8Array = new TextEncoder().encode(data)

				const cs = new CompressionStream('gzip')
				const writer = cs.writable.getWriter()
				writer.write(uint8Array)
				writer.close()

				const response = new Response(cs.readable)
				const buffer = await response.arrayBuffer()
				const compressed = new Uint8Array(buffer)

				const blob = new Blob([compressed])
				const url = await new Promise<string>((resolve) => {
					const reader = new FileReader()
					reader.onloadend = () => resolve(reader.result as string)
					reader.readAsDataURL(blob)
				})
				return url.split(',')[1]
			},

			importBuild: async (encoded) => {
				try {
					const binary = atob(encoded)
					const bytes = new Uint8Array(binary.length)
					for (let i = 0; i < binary.length; i++) {
						bytes[i] = binary.charCodeAt(i)
					}

					const ds = new DecompressionStream('gzip')
					const writer = ds.writable.getWriter()
					writer.write(bytes)
					writer.close()

					const response = new Response(ds.readable)
					const buffer = await response.arrayBuffer()
					const decompressed = new Uint8Array(buffer)

					const data = JSON.parse(
						new TextDecoder().decode(decompressed)
					)
					if (data.build && data.defaults) {
						const now = Date.now()
						const id = crypto.randomUUID()
						const buildName = data.name || 'Новая сборка'
						const newBuild: SavedBuild = {
							id,
							name: buildName,
							build: data.build,
							defaults: data.defaults,
							createdAt: now,
							updatedAt: now,
						}
						const { savedBuilds } = get()
						set({
							build: data.build,
							defaults: data.defaults,
							savedBuilds: [...savedBuilds, newBuild],
							currentBuildId: id,
						})
						return true
					}
					console.warn('Invalid build data:', data)
					return false
				} catch (e) {
					console.error('Import failed:', e)
					return false
				}
			},
		}),
		{
			name: 'build-storage',
			version: 2,
			partialize: (state) => ({
				build: state.build,
				defaults: state.defaults,
				savedBuilds: state.savedBuilds,
				currentBuildId: state.currentBuildId,
			}),
		}
	)
)
