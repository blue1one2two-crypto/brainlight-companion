import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const EnergyForge = ({ active = false, intensity = 0 }) => {
    const mesh = useRef()
    const particles = useRef()
    const core = useRef()

    const vertexShader = `
        uniform float uTime;
        uniform float uActive;
        uniform float uIntensity;
        varying vec3 vColor;
        varying float vGlow;
        
        void main() {
            vColor = color;
            vec3 pos = position;
            
            float dist = length(pos);
            
            // Nebula Breathing Logic
            float pulse = sin(uTime * 0.5 + dist * 0.2) * 0.1;
            pos *= (1.0 + pulse);

            if (uActive > 0.5) {
                // Gravity Collapse: Pull towards center
                vec3 dir = normalize(pos);
                float collapseSpeed = uIntensity * 1.5;
                pos -= dir * collapseSpeed * (1.0 / (dist + 0.5));
                
                // Acceleration near core
                if(dist < 2.0) {
                    pos -= dir * uIntensity * 0.5;
                }

                // Spiral turbulence
                float angle = uTime * 3.0 + dist * 0.5;
                float s = sin(angle);
                float c = cos(angle);
                mat2 rot = mat2(c, -s, s, c);
                pos.xz *= rot;
            } else {
                // Gentle drift when idle - Nebula mode
                pos.x += sin(uTime * 0.4 + dist) * 0.3;
                pos.y += cos(uTime * 0.3 + dist) * 0.3;
            }

            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            
            // Size based on proximity and intensity
            float size = (70.0 / -mvPosition.z) * (0.8 + uIntensity * 0.6);
            gl_PointSize = size;
            gl_Position = projectionMatrix * mvPosition;
            vGlow = 1.0 / (dist + 0.1);
        }
    `

    const fragmentShader = `
        varying vec3 vColor;
        varying float vGlow;
        void main() {
            float d = distance(gl_PointCoord, vec2(0.5));
            if (d > 0.5) discard;
            
            // Enhanced Nebula Glow
            float alpha = pow(1.0 - d * 2.0, 1.8);
            vec3 finalColor = vColor * (1.2 + vGlow * 0.5);
            gl_FragColor = vec4(finalColor, alpha);
        }
    `

    const [positions, colors] = useMemo(() => {
        const count = 30000
        const pos = new Float32Array(count * 3)
        const cols = new Float32Array(count * 3)

        // Sovereign Nebula Palette (Purple, Blue, Magenta)
        const color1 = new THREE.Color("#8A2BE2") // Deep Purple
        const color2 = new THREE.Color("#00D2FF") // Electric Blue
        const color3 = new THREE.Color("#FF00FF") // Magenta
        const colorWhite = new THREE.Color("#FFFFFF")

        for (let i = 0; i < count; i++) {
            const theta = Math.random() * Math.PI * 2
            const phi = Math.acos(2 * Math.random() - 1)
            const r = 3 + Math.pow(Math.random(), 3) * 5

            pos.set([
                r * Math.sin(phi) * Math.cos(theta),
                r * Math.sin(phi) * Math.sin(theta),
                r * Math.cos(phi)
            ], i * 3)

            let mixed;
            const rand = Math.random();
            if (rand < 0.4) mixed = color1.clone().lerp(color2, Math.random());
            else if (rand < 0.8) mixed = color2.clone().lerp(color3, Math.random());
            else mixed = color3.clone().lerp(colorWhite, Math.random() * 0.3);

            cols.set([mixed.r, mixed.g, mixed.b], i * 3)
        }
        return [pos, cols]
    }, [])

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uActive: { value: 0 },
        uIntensity: { value: 0 }
    }), [])

    useFrame((state) => {
        const time = state.clock.getElapsedTime()
        uniforms.uTime.value = time
        uniforms.uActive.value = active ? 1 : 0
        const targetIntensity = active ? intensity : 0
        uniforms.uIntensity.value = THREE.MathUtils.lerp(uniforms.uIntensity.value, targetIntensity, 0.1)

        if (particles.current) {
            particles.current.rotation.y = time * (0.2 + uniforms.uIntensity.value * 1.5)
            particles.current.rotation.z = time * 0.1
        }

        if (core.current) {
            const scale = 0.5 + uniforms.uIntensity.value * 2.0
            core.current.scale.setScalar(scale)
            core.current.material.opacity = uniforms.uIntensity.value * 0.8
        }
    })

    return (
        <group>
            <points ref={particles}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
                    <bufferAttribute attach="attributes-color" count={colors.length / 3} array={colors} itemSize={3} />
                </bufferGeometry>
                <shaderMaterial
                    vertexShader={vertexShader}
                    fragmentShader={fragmentShader}
                    uniforms={uniforms}
                    transparent
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                    vertexColors
                />
            </points>
            <mesh ref={core}>
                <sphereGeometry args={[1, 32, 32]} />
                <meshBasicMaterial color="#FFFFFF" transparent opacity={0} blending={THREE.AdditiveBlending} />
            </mesh>
        </group>
    )
}

export default EnergyForge
