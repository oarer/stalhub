import JSZip from 'jszip'
import type { ModelItem, PaintItem } from './types'
import { CDN } from './types'

export function assetUrl(reference?: string) {
	if (!reference) return undefined
	if (reference.startsWith('http')) return reference
	if (reference.includes(':')) {
		const [namespace, raw] = reference.split(':', 2)
		const relative = raw.replace(/^\/+/, '')
		return `${CDN}/${namespace}/${relative}`
	}
	return `${CDN}/${reference.replace(/^\//, '')}`
}

export function textureUrl(texture?: {
	reference: string
	path: string
	url?: string
}) {
	return texture?.url ?? assetUrl(texture?.reference)
}

export function modelUrl(item: ModelItem) {
	if (item.models[0]?.url) return item.models[0].url
	const path = item.models[0]?.path
	if (!path) return undefined
	return `${CDN}/stalker/${path.replace(/\.mcsb$/i, '.glb')}`
}

export function paintAssets(paint?: PaintItem) {
	const texture =
		paint?.textures.diffuse?.url ??
		assetUrl(paint?.textures.diffuse?.reference)
	return {
		texture,
		alpha: texture,
		emission:
			paint?.textures.emission?.url ??
			assetUrl(paint?.textures.emission?.reference),
		normal:
			paint?.textures.normal?.url ??
			assetUrl(paint?.textures.normal?.reference),
	}
}

export async function fetchBlob(url: string): Promise<Blob | null> {
	try {
		const res = await fetch(url)
		if (!res.ok) return null
		return res.blob()
	} catch {
		return null
	}
}

export function extFromUrl(url: string) {
	const match = url.match(/\.([a-z0-9]+)(?:\?|$)/i)
	return match ? `.${match[1]}` : ''
}

export async function downloadAssets(options: {
	model: ModelItem | undefined
	glb: string | undefined
	modelTextures:
		| { diff?: string; emi?: string; nrm?: string; spek?: string }
		| undefined
	paintEnabled: boolean
	paintTexture?: string
	paintEmission?: string
	paintNormal?: string
	secondaryEnabled: boolean
	secondaryTexture?: string
	secondaryEmission?: string
	secondaryNormal?: string
}) {
	const {
		model,
		glb,
		modelTextures,
		paintEnabled,
		paintTexture,
		paintEmission,
		paintNormal,
		secondaryEnabled,
		secondaryTexture,
		secondaryEmission,
		secondaryNormal,
	} = options
	if (!model || !glb) return

	const zip = new JSZip()
	const name = model.id

	const tasks: Promise<void>[] = []

	if (glb) {
		tasks.push(
			fetchBlob(glb).then((blob) => {
				if (blob) zip.file(`model/${name}${extFromUrl(glb)}`, blob)
			})
		)
	}

	if (modelTextures) {
		const texEntries: [string, string | undefined][] = [
			['diffuse', modelTextures.diff],
			['normal', modelTextures.nrm],
			['specular', modelTextures.spek],
			['emission', modelTextures.emi],
		]
		for (const [label, url] of texEntries) {
			if (!url) continue
			tasks.push(
				fetchBlob(url).then((blob) => {
					if (blob)
						zip.file(`textures/${label}${extFromUrl(url)}`, blob)
				})
			)
		}
	}

	if (paintEnabled) {
		const paintEntries: [string, string | undefined][] = [
			['texture', paintTexture],
			['emission', paintEmission],
			['normal', paintNormal],
		]
		for (const [label, url] of paintEntries) {
			if (!url) continue
			tasks.push(
				fetchBlob(url).then((blob) => {
					if (blob) zip.file(`paint/${label}${extFromUrl(url)}`, blob)
				})
			)
		}
	}

	if (secondaryEnabled) {
		const secEntries: [string, string | undefined][] = [
			['texture', secondaryTexture],
			['emission', secondaryEmission],
			['normal', secondaryNormal],
		]
		for (const [label, url] of secEntries) {
			if (!url) continue
			tasks.push(
				fetchBlob(url).then((blob) => {
					if (blob)
						zip.file(`secondary/${label}${extFromUrl(url)}`, blob)
				})
			)
		}
	}

	tasks.push(
		fetchBlob('/stalcraft_paints-1.0.zip').then((blob) => {
			if (blob) zip.file('stalcraft_paints-1.0.zip', blob)
		})
	)

	await Promise.all(tasks)

	const content = await zip.generateAsync({ type: 'blob' })
	const objectUrl = URL.createObjectURL(content)
	const link = document.createElement('a')
	link.href = objectUrl
	link.download = `${name}.zip`
	document.body.appendChild(link)
	link.click()
	link.remove()
	URL.revokeObjectURL(objectUrl)
}
