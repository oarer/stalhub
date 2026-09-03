'use client'

import { PerspectiveCamera } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { BaseModel } from '@/app/calcs/builds/model/Base'
import type { PaintMaskMode } from '@/app/calcs/builds/model/paint'

function hexToRgb01(hex?: string): [number, number, number] | undefined {
	if (!hex) return undefined
	const value = hex.replace('#', '')
	if (!/^[0-9a-fA-F]{6}$/.test(value)) return undefined
	const int = parseInt(value, 16)
	return [
		((int >> 16) & 0xff) / 255,
		((int >> 8) & 0xff) / 255,
		(int & 0xff) / 255,
	]
}

export default function ModelViewer({
	glb,
	textures,
	texture,
	alpha,
	emission,
	normal,
	mode,
	uvScale,
	secondary,
	secondaryEnabled,
	secondaryColor,
	paintEnabled = true,
	weapon,
	uvDebug = false,
	uvChannel = 0,
	onLoad,
}: {
	glb: string
	textures: { diff?: string; emi?: string; nrm?: string; spek?: string }
	texture: string
	alpha?: string
	emission?: string
	normal?: string
	mode: PaintMaskMode
	uvScale?: number
	secondary?: { texture?: string; alpha?: string; emission?: string }
	secondaryEnabled?: boolean
	secondaryColor?: string
	paintEnabled?: boolean
	weapon?: boolean
	uvDebug?: boolean
	uvChannel?: 0 | 1
	onLoad?: () => void
}) {
	const [scene, setScene] = useState<THREE.Group | null>(null)

	const handleSceneReady = useCallback(
		(group: THREE.Group) => {
			setScene(group)
			onLoad?.()
		},
		[onLoad]
	)

	return (
		<Canvas camera={{ fov: 45, position: [0, 1.1, 3.8] }}>
			<PerspectiveCamera makeDefault />
			<ambientLight intensity={8} />
			{scene && <FrameModel scene={scene} />}
			{scene && uvDebug && (
				<UvDebugOverlay channel={uvChannel} scene={scene} />
			)}
			<FreeLook />
			<Suspense fallback={null}>
				<BaseModel
					glb={glb}
					interactive={false}
					onSceneReady={handleSceneReady}
					paint={
						paintEnabled
							? {
									texture,
									alpha,
									emission,
									normal,
									mode,
									uvScale,
									secondary: secondaryEnabled
										? {
												...secondary,
												color: hexToRgb01(
													secondaryColor
												),
											}
										: undefined,
									secondaryEnabled,
								}
							: undefined
					}
					textures={textures}
					type="armor"
					uvChannel={uvDebug ? uvChannel : undefined}
					weapon={weapon}
				/>
			</Suspense>
		</Canvas>
	)
}

function FrameModel({ scene }: { scene: THREE.Group }) {
	const { camera } = useThree()

	useEffect(() => {
		scene.updateWorldMatrix(true, true)
		const bounds = new THREE.Box3().setFromObject(scene)
		if (bounds.isEmpty()) return
		const center = bounds.getCenter(new THREE.Vector3())
		const size = bounds.getSize(new THREE.Vector3())
		const radius = Math.max(size.x, size.y, size.z) * 0.5
		const perspective = camera as THREE.PerspectiveCamera
		const distance =
			radius / Math.tan(THREE.MathUtils.degToRad(perspective.fov / 2))
		camera.position.set(
			center.x,
			center.y + radius * 0.15,
			center.z + distance * 1.25
		)
		camera.lookAt(center)
		perspective.near = Math.max(0.01, distance / 100)
		perspective.far = Math.max(100, distance * 100)
		perspective.updateProjectionMatrix()
	}, [camera, scene])

	return null
}

function FreeLook() {
	const { camera, gl } = useThree()
	const keys = useRef<Record<string, boolean>>({})
	const dragging = useRef(false)

	useEffect(() => {
		const canvas = gl.domElement
		const onKey = (event: KeyboardEvent) => {
			keys.current[event.code] = event.type === 'keydown'
		}
		const onDown = (event: MouseEvent) => {
			if (event.button === 0) {
				dragging.current = true
				canvas.requestPointerLock?.()
			}
		}
		const onUp = () => {
			dragging.current = false
			if (document.pointerLockElement === canvas)
				document.exitPointerLock()
		}
		const onMove = (event: MouseEvent) => {
			if (!dragging.current) return
			camera.rotation.order = 'YXZ'
			camera.rotation.y -= event.movementX * 0.0025
			camera.rotation.x = Math.max(
				-1.5,
				Math.min(1.5, camera.rotation.x - event.movementY * 0.0025)
			)
		}
		window.addEventListener('keydown', onKey)
		window.addEventListener('keyup', onKey)
		canvas.addEventListener('mousedown', onDown)
		window.addEventListener('mouseup', onUp)
		window.addEventListener('mousemove', onMove)
		return () => {
			window.removeEventListener('keydown', onKey)
			window.removeEventListener('keyup', onKey)
			canvas.removeEventListener('mousedown', onDown)
			window.removeEventListener('mouseup', onUp)
			window.removeEventListener('mousemove', onMove)
		}
	}, [camera, gl])

	useFrame((_, delta) => {
		const direction = new THREE.Vector3()
		if (keys.current.KeyW) direction.z -= 1
		if (keys.current.KeyS) direction.z += 1
		if (keys.current.KeyA) direction.x -= 1
		if (keys.current.KeyD) direction.x += 1
		if (keys.current.KeyQ) direction.y -= 1
		if (keys.current.KeyE || keys.current.Space) direction.y += 1
		if (direction.lengthSq() === 0) return
		direction.normalize().applyQuaternion(camera.quaternion)

		camera.position.addScaledVector(
			direction,
			(keys.current.ShiftLeft || keys.current.ShiftRight ? 5 : 2.5) *
				delta
		)
	})
	return null
}

function UvDebugOverlay({
	scene,
	channel,
}: {
	scene: THREE.Group
	channel: 0 | 1
}) {
	const ref = useRef<THREE.Points>(null)

	useEffect(() => {
		const host = ref.current
		if (!host) return
		host.clear()

		const colors: number[] = []
		const positions: number[] = []

		scene.traverse((child) => {
			if (!(child as THREE.Mesh).isMesh) return
			const mesh = child as THREE.Mesh
			const geometry = mesh.geometry as THREE.BufferGeometry
			const uv = geometry.getAttribute(`uv${channel}`) as
				| THREE.BufferAttribute
				| undefined
			const position = geometry.getAttribute('position')
			if (!uv || !position) return
			if (uv.count !== position.count) return

			const vector = new THREE.Vector3()
			mesh.updateWorldMatrix(true, false)
			for (let i = 0; i < uv.count; i++) {
				const u = uv.getX(i)
				const v = uv.getY(i)
				vector
					.fromBufferAttribute(position, i)
					.applyMatrix4(mesh.matrixWorld)
				positions.push(vector.x, vector.y, vector.z)
				colors.push((u + 1) / 2, (v + 1) / 2, 1)
			}
		})

		if (positions.length === 0) return

		const geom = new THREE.BufferGeometry()
		geom.setAttribute(
			'position',
			new THREE.Float32BufferAttribute(positions, 3)
		)
		geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
		const points = new THREE.Points(
			geom,
			new THREE.PointsMaterial({
				size: 0.004,
				vertexColors: true,
				sizeAttenuation: true,
				transparent: true,
				opacity: 0.95,
			})
		)
		host.add(points)

		return () => {
			host.remove(points)
			points.geometry.dispose()
		}
	}, [scene, channel])

	return <points ref={ref} visible />
}
