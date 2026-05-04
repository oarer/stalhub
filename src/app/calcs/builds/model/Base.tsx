import { Html, useGLTF } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import { useFrame } from '@react-three/fiber'
import { NextIntlClientProvider, useLocale, useMessages } from 'next-intl'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { DDSLoader } from 'three-stdlib'
import QueryProvider from '@/providers/QueryProvider'
import ModalManager from './modals/Manager'

type ModelType = 'armor' | 'cont'

type BaseModelProps = {
	glb: string
	textures: {
		diff?: string
		emi?: string
		nrm?: string
	}
	type: ModelType
	animations?: THREE.AnimationClip[]
	onSceneReady?: (scene: THREE.Group) => void
	attachToBone?: string
	attachObjects?: THREE.Object3D[]
}

type ModalProps = {
	type: ModelType
	clickType: 'LMB' | 'RMB'
}

export function BaseModel({
	glb,
	textures,
	type,
	animations,
	onSceneReady,
	attachToBone,
	attachObjects,
}: BaseModelProps) {
	const locale = useLocale()
	const messages = useMessages()

	const { scene } = useGLTF(glb)
	const mixerRef = useRef<THREE.AnimationMixer | null>(null)
	//! TODO я надеюсь смогу вернуть эту шляпу, ебаная залупа в виде анимки сломала всё
	// const [hoveredId, setHoveredId] = useState<string | null>(null)
	const [modalOpen, setModalOpen] = useState<ModalProps | null>(null)

	const [modalPos, setModalPos] = useState<THREE.Vector3 | null>(null)
	const headRef = useRef<THREE.Object3D | null>(null)

	const contOffset = [0.4, 0.28, 0.15]

	const transparentMeshes = ['soft', 'wire']

	useEffect(() => {
		const ddsLoader = new DDSLoader()
		const head = scene.getObjectByName('head_nub')
		if (head) headRef.current = head

		scene.traverse((child) => {
			if (!(child as THREE.Mesh).isMesh) return
			const mesh = child as THREE.Mesh
			const mat = mesh.material as THREE.MeshStandardMaterial

			if (textures.diff) {
				try {
					const t = ddsLoader.load(textures.diff)
					t.colorSpace = THREE.SRGBColorSpace
					t.wrapS = THREE.RepeatWrapping
					t.offset.x = -1
					mat.map = t
				} catch {
					// Intentionally empty - texture loading failure ignored
				}
			}
			if (textures.emi) {
				try {
					const t = ddsLoader.load(textures.emi)
					mat.emissiveMap = t
					mat.emissive = new THREE.Color(0xffffff)
					mat.emissiveIntensity = 1
				} catch {
					// Intentionally empty - texture loading failure ignored
				}
			}
			if (textures.nrm) {
				try {
					const t = ddsLoader.load(textures.nrm)
					t.colorSpace = THREE.NoColorSpace
					mat.normalMap = t
				} catch {
					// Intentionally empty - texture loading failure ignored
				}
			}
			mat.metalness = 0.1
			mat.needsUpdate = true

			if (transparentMeshes.some((name) => child.name.includes(name))) {
				mat.transparent = true
			}
		})
	}, [scene, textures])

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
					center.add(new THREE.Vector3(...contOffset))
					setModalPos(center.clone())
				} else {
					const pos = new THREE.Vector3()
					mesh.getWorldPosition(pos)
					pos.add(new THREE.Vector3(...contOffset))
					setModalPos(pos)
				}
			} catch (_err) {
				const pos = new THREE.Vector3()
				mesh.getWorldPosition(pos)
				pos.add(new THREE.Vector3(...contOffset))
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
					<NextIntlClientProvider locale={locale} messages={messages}>
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

	useEffect(() => {
		if (animations && animations.length > 0) {
			let foundSkeleton: THREE.Skeleton | undefined
			scene.traverse((child) => {
				if (child instanceof THREE.Bone) {
					const obj = child.parent
					if (obj && (obj as THREE.SkinnedMesh).isSkinnedMesh) {
						foundSkeleton = (obj as THREE.SkinnedMesh).skeleton
					}
				}
			})
			if (foundSkeleton) {
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

	return (
		<>
			<primitive
				object={scene}
				onClick={(e: ThreeEvent<MouseEvent>) => {
					e.stopPropagation()
					if (e.object && (e.object as THREE.Mesh).isMesh) {
						handleMeshClick(e.object as THREE.Mesh, 'LMB')
					}
				}}
				onContextMenu={(e: ThreeEvent<MouseEvent>) => {
					e.stopPropagation()
					if (e.object && (e.object as THREE.Mesh).isMesh) {
						handleMeshClick(e.object as THREE.Mesh, 'RMB')
					}
				}}
			/>
			{modalElement}
		</>
	)
}
