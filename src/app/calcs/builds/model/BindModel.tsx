'use client'

import { useAnimations, useGLTF } from '@react-three/drei'
import { useEffect } from 'react'
import type * as THREE from 'three'

export function BindModel({
	onAnimationsReady,
	animationName,
	onSceneReady,
}: {
	onAnimationsReady?: (animations: THREE.AnimationClip[]) => void
	animationName?: string
	onSceneReady?: (scene: THREE.Group) => void
}) {
	const { scene, animations } = useGLTF('/models/steve.glb')
	const { actions } = useAnimations(animations, scene)

	useEffect(() => {
		const wanted = (
			animationName ?? 'menu_default_stand_unarmed_heavy'
		).toLowerCase()
		const animName = Object.keys(actions).find((name) =>
			name.toLowerCase().includes(wanted)
		)
		const action = animName ? actions[animName] : null
		if (!action) return
		action.reset().fadeIn(0.2).play()
		return () => {
			action.fadeOut(0.2)
		}
	}, [actions, animationName])

	useEffect(() => {
		scene.traverse((child) => {
			if ((child as THREE.Mesh).isMesh) {
				const mesh = child as THREE.Mesh
				mesh.castShadow = true
				mesh.receiveShadow = true
			}
		})
		onAnimationsReady?.(animations)
		onSceneReady?.(scene)
	}, [scene, animations, onAnimationsReady, onSceneReady])

	return <primitive object={scene} position={[0, 0, 0]} scale={1} />
}
