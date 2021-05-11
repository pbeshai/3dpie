import Effects from './Effects'
// import { EffectComposer, SSAO, Bloom } from '@react-three/postprocessing'
// import { KernelSize } from 'postprocessing'
import { ContactShadows, Environment, OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { range, shuffle, extent, max, min } from 'd3-array'
import { button, buttonGroup, folder, useControls } from 'leva'
import React, { Suspense } from 'react'
import Pie, { SvgPie } from './Pie'

const palette = shuffle([
  '#f43f5e',
  // '#ec4899',
  '#d946ef',
  // '#a855f7',
  '#8b5cf6',
  // '#6366f1',
  '#3b82f6',
  // '#0ea5e9',
  '#06b6d4',
  // '#14b8a6',
  // '#10b981',
  '#22c55e',
  // '#84cc16',
  '#eab308',
  // '#f59e0b',
  '#f97316',
  // '#ef4444',
])

function distributePrefix(prefix, controlValues, set) {
  const prefixKeys = Object.keys(controlValues).filter((d) =>
    d.startsWith(prefix)
  )
  const prefixExtent = extent(prefixKeys, (key) => controlValues[key])
  const numIncrements = prefixKeys.length - 1
  const increment = (prefixExtent[1] - prefixExtent[0]) / numIncrements
  const update = {}
  let i = 0
  for (const key of prefixKeys) {
    update[key] = prefixExtent[0] + increment * i++
  }
  set(update)
}

function setPrefix(prefix, value, controlValues, set) {
  const prefixKeys = Object.keys(controlValues).filter((d) =>
    d.startsWith(prefix)
  )
  if (value === 'max') {
    value = max(prefixKeys, (key) => controlValues[key])
  } else if (value === 'min') {
    value = min(prefixKeys, (key) => controlValues[key])
  }
  const update = {}
  for (const key of prefixKeys) {
    update[key] = value
  }
  set(update)
}

function App() {
  const controlsRef = React.useRef()
  const controlValuesRef = React.useRef()
  const {
    numSlices,
    innerRadius,
    outerRadius,
    cornerRadius,
    padAngle,
    allHeights,
  } = useControls({
    numSlices: { value: 4, step: 1, min: 2, max: 10, label: '# slices' },
    allHeights: {
      value: 0.3,
      min: 0.01,
      max: 2,
      step: 0.05,
      label: 'all heights',
    },
    innerRadius: {
      value: 2,
      min: 0,
      max: 100,
      step: 1,
      label: 'donut',
    },
    outerRadius: {
      value: 100,
      min: 50,
      max: 300,
      step: 1,
      label: 'outer',
    },
    cornerRadius: {
      value: 10,
      min: 0,
      max: 50,
      step: 1,
      label: 'corner',
    },
    padAngle: {
      value: 0.05,
      min: 0,
      max: Math.PI / 8,
      step: 0.001,
      label: 'pad angle',
    },

    heightButtons: buttonGroup({
      label: 'heights',
      opts: {
        distribute: () => {
          distributePrefix(
            'height',
            controlValuesRef.current[0],
            controlValuesRef.current[1]
          )
        },
        min: () => {
          setPrefix(
            'height',
            'min',
            controlValuesRef.current[0],
            controlValuesRef.current[1]
          )
        },
        max: () => {
          setPrefix(
            'height',
            'max',
            controlValuesRef.current[0],
            controlValuesRef.current[1]
          )
        },
        reset: () => {
          setPrefix(
            'height',
            0.3,
            controlValuesRef.current[0],
            controlValuesRef.current[1]
          )
        },
      },
    }),
    offsetButtons: buttonGroup({
      label: 'offsets',
      opts: {
        distribute: () => {
          distributePrefix(
            'offset',
            controlValuesRef.current[0],
            controlValuesRef.current[1]
          )
        },
        reset: () => {
          setPrefix(
            'offset',
            0,
            controlValuesRef.current[0],
            controlValuesRef.current[1]
          )
        },
      },
    }),
  })
  React.useEffect(() => {
    if (!controlValuesRef.current) return
    setPrefix(
      'height',
      allHeights,
      controlValuesRef.current[0],
      controlValuesRef.current[1]
    )
  }, [allHeights, controlValuesRef])

  const controlConfig = {}
  for (let i = 0; i < numSlices; ++i) {
    const id = `slice ${i}`
    controlConfig[id] = folder({
      [`value${i}`]: { value: Math.random(), label: 'value' },
      details: folder(
        {
          [`color${i}`]: { value: palette[i % palette.length], label: 'color' },
          //`hsl(${Math.random() * 360},${0.7 * 100},${0.5 * 100})`,

          [`explode${i}`]: { value: false, label: 'explode' },
          [`height${i}`]: {
            value: 0.3,
            min: 0.01,
            max: 2,
            step: 0.05,
            label: 'height',
          },
          [`offset${i}`]: {
            value: 0,
            min: 0.0,
            max: 2,
            step: 0.05,
            label: 'offset',
          },
        },
        { collapsed: true }
      ),
    })
  }

  const [controlValues, set] = useControls(() => controlConfig, [numSlices])

  React.useEffect(() => {
    controlValuesRef.current = [controlValues, set]
  }, [controlValues, set])

  const data = []
  for (let i = 0; i < numSlices; ++i) {
    data.push({
      value: controlValues[`value${i}`],
      color: controlValues[`color${i}`],
      explode: controlValues[`explode${i}`],
      height: controlValues[`height${i}`],
      offset: controlValues[`offset${i}`],
    })
  }

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
          <Pie
            data={data}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            cornerRadius={cornerRadius}
            padAngle={padAngle}
            onClickSlice={(i) =>
              set({ [`explode${i}`]: !controlValues[`explode${i}`] })
            }
          />
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
        {/* <GizmoHelper
          alignment={'bottom-left'}
          margin={[80, 80]}
          onTarget={() => controlsRef?.current?.target}
          onUpdate={() => controlsRef.current?.update()}
        >
          <GizmoViewport
            axisColors={['red', 'green', 'blue']}
            labelColor={'white'}
          />
        </GizmoHelper> */}
        <OrbitControls
          ref={controlsRef}
          // minPolarAngle={Math.PI / 2}
          maxPolarAngle={Math.PI / 2}
          // enableZoom={false}
          enablePan={false}
        />
        {/* <Effects /> */}
      </Canvas>
      {/* <div className="absolute top-0 left-0">
        <SvgPie data={data} />
      </div> */}
    </div>
  )
}

export default App
