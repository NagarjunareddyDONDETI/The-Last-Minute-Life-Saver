import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Icosahedron, Sphere } from '@react-three/drei'
import { useRef, useMemo, Suspense } from 'react'
import * as THREE from 'three'

function Core({ thinking, panic }: { thinking: boolean; panic: boolean }) {
  const mesh = useRef<THREE.Mesh>(null)
  const wire = useRef<THREE.Mesh>(null)
  const mat = useRef<THREE.MeshStandardMaterial>(null)

  const colorA = useMemo(() => new THREE.Color(panic ? '#ef4444' : '#3b82f6'), [panic])
  const colorB = useMemo(() => new THREE.Color(panic ? '#f97316' : '#e935c1'), [panic])

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    const speed = thinking ? 1.8 : 0.5
    if (mesh.current) {
      mesh.current.rotation.y += delta * speed
      mesh.current.rotation.x += delta * speed * 0.4
      // gentle, contained pulse so it never looks like it's "expanding"
      const pulse = 1 + Math.sin(t * (thinking ? 5 : 2)) * (thinking ? 0.045 : 0.02)
      mesh.current.scale.setScalar(pulse)
    }
    if (wire.current) {
      wire.current.rotation.y -= delta * speed * 0.7
      wire.current.rotation.z += delta * speed * 0.3
    }
    if (mat.current) {
      const mix = (Math.sin(t * 1.5) + 1) / 2
      mat.current.color.copy(colorA).lerp(colorB, mix)
      mat.current.emissive.copy(colorA).lerp(colorB, mix)
      mat.current.emissiveIntensity = thinking ? 1.6 : 0.8
    }
  })

  return (
    <Float speed={1.3} rotationIntensity={0.25} floatIntensity={0.45}>
      <Sphere ref={mesh} args={[1, 64, 64]}>
        <meshStandardMaterial
          ref={mat}
          metalness={0.6}
          roughness={0.15}
          emissive="#8b5cf6"
          emissiveIntensity={1}
        />
      </Sphere>
      <Icosahedron ref={wire} args={[1.45, 1]}>
        <meshBasicMaterial color={panic ? '#fca5a5' : '#a78bfa'} wireframe transparent opacity={0.4} />
      </Icosahedron>
    </Float>
  )
}

/**
 * Three.js implementation of the agent orb. Loaded lazily via AgentOrb so the
 * heavy 3D stack is fetched on demand rather than blocking first paint.
 */
export default function OrbCanvas({ thinking, panic }: { thinking: boolean; panic: boolean }) {
  return (
    <Canvas camera={{ position: [0, 0, 4], fov: 45 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
      <Suspense fallback={null}>
        <ambientLight intensity={0.6} />
        <pointLight position={[3, 3, 3]} intensity={2.4} color={panic ? '#ef4444' : '#8b5cf6'} />
        <pointLight position={[-3, -2, 2]} intensity={1.6} color={panic ? '#f97316' : '#3b82f6'} />
        <Core thinking={thinking} panic={panic} />
      </Suspense>
    </Canvas>
  )
}
