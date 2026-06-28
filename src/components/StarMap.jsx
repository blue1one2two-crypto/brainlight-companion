import React, { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { gsap } from 'gsap'

const vertexShader = `
  uniform float uTime;
  uniform float uTransition;
  attribute vec3 aTarget;
  attribute float aSize;
  varying vec3 vColor;

  void main() {
    vColor = color;
    
    // Smoothly interpolate between original position (sphere) and target (galaxy)
    vec3 pos = mix(position, aTarget, uTransition);
    
    // Add some organic turbulence
    pos.x += sin(uTime * 0.2 + position.y) * 0.1 * (1.0 - uTransition);
    pos.y += cos(uTime * 0.2 + position.z) * 0.1 * (1.0 - uTransition);
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = aSize * (20.0 / -mvPosition.z) * (1.0 + uTransition * 0.5);
    gl_Position = projectionMatrix * mvPosition;
  }
`

const fragmentShader = `
  varying vec3 vColor;
  void main() {
    float d = distance(gl_PointCoord, vec2(0.5));
    if (d > 0.5) discard;
    
    float strength = 1.0 - (d * 2.0);
    strength = pow(strength, 2.0);
    
    gl_FragColor = vec4(vColor, strength);
  }
`

const StarMap = ({ count = 40000, activeScene = 'void' }) => {
    const mesh = useRef()
    const material = useRef()

    const [positions, targets, colors, sizes] = useMemo(() => {
        const pos = new Float32Array(count * 3)
        const tar = new Float32Array(count * 3)
        const cols = new Float32Array(count * 3)
        const szs = new Float32Array(count)

        const color1 = new THREE.Color("#8A2BE2") // Purple
        const color2 = new THREE.Color("#00D2FF") // Blue
        const colorWhite = new THREE.Color("#FFFFFF")

        for (let i = 0; i < count; i++) {
            // SPHERE (Void State)
            const theta = Math.random() * Math.PI * 2
            const phi = Math.acos(2 * Math.random() - 1)
            const r = 2 + Math.random() * 0.1
            const x = r * Math.sin(phi) * Math.cos(theta)
            const y = r * Math.sin(phi) * Math.sin(theta)
            const z = r * Math.cos(phi)
            pos.set([x, y, z], i * 3)

            // GALAXY (StarMap State)
            const angle = Math.random() * Math.PI * 8 // Multiple rotations for spiral
            const radius = 5 + Math.random() * 20
            const spiral = radius * 0.2
            const tx = radius * Math.cos(angle + spiral)
            const ty = (Math.random() - 0.5) * (10 / (radius + 0.5))
            const tz = radius * Math.sin(angle + spiral)
            tar.set([tx, ty, tz], i * 3)

            // COLORS
            const mixedColor = color1.clone().lerp(color2, Math.random())
            if (Math.random() > 0.98) mixedColor.lerp(colorWhite, 0.9)
            cols.set([mixedColor.r, mixedColor.g, mixedColor.b], i * 3)

            szs[i] = Math.random() * 1.5 + 0.5
        }
        return [pos, tar, cols, szs]
    }, [count])

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uTransition: { value: 0 }
    }), [])

    useEffect(() => {
        if (activeScene === 'archive') {
            gsap.to(uniforms.uTransition, {
                value: 1,
                duration: 4,
                ease: "expo.inOut"
            })
        } else {
            gsap.to(uniforms.uTransition, {
                value: 0,
                duration: 2,
                ease: "power2.inOut"
            })
        }
    }, [activeScene, uniforms])

    useFrame((state) => {
        const time = state.clock.getElapsedTime()
        uniforms.uTime.value = time
        mesh.current.rotation.y = time * 0.03
        if (activeScene === 'void') {
            mesh.current.rotation.x = Math.sin(time * 0.2) * 0.1
        }
    })

    return (
        <points ref={mesh}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={positions.length / 3}
                    array={positions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-aTarget"
                    count={targets.length / 3}
                    array={targets}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-color"
                    count={colors.length / 3}
                    array={colors}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-aSize"
                    count={sizes.length}
                    array={sizes}
                    itemSize={1}
                />
            </bufferGeometry>
            <shaderMaterial
                ref={material}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                transparent
                vertexColors
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </points>
    )
}

export default StarMap
