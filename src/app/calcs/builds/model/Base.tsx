import { Html, useGLTF } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import { useFrame } from '@react-three/fiber'
import { NextIntlClientProvider, useLocale, useMessages } from 'next-intl'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { DDSLoader, SkeletonUtils } from 'three-stdlib'
import QueryProvider from '@/providers/QueryProvider'
import ModalManager from './modals/Manager'
import {
	createPaintShaderPatch,
	decodeAti2Dds,
	PAINT_MODE,
	type PaintConfig,
} from './paint'

type ModelType = 'armor' | 'cont'

type BaseModelProps = {
	glb: string
	textures: {
		diff?: string
		emi?: string
		nrm?: string
		spek?: string
	}
	type: ModelType
	animations?: THREE.AnimationClip[]
	onSceneReady?: (scene: THREE.Group) => void
	attachToBone?: string
	attachObjects?: THREE.Object3D[]
	interactive?: boolean
	paint?: PaintConfig
	weapon?: boolean
	uvChannel?: 0 | 1
}

type ModalProps = {
	type: ModelType
	clickType: 'LMB' | 'RMB'
}

const CONT_OFFSET = new THREE.Vector3(0.4, 0.28, 0.15)
const TRANSPARENT_MESHES = ['soft', 'wire']

function paintColor(
	value: PaintConfig['color'],
	fallback: readonly [number, number, number]
) {
	return Array.isArray(value)
		? new THREE.Color().setRGB(value[0], value[1], value[2])
		: value === undefined
			? new THREE.Color().setRGB(...fallback)
			: new THREE.Color(value as THREE.ColorRepresentation)
}

