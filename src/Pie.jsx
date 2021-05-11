import { useSpring, animated, to } from '@react-spring/three'
import { Text } from '@react-three/drei'
import { useLoader } from '@react-three/fiber'
import { sum } from 'd3-array'
import { format } from 'd3-format'
import { scaleLinear } from 'd3-scale'
import { arc, pie } from 'd3-shape'
import React from 'react'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader'
import Billboard from './Billboard'

function makePieDataUri(
  data,
  innerRadius,
  outerRadius,
  cornerRadius,
  padAngle
) {
  const arcs = pie().value((d) => d.value)(data)

  const arcGenerator = arc()
    .innerRadius(innerRadius) // 2
    .outerRadius(outerRadius) // 100
    .cornerRadius(cornerRadius) // 0
    .padAngle(padAngle) // 0.05
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

const usePrevious = (value) => {
  const prevRef = React.useRef(value)
  React.useEffect(() => {
    prevRef.current = value
  }, [value])
  return prevRef.current
}

const Pie = ({
  data,
  innerRadius = 2,
  outerRadius = 100,
  cornerRadius = 0,
  padAngle = 0.05,
  mode = 'stair',
  offsetThickness = 0.15,
  offsetIncrement = offsetThickness,
  onClickSlice,
}) => {
  const prevData = usePrevious(data)
  // const pieSvgDataUri = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxNTAgMTUwKSI+PHBhdGggZD0iTTY5LjM5NjcwMjg0NjU3MDUyLDY2LjEyMTgyNDU2OTEyMTQ2QTQsNCwwLDAsMSw2OS40NjE1NTcyMTM1NTMwNCw3MS45MzgxMTI3NzM4ODU3MkExMDAsMTAwLDAsMCwxLC05Ni4wNTc3Mjc0OTI2MjAxNiwyNy44MDEzMTI3MTk5NjkyNzhBNCw0LDAsMCwxLC05My4xMDU1MDIxMjg3NDA2MSwyMi43ODk1NDg1NjI0NDMyMjZMLTEuNjM1ODM3ODY4NDQ0MDcxMywxLjkxMjE5NDU5MDM3MjYwNDVBMi4zMzM1OTExMTk0MjI2MTc4LDIuMzMzNTkxMTE5NDIyNjE3OCwwLDAsMSwwLjQ2NjU0Nzg0Mzc1ODU5ODM3LDIuNDcyODA5NDkzODI4ODYwN1oiIGZpbGw9InRvbWF0byIgc3Ryb2tlPSJibGFjayI+PC9wYXRoPjxwYXRoIGQ9Ik0tMzEuMjg2ODQ1MjMxNjcyMjAzLC05MC42NTYyMzc2MjEwMjQwOUE0LDQsMCwwLDEsLTI4LjY1NjM1MjA1MDk4MzI4NywtOTUuODA2MTI0NDc2MTAwNzJBMTAwLDEwMCwwLDAsMSwtNS42Nzg4NjkwMzM4NTc0MzMsLTk5LjgzODYyMjAxODIxNjQ1QTQsNCwwLDAsMSwtMS40NTE5OTE3MTc3MzAzMDI4LC05NS44OTIxODg1NDYzMTQwMkwtMC4zNDU3MTIwODMwMDcyNDA3NywtMS45Njk4OTQxOTkxMDM3OTgxWiIgZmlsbD0iI2NjMCIgc3Ryb2tlPSJibGFjayI+PC9wYXRoPjxwYXRoIGQ9Ik0xLjUwMDI0MzcwOTM5MDA3MzYsLTk1Ljg0MjMwNDQzMzU3MTA2QTQsNCwwLDAsMSw1LjcyOTQyMDUzMDYxNDY2LC05OS44MzU3MzM3ODQ5Njk4NUExMDAsMTAwLDAsMCwxLDc3LjIzNTI1NzY4MjQ2NDA4LDYzLjUxOTQwNjI1MjkxOTA2QTQsNCwwLDAsMSw3MS40MzIyMzk0NTM2MDU5Miw2My45MTczOTM2OTY2MTExNUwyLjc3MjE5Mjg3NjkxMzc5MDUsMC41MTc3OTI0NzA1MzEwMTExQTMuOTU1MDkwMTc0NTc4MzI0LDMuOTU1MDkwMTc0NTc4MzI0LDAsMCwxLDEuNTAwMjQzNzA5MzkwMDM2MywtMi4zODc5NzYzODIxNjY3MDNaIiBmaWxsPSIjYzRjIiBzdHJva2U9ImJsYWNrIj48L3BhdGg+PHBhdGggZD0iTS05My43Nzg4OTkzMDgwNjIyMSwxOS44NzMxNjg0NTEzOTgxMDRBNCw0LDAsMCwxLC05OC42MDYyNzcyMzYyNDQ2MiwxNi42MzczNzAyNzMyMzkzMDJBMTAwLDEwMCwwLDAsMSwtMzkuMzc0ODMwNjg1NzcyMTQ2LC05MS45MjE4MjkzMzU5NDU5N0E0LDQsMCwwLDEsLTM0LjA0MTMwNjQzNDc4MDE4LC04OS42MTM2OTQ0NjY1NDE4TC0xLjc1NTY3MzI2MDEyNDg0OTUsLTAuOTU3OTIwMzUzNTE3MjM0MVoiIGZpbGw9IiMwYmIiIHN0cm9rZT0iYmxhY2siPjwvcGF0aD48L2c+PC9zdmc+`
  const pieResults = makePieDataUri(
    data,
    innerRadius,
    outerRadius,
    cornerRadius,
    padAngle
  )
  let [pieSvgDataUri, arcs, arcGenerator] = pieResults

  const shapesRef = React.useRef(undefined)
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0)
  let shapes
  try {
    const loadedSvg = useLoader(SVGLoader, pieSvgDataUri)
    shapes = loadedSvg.paths.flatMap((shapePath) => shapePath.toShapes())
  } catch (promise) {
    throw promise
    // throw promise
    shapes = shapesRef.current
    ;[pieSvgDataUri, arcs, arcGenerator] = makePieDataUri(
      prevData,
      innerRadius,
      outerRadius,
      cornerRadius,
      padAngle
    )
    if (!shapes) throw promise
    promise.then(() => {
      forceUpdate()
    })
  }

  React.useEffect(() => {
    shapesRef.current = shapes
  }, [shapes])

  const [activeSlice, setActiveSlice] = React.useState(undefined)

  if (!shapes) return null

  const extrudeSettings = {
    curveSegments: 256,
    steps: 2,
    depth: 1,
    bevelEnabled: true,
    bevelThickness: 0.01,
    bevelSize: 0.01,
    bevelOffset: 0.0,
    bevelSegments: 1,
  }

  // const heightScale = scaleLinear()
  //   .domain([0, arcs.length - 1])
  //   .range([0.25, 0.65])

  const totalValue = sum(arcs, (d) => d.value)

  return (
    <group>
      {shapes.map((shape, i) => {
        return (
          <PieSlice
            key={i}
            shape={shape}
            i={i}
            totalValue={totalValue}
            height={data[i].height}
            offset={data[i].offset}
            extrudeSettings={extrudeSettings}
            datum={data[i]}
            arcs={arcs}
            arcGenerator={arcGenerator}
            onClick={onClickSlice}
          />
        )
      })}
    </group>
  )
}

