'use client'

import { Suspense, useEffect, useRef } from 'react'

import { Canvas } from '@react-three/fiber'
import {
    Html,
    OrbitControls,
    PerspectiveCamera,
    useGLTF,
} from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'

import { Skeleton } from '@/components/ui/Skeleton'

function Loader() {
    return (
        <Html center>
            <Skeleton className="h-[50vh] max-h-105 w-[60vw] max-w-[320px]" />
        </Html>
    )
}

function ModelControls() {
    const gltf = useGLTF('/models/stalki.glb')
    const scene = gltf.scene

    const modelRef = useRef<THREE.Object3D | null>(null)

    const controlsRef = useRef<OrbitControlsImpl | null>(null)

    useEffect(() => {
        const camera = new THREE.PerspectiveCamera()
        const targetObject = modelRef.current ?? scene
        if (!targetObject) return

        const box = new THREE.Box3().setFromObject(targetObject)
        const center = box.getCenter(new THREE.Vector3())
        const size = box.getSize(new THREE.Vector3())
        const maxDim = Math.max(size.x, size.y, size.z)

        if (controlsRef.current) {
            controlsRef.current.target.copy(center)
            controlsRef.current.update()
        }

        const fov = (camera.fov * Math.PI) / 180
        const distance = Math.abs(maxDim / 2 / Math.tan(fov / 2)) * 1.2
        camera.position.set(
            center.x,
            center.y + maxDim * 0.25,
            center.z + distance
        )
        camera.lookAt(center)
    }, [scene])

    return (
        <>
            {/* eslint-disable-next-line react/no-unknown-property */}
            <primitive object={scene} ref={modelRef} />
            <OrbitControls enableDamping ref={controlsRef} />
        </>
    )
}

export default function Model() {
    return (
        <div className="h-full w-full">
            <Canvas
                camera={{ position: [0, 1.5, 4], fov: 50 }}
                gl={{ toneMappingExposure: 1.2 }}
            >
                <PerspectiveCamera
                    makeDefault
                    position={[2, 1, -1]}
                    rotation={[0.5, 0.8, 0]}
                />

                <Suspense fallback={<Loader />}>
                    <ModelControls />
                </Suspense>

                <EffectComposer>
                    <Bloom
                        intensity={0.6}
                        luminanceSmoothing={0.6}
                        luminanceThreshold={1}
                        radius={0.7}
                    />
                </EffectComposer>
            </Canvas>
        </div>
    )
}
