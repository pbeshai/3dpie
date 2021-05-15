import { useFrame } from '@react-three/fiber'
import React from 'react'

export default function Turntable({ enabled = true, children, speed = 0.01 }) {
  const ref = React.useRef(null)
  useFrame(() => {
    if (ref.current && enabled) {
      ref.current.rotation.y += speed
    }
  })

  return <group ref={ref}>{children}</group>
}
