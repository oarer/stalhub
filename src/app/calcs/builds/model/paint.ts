import type * as THREE from 'three'

export type PaintMaskMode =
	| 'dmap_alpha_as_dual_skin_mask'
	| 'dmap_alpha_as_skin_mask'
	| 'nmap_blue_as_dual_skin_mask'
	| 'nmap_blue_as_skin_mask'

export type PaintZone = {
	texture?: string
	alpha?: string
	emission?: string
	color?: THREE.ColorRepresentation | readonly [number, number, number]
}

export type PaintConfig = PaintZone & {
	mode: PaintMaskMode
	uvScale?: number
	invertMask?: boolean
	autoSelectPaintColor?: boolean
	secondary?: PaintZone
	secondaryEnabled?: boolean
	overrideSecondarySpecular?: boolean
	secondarySpecular?:
		| THREE.ColorRepresentation
		| readonly [number, number, number]
	normal?: string
}

export const PAINT_MODE = {
	dmap_alpha_as_dual_skin_mask: { source: 'diffuse', dual: true },
	dmap_alpha_as_skin_mask: { source: 'diffuse', dual: false },
	nmap_blue_as_dual_skin_mask: { source: 'normal', dual: true },
	nmap_blue_as_skin_mask: { source: 'normal', dual: false },
} as const satisfies Record<
	PaintMaskMode,
	{ source: 'diffuse' | 'normal'; dual: boolean }
>

function clamp(value: number) {
	return Math.min(1, Math.max(0, value))
}

export function calculatePaintMasks(
	mask: number,
	mode: PaintMaskMode,
	invertMask: boolean,
	secondaryEnabled: boolean
) {
	const value = invertMask ? 1 - mask : mask
	if (!PAINT_MODE[mode].dual) {
		return { primary: clamp(value), secondary: 0 }
	}
	return {
		primary: clamp((Math.max(value, 0.512) - 0.512) * 2.049),
		secondary: secondaryEnabled
			? clamp((0.488 - Math.min(value, 0.488)) * 2.049)
			: 0,
	}
}

function fourCc(view: DataView, offset: number) {
	return String.fromCharCode(
		view.getUint8(offset),
		view.getUint8(offset + 1),
		view.getUint8(offset + 2),
		view.getUint8(offset + 3)
	)
}

function decodeBc4Block(data: Uint8Array, offset: number) {
	const first = data[offset]
	const second = data[offset + 1]
	const palette = [first, second]
	if (first > second) {
		for (let index = 1; index <= 6; index++) {
			palette.push(Math.round(((7 - index) * first + index * second) / 7))
		}
	} else {
		for (let index = 1; index <= 4; index++) {
			palette.push(Math.round(((5 - index) * first + index * second) / 5))
		}
		palette.push(0, 255)
	}

	return Array.from({ length: 16 }, (_, index) => {
		const bitOffset = index * 3
		const byteOffset = Math.floor(bitOffset / 8)
		const shift = bitOffset % 8
		const lower = data[offset + 2 + byteOffset] >> shift
		const upper =
			shift > 5 ? data[offset + 3 + byteOffset] << (8 - shift) : 0
		return palette[(lower | upper) & 7]
	})
}

