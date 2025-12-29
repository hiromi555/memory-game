import React, { useRef, useLayoutEffect, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import { MathUtils, Vector3 } from 'three'

export function Card({ position, number, flipped, onPointerDown }) {
  const groupRef = useRef()
  const texture = useTexture(`textures/${number}.png`)
  const [targetPosition] = useState(() => new Vector3())

  const speed = useMemo(() => 0.07 + Math.random() * 0.05, [])

  useLayoutEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.set(Math.random() * 2 - 1, 6, 0) // 少し散らして降らせる
      groupRef.current.rotation.set(0, Math.PI, 0)
    }
  }, [])

  useFrame(() => {
    if (!groupRef.current) return
    targetPosition.set(position[0], position[1], position[2])
    groupRef.current.position.lerp(targetPosition, speed) // 個別スピード適用

    const targetRotationY = flipped ? 0 : Math.PI
    groupRef.current.rotation.y = MathUtils.lerp(
      groupRef.current.rotation.y,
      targetRotationY,
      speed
    )
  })

  return (
    <group ref={groupRef} onPointerDown={onPointerDown}>
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[0.9, 1.3]} />
        <meshStandardMaterial
          map={texture}
          transparent
          roughness={0.8}
        />
      </mesh>

      <mesh position={[0, 0, -0.01]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[0.9, 1.3]} />
        <meshStandardMaterial color="#FFB7C5" roughness={0.5} />
      </mesh>
    </group>
  )
}
