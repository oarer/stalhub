export type GameFolder = {
	name: string
	directory?: FileSystemDirectoryHandle
	files?: { path: string; file: File }[]
	serverFallback: boolean
}
export async function findGameAssets(
	root: FileSystemDirectoryHandle
): Promise<GameFolder> {
	for (const parts of [['modassets', 'assets'], ['assets'], []]) {
		try {
			let directory = root
			for (const name of parts)
				directory = await directory.getDirectoryHandle(name)
			const textures = await (
				await directory.getDirectoryHandle('stalcraft')
			).getDirectoryHandle('textures')
			for (const name of ['blockMap.ta', 'blockMap.texarr'])
				try {
					const f = await (
						await textures.getFileHandle(name)
					).getFile()
					if (f.size > 16)
						return {
							name: root.name,
							directory,
							serverFallback: true,
						}
				} catch {
					/* Try the next known texture name. */
				}
		} catch (e) {
			if ((e as Error).name === 'NotAllowedError') throw e
		}
	}
	throw Error(
		'Текстуры игры не найдены. Выберите папку Stalzone, modassets или assets.'
	)
}
export function gameFolderFiles(files: readonly File[]): GameFolder {
	const rows = files
		.filter((f) => !/\.xeon$/i.test(f.name))
		.map((file) => {
			const p = file.webkitRelativePath.replaceAll('\\', '/'),
				i = p.indexOf('/modassets/assets/'),
				j = p.indexOf('/assets/')
			return {
				file,
				path:
					i >= 0
						? p.slice(i + 18)
						: j >= 0
							? p.slice(j + 8)
							: p.slice(p.indexOf('/') + 1),
			}
		})
	if (
		!rows.some(
			(r) =>
				/^stalcraft\/textures\/blockMap\.(ta|texarr)$/i.test(r.path) &&
				r.file.size > 16
		)
	)
		throw Error('В выбранной папке нет текстур Stalzone.')
	return {
		name: files[0]?.webkitRelativePath.split('/')[0] ?? 'Stalzone',
		files: rows,
		serverFallback: true,
	}
}
