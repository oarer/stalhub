'use client'

import { Html, OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { Canvas, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import { Suspense, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { Skeleton } from '@/components/ui/Skeleton'
import { BaseModel } from './Base'
import { BindModel } from './BindModel'

function Loader() {
	return (
		<Html center>
			<Skeleton className="h-[50vh] w-[60vw] max-w-[320px]" />
		</Html>
	)
}

type SceneProps = {
	armor: {
		glb: string
		textures: {
			diff?: string
			emi?: string
			nrm?: string
		}
	}
	cont: {
		glb: string
		textures: {
			diff?: string
			emi?: string
			nrm?: string
		}
	}
}

function AutoCenter({
	targetRef,
	controlsRef,
}: {
	targetRef: React.RefObject<THREE.Object3D | null>
	controlsRef: React.RefObject<OrbitControlsImpl | null>
}) {
	const { camera } = useThree()

	useEffect(() => {
		const el = targetRef.current
		const controls = controlsRef.current
		if (!el || !controls) return
		if (!(camera instanceof THREE.PerspectiveCamera)) return

		el.updateWorldMatrix(true, true)

		const box = new THREE.Box3().setFromObject(el)
		if (box.isEmpty()) return

		const center = new THREE.Vector3()
		box.getCenter(center)

		controls.target.copy(center)
		controls.update()
		const size = new THREE.Vector3()
		box.getSize(size)
		const maxDim = Math.max(size.x, size.y, size.z)

		const fov = (camera.fov * Math.PI) / 180
		const distance = Math.abs(maxDim / (2 * Math.tan(fov / 2))) * 1.2

		camera.position.set(center.x, center.y + maxDim * 0.25, -3)
		camera.near = Math.max(0.1, distance / 1000)
		camera.updateProjectionMatrix()

		controls.update()
	}, [controlsRef.current, targetRef.current, camera])

	return null
}

export default function Scene({ armor, cont }: SceneProps) {
	const armorRef = useRef<THREE.Group | null>(null)
	const controlsRef = useRef<OrbitControlsImpl | null>(null)
	const [animations, setAnimations] = useState<THREE.AnimationClip[]>([])
	const [contObjects, setContObjects] = useState<THREE.Object3D[]>([])

	return (
		<Canvas camera={{ fov: 50 }} style={{ overflow: 'visible' }}>
			<ambientLight intensity={2} />

			<PerspectiveCamera makeDefault position={[0, 2, 3]} />
			<OrbitControls
				enableDamping
				enablePan={false}
				enableZoom={false}
				maxDistance={8}
				minDistance={2}
				ref={controlsRef}
			/>

			<Suspense fallback={<Loader />}>
				<BindModel onAnimationsReady={setAnimations} />

				<group ref={armorRef}>
					<BaseModel
						{...armor}
						animations={animations}
						attachObjects={contObjects}
						attachToBone="pelvic"
						type="armor"
					/>
				</group>

				<BaseModel
					{...cont}
					onSceneReady={(scene) => setContObjects(scene.children)}
					type="cont"
				/>

				<AutoCenter controlsRef={controlsRef} targetRef={armorRef} />
			</Suspense>

			<EffectComposer>
				<Bloom intensity={0.6} radius={0.7} />
			</EffectComposer>
		</Canvas>
	)
}
