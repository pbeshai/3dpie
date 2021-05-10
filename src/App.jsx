import React, { Suspense, useRef, useState, useEffect } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
// import Post from './Post'
// import { EffectComposer, SSAO, Bloom } from '@react-three/postprocessing'
// import { KernelSize } from 'postprocessing'
import {
  ContactShadows,
  Environment,
  OrbitControls,
  GizmoViewport,
  GizmoHelper,
  Box,
  Reflector,
  Text,
  Plane,
} from '@react-three/drei'
import { HexColorInput, HexColorPicker } from 'react-colorful'
import { pie, arc } from 'd3-shape'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader'
import { BackSide, Shape } from 'three'
import Effects from './Effects'
import { scaleLinear } from 'd3-scale'
import { range, sum } from 'd3-array'
import { format } from 'd3-format'

function Picker({ color, onChange }) {
  return (
    <div>
      <HexColorPicker className="picker" color={color} onChange={onChange} />
      <HexColorInput
        color={color}
        onChange={onChange}
        className="block w-32 mx-auto mt-2 text-center text-gray-800"
      />
    </div>
  )
}
const Billboard = ({
  follow = true,
  lockX = false,
  lockY = false,
  lockZ = false,
  children,
}) => {
  console.log('children=', children)
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
// const BillboardRenderFn = ({`
//   follow = true,
//   lockX = false,
//   lockY = false,
//   lockZ = false,
//   children, // render function
// }) => {
//   const localRef = React.useRef()

//   useFrame(({ camera }) => {
//     if (!follow) return
//     if (localRef.current) {
//       const prev = {
//         x: localRef.current.rotation.x,
//         y: localRef.current.rotation.y,
//         z: localRef.current.rotation.z,
//       }
//       localRef.current.lookAt(camera.position)
//       // readjust any axis that is locked
//       if (lockX) localRef.current.rotation.x = prev.x
//       if (lockY) localRef.current.rotation.y = prev.y
//       if (lockZ) localRef.current.rotation.z = prev.z
//     }
//   })

//   return children({ ref: localRef })
// }

const BillboardText = ({
  follow = true,
  lockX = false,
  lockY = false,
  lockZ = false,
  ...other
}) => {
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

  return <Text ref={localRef} {...other} />
}

function makePieDataUri(data) {
  const arcs = pie().value((d) => d.value)(data)

  const arcGenerator = arc()
    .innerRadius(2)
    .outerRadius(100)
    .cornerRadius(0)
    .padAngle(0.05)
  const svgDataUri = `data:image/svg+xml;base64,${btoa(`
    <svg xmlns="http://www.w3.org/2000/svg">
    <g transform="scale(0.01)">
      ${arcs.map((arcData, i) => {
        return `<path d="${arcGenerator(arcData)}" />`
      })}
      </g>
    </svg>
  `)}`

  return [svgDataUri, arcs, arcGenerator]
}

const Pie = ({ color = '#ff00ff', data }) => {
  // const pieSvgDataUri = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxNTAgMTUwKSI+PHBhdGggZD0iTTY5LjM5NjcwMjg0NjU3MDUyLDY2LjEyMTgyNDU2OTEyMTQ2QTQsNCwwLDAsMSw2OS40NjE1NTcyMTM1NTMwNCw3MS45MzgxMTI3NzM4ODU3MkExMDAsMTAwLDAsMCwxLC05Ni4wNTc3Mjc0OTI2MjAxNiwyNy44MDEzMTI3MTk5NjkyNzhBNCw0LDAsMCwxLC05My4xMDU1MDIxMjg3NDA2MSwyMi43ODk1NDg1NjI0NDMyMjZMLTEuNjM1ODM3ODY4NDQ0MDcxMywxLjkxMjE5NDU5MDM3MjYwNDVBMi4zMzM1OTExMTk0MjI2MTc4LDIuMzMzNTkxMTE5NDIyNjE3OCwwLDAsMSwwLjQ2NjU0Nzg0Mzc1ODU5ODM3LDIuNDcyODA5NDkzODI4ODYwN1oiIGZpbGw9InRvbWF0byIgc3Ryb2tlPSJibGFjayI+PC9wYXRoPjxwYXRoIGQ9Ik0tMzEuMjg2ODQ1MjMxNjcyMjAzLC05MC42NTYyMzc2MjEwMjQwOUE0LDQsMCwwLDEsLTI4LjY1NjM1MjA1MDk4MzI4NywtOTUuODA2MTI0NDc2MTAwNzJBMTAwLDEwMCwwLDAsMSwtNS42Nzg4NjkwMzM4NTc0MzMsLTk5LjgzODYyMjAxODIxNjQ1QTQsNCwwLDAsMSwtMS40NTE5OTE3MTc3MzAzMDI4LC05NS44OTIxODg1NDYzMTQwMkwtMC4zNDU3MTIwODMwMDcyNDA3NywtMS45Njk4OTQxOTkxMDM3OTgxWiIgZmlsbD0iI2NjMCIgc3Ryb2tlPSJibGFjayI+PC9wYXRoPjxwYXRoIGQ9Ik0xLjUwMDI0MzcwOTM5MDA3MzYsLTk1Ljg0MjMwNDQzMzU3MTA2QTQsNCwwLDAsMSw1LjcyOTQyMDUzMDYxNDY2LC05OS44MzU3MzM3ODQ5Njk4NUExMDAsMTAwLDAsMCwxLDc3LjIzNTI1NzY4MjQ2NDA4LDYzLjUxOTQwNjI1MjkxOTA2QTQsNCwwLDAsMSw3MS40MzIyMzk0NTM2MDU5Miw2My45MTczOTM2OTY2MTExNUwyLjc3MjE5Mjg3NjkxMzc5MDUsMC41MTc3OTI0NzA1MzEwMTExQTMuOTU1MDkwMTc0NTc4MzI0LDMuOTU1MDkwMTc0NTc4MzI0LDAsMCwxLDEuNTAwMjQzNzA5MzkwMDM2MywtMi4zODc5NzYzODIxNjY3MDNaIiBmaWxsPSIjYzRjIiBzdHJva2U9ImJsYWNrIj48L3BhdGg+PHBhdGggZD0iTS05My43Nzg4OTkzMDgwNjIyMSwxOS44NzMxNjg0NTEzOTgxMDRBNCw0LDAsMCwxLC05OC42MDYyNzcyMzYyNDQ2MiwxNi42MzczNzAyNzMyMzkzMDJBMTAwLDEwMCwwLDAsMSwtMzkuMzc0ODMwNjg1NzcyMTQ2LC05MS45MjE4MjkzMzU5NDU5N0E0LDQsMCwwLDEsLTM0LjA0MTMwNjQzNDc4MDE4LC04OS42MTM2OTQ0NjY1NDE4TC0xLjc1NTY3MzI2MDEyNDg0OTUsLTAuOTU3OTIwMzUzNTE3MjM0MVoiIGZpbGw9IiMwYmIiIHN0cm9rZT0iYmxhY2siPjwvcGF0aD48L2c+PC9zdmc+`
  const [pieSvgDataUri, arcs, arcGenerator] = makePieDataUri(data)

  const loadedSvg = useLoader(SVGLoader, pieSvgDataUri)
  const shapes = loadedSvg.paths.flatMap((shapePath) => shapePath.toShapes())
  // .slice(0, 1)

  const sliceColors = ['#c4c', 'tomato', '#0bb', '#cc0']
  const extrudeSettings = {
    curveSegments: 256,
    steps: 2,
    depth: 0.001,
    bevelEnabled: true,
    bevelThickness: 0.01,
    bevelSize: 0.01,
    bevelOffset: 0.0,
    bevelSegments: 1,
  }

  const heightScale = scaleLinear()
    .domain([0, arcs.length - 1])
    .range([0.25, 0.65])

  const totalValue = sum(arcs, (d) => d.value)

  return (
    <group>
      {shapes.map((shape, i) => {
        const arc = arcs[i]
        const color = sliceColors[i]
        const height = heightScale(i)
        let xOffset = 0
        let zOffset = 0

        if (i === 0) {
          // explode the pieces
          // 1. we need to get middle angle of the slice
          const theta = (arc.startAngle + arc.endAngle) / 2 - Math.PI / 2

          // 2. unit direction vector to offset by
          let explosionMagnitude = 0.2

          xOffset = Math.cos(theta) * explosionMagnitude
          zOffset = Math.sin(theta) * explosionMagnitude
        }

        const centroid = arcGenerator.centroid(arc)
        let [xText, zText] = centroid
        xText *= 0.01
        zText *= 0.01
        const yTextOffset = 0.125
        // glorious idea for laziness
        // const percent = (arc.endAngle - arc.startAngle) / (Math.PI * 2)
        const percent = arc.value / totalValue

        return (
          <group key={i} position={[xOffset, height, zOffset]}>
            <mesh rotation={[Math.PI / 2, 0, 0]} receiveShadow>
              {/* <shapeGeometry args={[shape]} /> */}
              <extrudeGeometry
                args={[shape, { ...extrudeSettings, depth: height }]}
              />
              {/* <cylinderGeometry args={[1, 1, 0.4, 64]} />*/}
              <meshPhongMaterial
                color={color}
                // roughness={0.2}
                // metalness={1}
              />
              {/* <meshBasicMaterial color={color} side={BackSide} /> */}
            </mesh>
            <Billboard>
              <Text
                position={[xText, yTextOffset, zText]}
                castShadow
                fontSize={0.2}
                maxWidth={200}
                lineHeight={1}
                letterSpacing={0.02}
                textAlign={'left'}
                font="https://fonts.gstatic.com/s/raleway/v14/1Ptrg8zYS_SKggPNwK4vaqI.woff"
                anchorX="center"
                anchorY="middle"
                fillOpacity={1}
                color="white"
                outlineWidth={'2.5%'}
                outlineColor="#000000"
                outlineOpacity={0.2}
              >
                {format('.0%')(percent)}
              </Text>
            </Billboard>
          </group>
        )
      })}
      {/* 
      {arcs.map((arc, i) => {


        return (
          <Text
            position={[x, height + yOffset, z]}
            castShadow
            fontSize={0.2}
            maxWidth={200}
            lineHeight={1}
            letterSpacing={0.02}
            textAlign={'left'}
            font="https://fonts.gstatic.com/s/raleway/v14/1Ptrg8zYS_SKggPNwK4vaqI.woff"
            anchorX="center"
            anchorY="middle"
            fillOpacity={1}
            fill="white"
            // strokeWidth={'2.5%'}
            // strokeColor="#ffffff"
          >
            95%
          </Text>
        )
      })} */}
    </group>
  )
}

const SvgPie = ({ data }) => {
  const [, arcs, arcGenerator] = makePieDataUri(data)

  return (
    <svg width={300} height={300} xmlns="http://www.w3.org/2000/svg">
      <g transform={`translate(150 150)`}>
        {arcs.map((arcData, i) => {
          return (
            <path
              key={arcData.data.id}
              d={arcGenerator(arcData)}
              fill={['#c4c', 'tomato', '#0bb', '#cc0'][i]}
              stroke="black"
            />
          )
        })}
      </g>
    </svg>
  )
}

const PieInputs = ({ data, onChange }) => {
  const handleChange = (evt) => {
    const index = +evt.target.name
    const value = +evt.target.value

    onChange([
      index === 0 ? { ...data[0], value } : data[0],
      index === 1 ? { ...data[1], value } : data[1],
      index === 2 ? { ...data[2], value } : data[2],
      index === 3 ? { ...data[3], value } : data[3],
    ])
  }

  return (
    <form
      onChange={handleChange}
      className="grid grid-cols-4 gap-2 p-1 text-black"
    >
      <input
        value={data[0].value}
        name="0"
        type="number"
        min={0}
        max={10}
        step={0.1}
      />
      <input
        value={data[1].value}
        name="1"
        type="number"
        min={0}
        max={10}
        step={0.1}
      />
      <input
        value={data[2].value}
        name="2"
        type="number"
        min={0}
        max={10}
        step={0.1}
      />
      <input
        value={data[3].value}
        name="3"
        type="number"
        min={0}
        max={10}
        step={0.1}
      />
    </form>
  )
}

function App() {
  const [color, setColor] = React.useState('#a7e1e9')
  const controlsRef = React.useRef()
  const [data, setData] = React.useState([
    { id: 3, value: 0.9 },
    { id: 1, value: 0.7 },
    { id: 4, value: 0.5 },
    { id: 2, value: 0.12 },
  ])

  return (
    <div id="canvas-container" className="w-full h-full">
      <Canvas shadows dpr={[1, 2]} camera={{ position: [3, 3, 4], fov: 50 }}>
        <ambientLight intensity={0.7} />
        <spotLight
          intensity={0.5}
          angle={0.1}
          penumbra={1}
          position={[10, 15, 10]}
          castShadow
        />

        <Suspense fallback={null}>
          {/* <Box args={[2.5, 0.001, 2.5]}>
            <meshPhongMaterial attach="material" color="#00ff00" wireframe />
          </Box> */}
          <Pie color={color} data={data} />
        </Suspense>
        <Suspense fallback={null}>
          <Environment preset="night" />
        </Suspense>
        <ContactShadows
          rotation-x={Math.PI / 2}
          position={[0, -0.4, 0]}
          opacity={0.65}
          width={30}
          height={30}
          blur={1.5}
          far={0.8}
        />
        <GizmoHelper
          alignment={'bottom-left'}
          margin={[80, 80]}
          onTarget={() => controlsRef?.current?.target}
          onUpdate={() => controlsRef.current?.update()}
        >
          <GizmoViewport
            axisColors={['red', 'green', 'blue']}
            labelColor={'white'}
          />
        </GizmoHelper>
        <OrbitControls
          ref={controlsRef}
          // minPolarAngle={Math.PI / 2}
          // maxPolarAngle={Math.PI / 2}
          // enableZoom={false}
          enablePan={false}
        />
        {/* <Effects /> */}
      </Canvas>
      <div className="absolute top-0 right-0">
        <PieInputs onChange={setData} data={data} />
        {/* <SvgPie data={data} /> */}
      </div>
      {/* <div className="absolute top-0 left-0">
        <Picker color={color} onChange={setColor} />
      </div> */}
    </div>
  )
}

export default App
