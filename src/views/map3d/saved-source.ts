import type { GameFolder } from './local-folder.ts'

export type SavedSource = {
	version: 1
	mode: 'server' | 'local'
	name?: string
	directory?: FileSystemDirectoryHandle
}
const DATABASE = 'stalhub-map3d-preferences'
function open(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DATABASE, 1)
		request.onupgradeneeded = () =>
			request.result.createObjectStore('preferences')
		request.onsuccess = () => resolve(request.result)
		request.onerror = () => reject(request.error)
	})
}

export async function saveSource(folder?: GameFolder): Promise<void> {
	const db = await open()
	try {
		await new Promise<void>((resolve, reject) => {
			const value: SavedSource = folder
				? {
						version: 1,
						mode: 'local',
						name: folder.name,
						...(folder.directory
							? { directory: folder.directory }
							: {}),
					}
				: { version: 1, mode: 'server' }
			const tx = db.transaction('preferences', 'readwrite')
			tx.objectStore('preferences').put(value, 'source')
			tx.oncomplete = () => resolve()
			tx.onerror = () => reject(tx.error)
			tx.onabort = () => reject(tx.error)
		})
	} finally {
		db.close()
	}
}
export async function readSource(): Promise<SavedSource | null> {
	const db = await open()
	try {
		return await new Promise((resolve, reject) => {
			const tx = db.transaction('preferences'),
				request = tx.objectStore('preferences').get('source')
			request.onsuccess = () => {
				const value = request.result
				resolve(
					value?.version === 1 &&
						['server', 'local'].includes(value.mode)
						? value
						: null
				)
			}
			request.onerror = () => reject(request.error)
		})
	} finally {
		db.close()
	}
}

export async function resumeSource(
	source: SavedSource | null
): Promise<{ canResume: boolean; folder?: GameFolder }> {
	if (!source || source.mode === 'server') return { canResume: true }
	if (!source.directory) return { canResume: false }
	try {
		const handle = source.directory as FileSystemDirectoryHandle & {
			queryPermission(options: { mode: 'read' }): Promise<PermissionState>
		}
		if (
			!handle.queryPermission ||
			(await handle.queryPermission({ mode: 'read' })) !== 'granted'
		)
			return { canResume: false }
		return {
			canResume: true,
			folder: {
				name: source.name ?? source.directory.name,
				directory: source.directory,
				serverFallback: true,
			},
		}
	} catch {
		return { canResume: false }
	}
}
