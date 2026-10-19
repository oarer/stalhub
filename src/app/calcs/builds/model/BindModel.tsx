'use client'

import { useAnimations, useGLTF } from '@react-three/drei'
import { useEffect } from 'react'
import type * as THREE from 'three'

export function BindModel({
	onAnimationsReady,
}: {
	onAnimationsReady?: (animations: THREE.AnimationClip[]) => void
}) {
	const { scene, animations } = useGLTF('/public/models/steve.glb')
	const { actions } = useAnimations(animations, scene)

	useEffect(() => {
		const animName = Object.keys(actions).find((name) =>
			name.toLowerCase().includes('menu_default_stand_unarmed_heavy')
		)
		const action = animName ? actions[animName] : null
		if (action) {
			action.reset()
			action.play()
		}
	}, [actions])

	useEffect(() => {
		scene.traverse((child) => {
			if ((child as THREE.Mesh).isMesh) {
				const mesh = child as THREE.Mesh
				mesh.castShadow = true
				mesh.receiveShadow = true
			}
		})

		onAnimationsReady?.(animations)
	}, [scene, animations, onAnimationsReady])

	return <primitive object={scene} position={[0, 0, 0]} scale={1} />
}
