import { useFrame } from '@react-three/fiber'
import React from 'react'

const Billboard = ({
  follow = true,
  lockX = false,
  lockY = false,
  lockZ = false,
  children,
}) => {
  const child = React.Children.only(children)
  const localRef = React.useRef()

  useFrame(({ camera }) => {
    if (!follow) return
    if (localRef.current) {
      const prev = {
        x: localRef.current.rotation.x,
        y: localRef.current.rotation.y,
        z: localRef.current.rotation.z,
      }
      localRef.current.lookAt(camera.position)
      // readjust any axis that is locked
      if (lockX) localRef.current.rotation.x = prev.x
      if (lockY) localRef.current.rotation.y = prev.y
      if (lockZ) localRef.current.rotation.z = prev.z
    }
  })

  return React.cloneElement(child, { ref: localRef })
}
export default Billboard
