const encode = (s: string) =>
	encodeURIComponent(s).replace(
		/[!'()*]/g,
		(c) => '%' + c.charCodeAt(0).toString(16).toUpperCase()
	)
export function staticResourcePath(key: string): string {
	const [resource, query = ''] = key.split('?'),
		parts = resource.split('/').map(decodeURIComponent),
		params = new URLSearchParams(query)
	const name = params.get('name')
	params.delete('name')
	if (name) {
		const at = name.indexOf(':')
		if (at < 1) throw Error('Invalid resource name')
		parts.push(name.slice(0, at), ...name.slice(at + 1).split('/'))
	}
	if (
		parts.some(
			(p) =>
				!p ||
				p === '.' ||
				p === '..' ||
				/[\\/:\0]/.test(p) ||
				/\.xeon$/i.test(p)
		)
	)
		throw Error('Invalid static resource')
	const variant = encode(
		[...params]
			.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
			.map(([k, v]) => `${encode(k)}=${encode(v)}`)
			.join('__') || 'default'
	).replaceAll('%3D', '=')
	let ext = '.json'
	if (resource.includes('/chunk/')) ext = '.szc'
	else if (resource.includes('/objects-raw/')) ext = '.szo'
	else if (
		resource.includes('/terrain-lod/') &&
		!resource.endsWith('/manifest')
	)
		ext = '.scl'
	else if (resource.includes('/tile/')) ext = '.png'
	else if (
		['texture', 'sr-texture', 'sr-texture-hd', 'model-texture'].includes(
			resource
		)
	)
		ext = '.dds'
	else if (['model', 'model-raw'].includes(resource)) ext = '.mcsb'
	else if (resource.startsWith('effect-resource/'))
		ext = /\.[^./]+$/.exec(parts.at(-1)!)?.[0] ?? '.bin'
	let filename = parts.pop()!
	if (name || resource.startsWith('effect-resource/')) {
		if (!/\.[^./]+$/.test(filename)) filename += ext
	} else filename += ext
	return [
		'files',
		...parts,
		...(params.size ? ['_variants', variant] : []),
		filename,
	]
		.map(encode)
		.join('/')
}
