import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const AetherSphere = ({ count = 20000, active = false }) => {
    const points = useRef()
    const material = useRef()

    const [positions, colors, sizes] = useMemo(() => {
        const pos = new Float32Array(count * 3)
        const cols = new Float32Array(count * 3)
        const szs = new Float32Array(count)

        const color1 = new THREE.Color("#8A2BE2") // Cyber Purple
        const color2 = new THREE.Color("#00D2FF") // Aurora Blue
        const colorDivine = new THREE.Color("#FFFFFF") // Divine White

        for (let i = 0; i < count; i++) {
            // Sphere distribution
            const theta = Math.random() * Math.PI * 2
            const phi = Math.acos(2 * Math.random() - 1)
            const r = 2 + Math.random() * 0.2 // Tighter shell for 2026 version

            const x = r * Math.sin(phi) * Math.cos(theta)
            const y = r * Math.sin(phi) * Math.sin(theta)
            const z = r * Math.cos(phi)

            pos.set([x, y, z], i * 3)

            const mixedColor = color1.clone().lerp(color2, Math.random())
            cols.set([mixedColor.r, mixedColor.g, mixedColor.b], i * 3)

            szs[i] = Math.random()
        }
        return [pos, cols, szs]
    }, [count])

    useFrame((state) => {
        const time = state.clock.getElapsedTime()

        // Base rotation
        points.current.rotation.y = time * 0.05
        points.current.rotation.x = Math.sin(time * 0.1) * 0.1

        // Breathing effect intensity
        const breatheSpeed = active ? 4 : 1.5
        const breatheAmount = active ? 0.3 : 0.05
        const s = 1 + Math.sin(time * breatheSpeed) * breatheAmount
        points.current.scale.set(s, s, s)

        // Dynamic material transition
        if (active) {
            material.current.opacity = THREE.MathUtils.lerp(material.current.opacity, 1, 0.1)
            material.current.size = THREE.MathUtils.lerp(material.current.size, 0.05, 0.05)
        } else {
            material.current.opacity = THREE.MathUtils.lerp(material.current.opacity, 0.6, 0.05)
            material.current.size = THREE.MathUtils.lerp(material.current.size, 0.015, 0.05)
        }
    })

    return (
        <points ref={points}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={positions.length / 3}
                    array={positions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-color"
                    count={colors.length / 3}
                    array={colors}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                ref={material}
                size={0.015}
                vertexColors
                transparent
                opacity={0.6}
                sizeAttenuation={true}
                blending={THREE.AdditiveBlending}
            />
        </points>
    )
}

export default AetherSphere