export function decodeAti2Dds(buffer: ArrayBuffer) {
	if (buffer.byteLength < 144) {
		throw new Error('Expected an ATI2/BC5 DDS texture')
	}
	const view = new DataView(buffer)
	const format = fourCc(view, 84)
	const isAti2 = format === 'ATI2'
	const isDx10Bc5 =
		format === 'DX10' &&
		buffer.byteLength >= 164 &&
		view.getUint32(128, true) === 83
	if (view.getUint32(0, true) !== 0x20534444 || (!isAti2 && !isDx10Bc5)) {
		throw new Error('Expected an ATI2/BC5 DDS texture')
	}
	const height = view.getUint32(12, true)
	const width = view.getUint32(16, true)
	if (width === 0 || height === 0) {
		throw new Error('ATI2 DDS has invalid dimensions')
	}
	const blocksX = Math.ceil(width / 4)
	const blocksY = Math.ceil(height / 4)
	const dataOffset = isDx10Bc5 ? 148 : 128
	const requiredBytes = dataOffset + blocksX * blocksY * 16
	if (buffer.byteLength < requiredBytes) {
		throw new Error('ATI2 DDS level 0 is truncated')
	}

	const source = new Uint8Array(buffer, dataOffset)
	const data = new Uint8Array(width * height * 4)
	for (let blockY = 0; blockY < blocksY; blockY++) {
		for (let blockX = 0; blockX < blocksX; blockX++) {
			const offset = (blockY * blocksX + blockX) * 16

			const first = decodeBc4Block(source, offset)
			const second = decodeBc4Block(source, offset + 8)

			const red = isAti2 ? second : first
			const green = isAti2 ? first : second

			for (let y = 0; y < 4; y++) {
				for (let x = 0; x < 4; x++) {
					const pixelX = blockX * 4 + x
					const pixelY = blockY * 4 + y

					if (pixelX >= width || pixelY >= height) continue

					const blockPixel = y * 4 + x

					const nx = red[blockPixel] / 127.5 - 1
					const ny = 1 - green[blockPixel] / 127.5

					const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny))

					const pixel = (pixelY * width + pixelX) * 4

					data[pixel] = red[blockPixel]
					data[pixel + 1] = green[blockPixel]
					data[pixel + 2] = Math.round(nz * 255)
					data[pixel + 3] = 255
				}
			}
		}
	}
	return { data, width, height }
}

type PaintShaderOptions = {
	mode: PaintMaskMode
	useUv1: boolean
	hasPrimaryTexture: boolean
	hasPrimaryAlpha: boolean
	hasPrimaryEmission: boolean
	hasPrimaryNormal: boolean
	hasSecondaryTexture: boolean
	hasSecondaryAlpha: boolean
	hasSecondaryEmission: boolean
	invertMask: boolean
	secondaryEnabled: boolean
	overrideSecondarySpecular: boolean
}