export default Pie

const PieSlice = ({
  i,
  shape,
  arcs,
  datum,
  arcGenerator,
  extrudeSettings,
  totalValue,
  height,
  onClick,
  offset = 0,
}) => {
  const sliceColors = ['#c4c', 'tomato', '#0bb', '#cc0']

  const arc = arcs[i]
  const color = datum.color ?? sliceColors[i]
  let xOffset = 0
  let zOffset = 0
  if (datum.explode) {
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

  const springProps = useSpring({
    // xOffset,
    // zOffset,
    height,
    position: [xOffset, height + offset, zOffset],
  })

  return (
    <animated.group key={i} position={springProps.position}>
      <animated.mesh
        rotation={[Math.PI / 2, 0, 0]}
        scale={springProps.height.to((height) => [1, 1, height])}
        onClick={() => onClick?.(i)}
        receiveShadow
        // onPointerEnter={() => setActiveSlice(i)}
        // onPointerLeave={() => setActiveSlice(undefined)}
      >
        {/* <shapeGeometry args={[shape]} /> */}
        <extrudeGeometry args={[shape, extrudeSettings]} />
        {/* <cylinderGeometry args={[1, 1, 0.4, 64]} />*/}
        <meshPhongMaterial
          color={color}
          // roughness={0.2}
          // metalness={1}
        />
        {/* <meshBasicMaterial color={color} side={BackSide} /> */}
      </animated.mesh>
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
    </animated.group>
  )
}

export const SvgPie = ({
  data,
  innerRadius = 2,
  outerRadius = 100,
  cornerRadius = 0,
  padAngle = 0.05,
}) => {
  const [, arcs, arcGenerator] = makePieDataUri(
    data,
    innerRadius,
    outerRadius,
    cornerRadius,
    padAngle
  )

  return (
    <svg width={300} height={300} xmlns="http://www.w3.org/2000/svg">
      <g transform={`translate(150 150)`}>
        {arcs.map((arcData, i) => {
          return (
            <path
              key={arcData.data.id}
              d={arcGenerator(arcData)}
              fill={data[i].color ?? ['#c4c', 'tomato', '#0bb', '#cc0'][i]}
              stroke="black"
            />
          )
        })}
      </g>
    </svg>
  )
}