export function BaseModel({
	glb,
	textures,
	type,
	animations,
	onSceneReady,
	attachToBone,
	attachObjects,
	interactive = true,
	paint,
	weapon,
	uvChannel,
}: BaseModelProps) {
	const locale = useLocale()
	const messages = useMessages()

	const { scene: sourceScene } = useGLTF(glb)
	const scene = useMemo(() => {
		const cloned = SkeletonUtils.clone(sourceScene) as THREE.Group
		cloned.traverse((child) => {
			if (!(child as THREE.Mesh).isMesh) return
			const mesh = child as THREE.Mesh
			const sourceMaterials = Array.isArray(mesh.material)
				? mesh.material
				: [mesh.material]
			const materials = sourceMaterials.map((material) => {
				if (
					(material as THREE.MeshPhysicalMaterial)
						.isMeshPhysicalMaterial
				)
					return material.clone()
				if (
					(material as THREE.MeshStandardMaterial)
						.isMeshStandardMaterial
				) {
					const physical = new THREE.MeshPhysicalMaterial()
					THREE.MeshStandardMaterial.prototype.copy.call(
						physical,
						material
					)
					return physical
				}
				return material.clone()
			})
			mesh.material = Array.isArray(mesh.material)
				? materials
				: materials[0]
		})
		return cloned
	}, [sourceScene])
	const [baseNormalMap, setBaseNormalMap] = useState<{
		texture: THREE.Texture
		decoded: boolean
	} | null>(null)
	const mixerRef = useRef<THREE.AnimationMixer | null>(null)
	const [modalOpen, setModalOpen] = useState<ModalProps | null>(null)

	const [modalPos, setModalPos] = useState<THREE.Vector3 | null>(null)
	const headRef = useRef<THREE.Object3D | null>(null)

	useEffect(() => {
		const ddsLoader = new DDSLoader()
		const ownedTextures: THREE.Texture[] = []
		let cancelled = false
		const head = scene.getObjectByName('head_nub')
		if (head) headRef.current = head
		const configureDataTexture = (texture: THREE.Texture) => {
			texture.colorSpace = THREE.NoColorSpace
			texture.wrapS = THREE.RepeatWrapping
			texture.wrapT = THREE.RepeatWrapping
			texture.needsUpdate = true
			return texture
		}
		const loadDds = (
			url: string,
			colorSpace: THREE.ColorSpace = THREE.NoColorSpace
		) => {
			const texture = ddsLoader.load(url, (loaded) => {
				loaded.colorSpace = colorSpace
				loaded.needsUpdate = true
			})
			ownedTextures.push(texture)
			return texture
		}

		const copyUvTransform = (
			target: THREE.Texture,
			source?: THREE.Texture | null
		) => {
			if (!source) return
			target.channel = source.channel
			target.repeat.copy(source.repeat)
			target.offset.copy(source.offset)
			target.center.copy(source.center)
			target.rotation = source.rotation
			target.matrixAutoUpdate = source.matrixAutoUpdate
			target.matrix.copy(source.matrix)
		}

		if (textures.nrm) {
			fetch(textures.nrm)
				.then((response) => {
					if (!response.ok) throw new Error(`HTTP ${response.status}`)
					return response.arrayBuffer()
				})
				.then((buffer) => {
					if (cancelled) return
					try {
						const decoded = decodeAti2Dds(buffer)
						const texture = configureDataTexture(
							new THREE.DataTexture(
								decoded.data,
								decoded.width,
								decoded.height,
								THREE.RGBAFormat
							)
						)
						ownedTextures.push(texture)
						setBaseNormalMap({ texture, decoded: true })
					} catch {
						setBaseNormalMap({
							texture: loadDds(textures.nrm as string),
							decoded: false,
						})
					}
				})
				.catch((error) =>
					console.error(
						`Failed to load normal map ${textures.nrm}`,
						error
					)
				)
		}

		scene.traverse((child) => {
			if (!(child as THREE.Mesh).isMesh) return
			const mesh = child as THREE.Mesh
			const materials = (
				Array.isArray(mesh.material) ? mesh.material : [mesh.material]
			) as THREE.MeshStandardMaterial[]
			for (const mat of materials) {
				if (textures.diff) {
					try {
						const texture = loadDds(
							textures.diff,
							THREE.SRGBColorSpace
						)
						if (uvChannel !== undefined) {
							texture.channel = uvChannel
							texture.wrapS = THREE.ClampToEdgeWrapping
							texture.wrapT = THREE.ClampToEdgeWrapping
						} else if (weapon) {
							texture.channel = 0
							texture.wrapS = THREE.ClampToEdgeWrapping
							texture.wrapT = THREE.ClampToEdgeWrapping
						} else {
							texture.wrapS = THREE.RepeatWrapping
						}
						copyUvTransform(texture, mat.map)
						mat.map = texture
					} catch {
						// The model remains renderable when an optional DDS cannot be loaded.
					}
				}
				if (textures.emi && !mat.emissiveMap) {
					const texture = loadDds(textures.emi, THREE.SRGBColorSpace)
					if (uvChannel !== undefined) texture.channel = uvChannel
					copyUvTransform(texture, mat.emissiveMap)
					mat.emissiveMap = texture
					mat.emissive.setRGB(1, 1, 1)
					mat.emissiveIntensity = 1
				}
				if (
					textures.spek &&
					(mat as THREE.MeshPhysicalMaterial).isMeshPhysicalMaterial
				) {
					const physical = mat as THREE.MeshPhysicalMaterial
					const texture = loadDds(textures.spek)
					if (uvChannel !== undefined) texture.channel = uvChannel
					copyUvTransform(texture, physical.specularColorMap)
					physical.specularColorMap = texture
					physical.specularColor.setRGB(1, 1, 1)
					physical.specularIntensity = 1
				}

				mat.metalness = 0.1
				mat.needsUpdate = true
				if (
					TRANSPARENT_MESHES.some((name) => child.name.includes(name))
				) {
					mat.transparent = true
				}
			}
		})
		return () => {
			cancelled = true
			setBaseNormalMap(null)
			for (const texture of new Set(ownedTextures)) texture.dispose()
		}
	}, [scene, textures, weapon, uvChannel])

	useEffect(() => {
		if (!paint) return
		const ddsLoader = new DDSLoader()
		const imageLoader = new THREE.TextureLoader()
		const loadedTextures: THREE.Texture[] = []
		const restores: (() => void)[] = []

		const loadTexture = (url?: string) => {
			if (!url) return null
			const onLoad = (texture: THREE.Texture) => {
				texture.colorSpace = THREE.NoColorSpace
				texture.wrapS = THREE.RepeatWrapping
				texture.wrapT = THREE.RepeatWrapping
				texture.needsUpdate = true
			}
			const texture = url.toLowerCase().endsWith('.dds')
				? ddsLoader.load(url, onLoad, undefined, (error) =>
						console.error(
							`Failed to load paint texture ${url}`,
							error
						)
					)
				: imageLoader.load(url, onLoad, undefined, (error) =>
						console.error(
							`Failed to load paint texture ${url}`,
							error
						)
					)
			loadedTextures.push(texture)
			return texture
		}

		const primaryTexture = loadTexture(paint.texture)
		const primaryAlpha = loadTexture(paint.alpha)
		const primaryEmission = loadTexture(paint.emission)
		const primaryNormal = paint.normal ? loadTexture(paint.normal) : null
		const secondaryTexture = loadTexture(paint.secondary?.texture)
		const secondaryAlpha = loadTexture(paint.secondary?.alpha)
		const secondaryEmission = loadTexture(paint.secondary?.emission)
		const mode = PAINT_MODE[paint.mode]
		const patchedMaterials = new Set<THREE.MeshStandardMaterial>()

		const applyPaint = (normalTexture?: THREE.DataTexture) => {
			scene.traverse((child) => {
				if (!(child as THREE.Mesh).isMesh) return
				if (
					TRANSPARENT_MESHES.some((name) => child.name.includes(name))
				)
					return
				const mesh = child as THREE.Mesh
				const materials = (
					Array.isArray(mesh.material)
						? mesh.material
						: [mesh.material]
				) as THREE.MeshStandardMaterial[]
				for (const material of materials) {
					if (patchedMaterials.has(material)) continue
					if (mode.source === 'diffuse' && !material.map) continue
					if (mode.source === 'normal' && !normalTexture) continue
					if (normalTexture && material.normalMap !== normalTexture) {
						material.normalMap = normalTexture
					}
					// A skin supplies its own normal map for the painted zone.
					// Assigning it here enables three.js tangent-space normal
					// handling (tbn + USE_NORMALMAP_TANGENTSPACE) that the paint
					// shader patch reuses, sampling through the paint UV channel.
					if (primaryNormal && material.normalMap !== primaryNormal) {
						material.normalMap = primaryNormal
					}
					const shaderPatch = createPaintShaderPatch({
						mode: paint.mode,
						useUv1: Boolean(mesh.geometry.getAttribute('uv1')),
						hasPrimaryTexture:
							Boolean(primaryTexture) &&
							(paint.autoSelectPaintColor ?? true),
						hasPrimaryAlpha: Boolean(primaryAlpha),
						hasPrimaryEmission: Boolean(primaryEmission),
						hasPrimaryNormal: Boolean(primaryNormal),
						hasSecondaryTexture:
							Boolean(secondaryTexture) &&
							(paint.autoSelectPaintColor ?? true),
						hasSecondaryAlpha: Boolean(secondaryAlpha),
						hasSecondaryEmission: Boolean(secondaryEmission),
						invertMask: paint.invertMask ?? false,
						secondaryEnabled: paint.secondaryEnabled ?? true,
						overrideSecondarySpecular:
							paint.overrideSecondarySpecular ??
							paint.secondarySpecular !== undefined,
					})
					const previousCompile = material.onBeforeCompile
					const previousCacheKey = material.customProgramCacheKey
					material.onBeforeCompile = (shader, renderer) => {
						previousCompile.call(material, shader, renderer)
						shader.uniforms.stalhubTextureScale = {
							value: paint.uvScale ?? 1,
						}
						shader.uniforms.stalhubPrimaryColor = {
							value: paintColor(paint.color, [0.8, 0.05, 0.03]),
						}
						shader.uniforms.stalhubSecondaryColor = {
							value: paintColor(
								paint.secondary?.color,
								[0.03, 0.08, 0.12]
							),
						}
						shader.uniforms.stalhubSecondarySpecular = {
							value: paintColor(
								paint.secondarySpecular,
								[0.07, 0.07, 0.07]
							),
						}
						if (primaryTexture)
							shader.uniforms.stalhubPrimaryPaint = {
								value: primaryTexture,
							}
						if (primaryAlpha)
							shader.uniforms.stalhubPrimaryAlpha = {
								value: primaryAlpha,
							}
						if (primaryEmission)
							shader.uniforms.stalhubPrimaryEmission = {
								value: primaryEmission,
							}
						if (primaryNormal)
							shader.uniforms.stalhubPrimaryNormal = {
								value: primaryNormal,
							}
						if (secondaryTexture)
							shader.uniforms.stalhubSecondaryPaint = {
								value: secondaryTexture,
							}
						if (secondaryAlpha)
							shader.uniforms.stalhubSecondaryAlpha = {
								value: secondaryAlpha,
							}
						if (secondaryEmission)
							shader.uniforms.stalhubSecondaryEmission = {
								value: secondaryEmission,
							}
						shader.vertexShader = shader.vertexShader
							.replace('void main() {', shaderPatch.vertexHeader)
							.replace(
								'#include <uv_vertex>',
								shaderPatch.vertexMain
							)
						shader.fragmentShader = shader.fragmentShader
							.replace(
								'void main() {',
								shaderPatch.fragmentHeader
							)
							.replace(
								'#include <normal_fragment_maps>',
								shaderPatch.fragmentNormal
							)
							.replace(
								'#include <map_fragment>',
								shaderPatch.fragmentDiffuse
							)
							.replace(
								'#include <emissivemap_fragment>',
								shaderPatch.fragmentEmission
							)
							.replace(
								'#include <lights_physical_fragment>',
								shaderPatch.fragmentSpecular
							)
					}
					material.customProgramCacheKey = () =>
						[
							previousCacheKey.call(material),
							paint.mode,
							paint.texture,
							paint.alpha,
							paint.emission,
							paint.normal,
							paint.color,
							paint.autoSelectPaintColor,
							paint.secondary?.texture,
							paint.secondary?.alpha,
							paint.secondary?.emission,
							paint.secondary?.color,
							paint.secondaryEnabled,
							paint.invertMask,
							paint.overrideSecondarySpecular,
							paint.secondarySpecular,
							paint.uvScale,
							mesh.geometry.getAttribute('uv1') ? 'uv1' : 'uv0',
						].join('|')
					material.needsUpdate = true
					patchedMaterials.add(material)
					restores.push(() => {
						material.onBeforeCompile = previousCompile
						material.customProgramCacheKey = previousCacheKey
						material.needsUpdate = true
					})
				}
			})
		}

		if (mode.source === 'normal') {
			if (baseNormalMap?.decoded)
				applyPaint(baseNormalMap.texture as THREE.DataTexture)
		} else {
			applyPaint()
		}

		return () => {
			for (const restore of restores.reverse()) restore()
			for (const texture of loadedTextures) texture.dispose()
		}
	}, [scene, paint, baseNormalMap])

	useEffect(
		() => () => {
			scene.traverse((child) => {
				if (!(child as THREE.Mesh).isMesh) return
				const material = (child as THREE.Mesh).material
				for (const item of Array.isArray(material)
					? material
					: [material])
					item.dispose()
			})
		},
		[scene]
	)

	useEffect(() => {
		if (onSceneReady) {
			onSceneReady(scene)
		}
	}, [scene, onSceneReady])

	useEffect(() => {
		if (!attachToBone || !attachObjects || attachObjects.length === 0)
			return

		const bone =
			scene.getObjectByName(attachToBone) ??
			scene.getObjectByName(attachToBone + '_0')

		if (!bone || !(bone instanceof THREE.Bone)) return

		const group = new THREE.Group()
		for (const obj of attachObjects) {
			if ((obj as THREE.SkinnedMesh).isSkinnedMesh) {
				const mesh = obj.clone() as THREE.SkinnedMesh
				const origMesh = scene.getObjectByName(
					obj.name
				) as THREE.SkinnedMesh
				if (origMesh?.skeleton) {
					mesh.skeleton = origMesh.skeleton
				}
				group.add(mesh)
			} else {
				group.add(obj.clone())
			}
		}
		bone.add(group)
	}, [scene, attachToBone, attachObjects])

	useEffect(() => {
		if (animations && animations.length > 0) {
			let skinnedMesh: THREE.SkinnedMesh | undefined
			scene.traverse((child) => {
				if ((child as THREE.SkinnedMesh).isSkinnedMesh) {
					skinnedMesh = child as THREE.SkinnedMesh
				}
			})
			if (skinnedMesh?.skeleton) {
				mixerRef.current = new THREE.AnimationMixer(scene)
				const clip = animations.find((a) =>
					a.name
						.toLowerCase()
						.includes('menu_default_stand_unarmed_heavy')
				)
				if (clip) {
					const action = mixerRef.current.clipAction(clip)
					action.reset()
					action.play()
				}
			}
		}
	}, [scene, animations])

	useFrame((_, delta) => {
		if (mixerRef.current) {
			mixerRef.current.update(delta)
		}
	})

	useEffect(() => {
		if (!modalOpen) return

		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				setModalOpen(null)
			}
		}

		window.addEventListener('keydown', onKeyDown)
		return () => window.removeEventListener('keydown', onKeyDown)
	}, [modalOpen])

	const handleMeshClick = (mesh: THREE.Mesh, clickType: 'LMB' | 'RMB') => {
		if (type === 'cont') {
			try {
				const geom = mesh.geometry as THREE.BufferGeometry
				if (!geom.boundingBox) geom.computeBoundingBox()
				const center = new THREE.Vector3()
				if (geom.boundingBox) {
					geom.boundingBox.getCenter(center)
					mesh.localToWorld(center)
					center.add(CONT_OFFSET)
					setModalPos(center.clone())
				} else {
					const pos = new THREE.Vector3()
					mesh.getWorldPosition(pos)
					pos.add(CONT_OFFSET)
					setModalPos(pos)
				}
			} catch (_err) {
				const pos = new THREE.Vector3()
				mesh.getWorldPosition(pos)
				pos.add(CONT_OFFSET)
				setModalPos(pos)
			}
		} else {
			setModalPos(null)
		}

		setModalOpen({ type, clickType })
	}

	const modalElement = useMemo(() => {
		if (!modalOpen) return null

		let htmlPos: THREE.Vector3 | null = null

		if (modalOpen.type === 'armor' && headRef.current) {
			htmlPos = headRef.current
				.getWorldPosition(new THREE.Vector3())
				.add(new THREE.Vector3(-0.7, 0, 0.15))
		} else if (modalOpen.type === 'cont' && modalPos) {
			htmlPos = modalPos.add(new THREE.Vector3(0, 0.3, 0.15))
		}

		if (!htmlPos) return null

		return (
			<Html position={htmlPos} zIndexRange={[1000, 1000]}>
				<QueryProvider>
					<NextIntlClientProvider
						getMessageFallback={({ namespace, key }) =>
							`${namespace ? `${namespace}.` : ''}${key}`
						}
						locale={locale}
						messages={messages}
						onError={(error) => {
							if (error.code === 'MISSING_MESSAGE') return
						}}
					>
						<ModalManager
							clickType={modalOpen.clickType}
							onClose={() => setModalOpen(null)}
							type={modalOpen.type}
						/>
					</NextIntlClientProvider>
				</QueryProvider>
			</Html>
		)
	}, [modalOpen, modalPos, messages, locale])

	return (
		<>
			<primitive
				object={scene}
				{...(interactive
					? {
							onClick: (e: ThreeEvent<MouseEvent>) => {
								e.stopPropagation()
								if (e.object && (e.object as THREE.Mesh).isMesh)
									handleMeshClick(
										e.object as THREE.Mesh,
										'LMB'
									)
							},
							onContextMenu: (e: ThreeEvent<MouseEvent>) => {
								e.stopPropagation()
								if (e.object && (e.object as THREE.Mesh).isMesh)
									handleMeshClick(
										e.object as THREE.Mesh,
										'RMB'
									)
							},
						}
					: {})}
			/>
			{modalElement}
		</>
	)
}