export function createPaintShaderPatch(options: PaintShaderOptions) {
	const mode = PAINT_MODE[options.mode]
	const rawMask =
		mode.source === 'normal'
			? 'texture2D(normalMap, vNormalMapUv).b'
			: 'sampledDiffuseColor.a'
	const mask = options.invertMask ? `1.0 - (${rawMask})` : rawMask
	const primaryMask = mode.dual
		? 'clamp((max(stalhubRawMask, 0.512) - 0.512) * 2.049, 0.0, 1.0)'
		: 'clamp(stalhubRawMask, 0.0, 1.0)'
	const secondaryMask = mode.dual
		? `clamp((0.488 - min(stalhubRawMask, 0.488)) * 2.049, 0.0, 1.0) * ${options.secondaryEnabled ? '1.0' : '0.0'}`
		: '0.0'
	const primaryColor = options.hasPrimaryTexture
		? 'pow(texture2D(stalhubPrimaryPaint, stalhubPaintUv).rgb, vec3(2.2))'
		: 'stalhubPrimaryColor'
	const secondaryColor = options.hasSecondaryTexture
		? 'pow(texture2D(stalhubSecondaryPaint, stalhubPaintUv).rgb, vec3(2.2))'
		: 'stalhubSecondaryColor'
	const primaryAlpha = options.hasPrimaryAlpha
		? 'texture2D(stalhubPrimaryAlpha, stalhubPaintUv).a'
		: '1.0'
	const secondaryAlpha = options.hasSecondaryAlpha
		? 'texture2D(stalhubSecondaryAlpha, stalhubPaintUv).a'
		: '1.0'

	const samplers = [
		options.hasPrimaryTexture && 'uniform sampler2D stalhubPrimaryPaint;',
		options.hasPrimaryAlpha && 'uniform sampler2D stalhubPrimaryAlpha;',
		options.hasPrimaryEmission &&
			'uniform sampler2D stalhubPrimaryEmission;',
		options.hasPrimaryNormal && 'uniform sampler2D stalhubPrimaryNormal;',
		options.hasSecondaryTexture &&
			'uniform sampler2D stalhubSecondaryPaint;',
		options.hasSecondaryAlpha && 'uniform sampler2D stalhubSecondaryAlpha;',
		options.hasSecondaryEmission &&
			'uniform sampler2D stalhubSecondaryEmission;',
	]
		.filter(Boolean)
		.join('\n')

	const fragmentNormal = options.hasPrimaryNormal
		? `#ifdef USE_NORMALMAP_TANGENTSPACE
	vec3 mapN = texture2D(stalhubPrimaryNormal, stalhubPaintUv).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize(tbn * mapN);
#endif`
		: '#include <normal_fragment_maps>'

	return {
		vertexHeader: `${options.useUv1 ? '#ifndef USE_UV1\nattribute vec2 uv1;\n#endif\n' : ''}varying vec2 stalhubPaintUv;\nuniform float stalhubTextureScale;\nvoid main() {`,
		vertexMain: `#include <uv_vertex>\nstalhubPaintUv = ${options.useUv1 ? 'uv1' : 'uv'} * stalhubTextureScale;`,
		fragmentHeader: `varying vec2 stalhubPaintUv;\nuniform vec3 stalhubPrimaryColor;\nuniform vec3 stalhubSecondaryColor;\nuniform vec3 stalhubSecondarySpecular;\n${samplers}\nvoid main() {`,
		fragmentDiffuse: `#include <map_fragment>
float stalhubRawMask = ${mask};
float stalhubPrimaryMask = ${primaryMask};
float stalhubSecondaryMask = ${secondaryMask};
float stalhubMaskSum = clamp(stalhubPrimaryMask + stalhubSecondaryMask, 0.0, 1.0);
float stalhubPrimaryAlpha = ${primaryAlpha};
float stalhubSecondaryAlpha = ${secondaryAlpha};
float stalhubDesaturation = smoothstep(0.25, 0.6, stalhubMaskSum);
vec3 stalhubGray = vec3(dot(diffuseColor.rgb, vec3(0.299, 0.587, 0.114)));
diffuseColor.rgb = mix(diffuseColor.rgb, stalhubGray, stalhubDesaturation * stalhubPrimaryAlpha);
diffuseColor.rgb = mix(diffuseColor.rgb, ${primaryColor}, stalhubPrimaryMask * stalhubPrimaryAlpha);
diffuseColor.rgb = mix(diffuseColor.rgb, ${secondaryColor}, stalhubSecondaryMask * stalhubSecondaryAlpha);`,
		fragmentNormal,
		fragmentEmission: `#include <emissivemap_fragment>
${options.hasPrimaryEmission ? 'totalEmissiveRadiance = mix(totalEmissiveRadiance, pow(texture2D(stalhubPrimaryEmission, stalhubPaintUv).rgb, vec3(2.2)), stalhubPrimaryMask);' : ''}
${options.hasSecondaryEmission ? 'totalEmissiveRadiance = mix(totalEmissiveRadiance, pow(texture2D(stalhubSecondaryEmission, stalhubPaintUv).rgb, vec3(2.2)), stalhubSecondaryMask);' : ''}`,
		fragmentSpecular:
			mode.dual && options.overrideSecondarySpecular
				? '#include <lights_physical_fragment>\nmaterial.specularColor = mix(material.specularColor, stalhubSecondarySpecular, stalhubSecondaryMask);\nmaterial.specularColorBlended = mix(material.specularColorBlended, stalhubSecondarySpecular, stalhubSecondaryMask);'
				: '#include <lights_physical_fragment>',
	}
}
