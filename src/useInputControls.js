import { extent, max, min } from 'd3-array'
import { buttonGroup, folder, useControls } from 'leva'
import React from 'react'
import { palette } from './theme'

export const environmentFilesMap = {
  none: null,
  sunset: 'venice_sunset_1k.hdr',
  dawn: 'kiara_1_dawn_1k.hdr',
  night: 'dikhololo_night_1k.hdr',
  warehouse: 'empty_warehouse_01_1k.hdr',
  forest: 'forest_slope_1k.hdr',
  apartment: 'lebombo_1k.hdr',
  studio: 'studio_small_03_1k.hdr',
  city: 'potsdamer_platz_1k.hdr',
  park: 'rooitou_park_1k.hdr',
  lobby: 'st_fagans_interior_1k.hdr',
}

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

const useInputControls = () => {
  const controlValuesRef = React.useRef()
  const {
    numSlices,
    innerRadius,
    outerRadius,
    cornerRadius,
    padAngle,
    allHeights,
    environmentFile,
    spotLightIntensity,
    ambientLightIntensity,
    roughness,
    metalness,
    valueLabelPosition,
    showBloom,
    bloomStrength,
    bloomRadius,
    bloomThreshold,
    enableTurntable,
  } = useControls({
    customize: folder({
      dimensions: folder(
        {
          allHeights: {
            value: 0.5,
            min: 0.01,
            max: 2,
            step: 0.05,
            label: 'all heights',
          },
          valueLabelPosition: {
            label: 'labels',
            min: 0,
            max: 1,
            step: 0.01,
            value: 0.65,
          },
          innerRadius: {
            value: 2,
            min: 0,
            max: 100,
            step: 1,
            label: 'donut',
          },
          outerRadius: {
            value: 150,
            min: 50,
            max: 300,
            step: 1,
            label: 'radius',
          },
          cornerRadius: {
            value: 10,
            min: 0,
            max: 50,
            step: 1,
            label: 'corners',
          },
          padAngle: {
            value: 0.05,
            min: 0,
            max: Math.PI / 8,
            step: 0.001,
            label: 'pad angle',
          },
        },
        { collapsed: true }
      ),
      lighting: folder(
        {
          ambientLightIntensity: {
            label: 'ambient',
            min: 0,
            max: 1,
            step: 0.05,
            value: 0.2,
          },
          spotLightIntensity: {
            label: 'spot',
            min: 0,
            max: 1,
            step: 0.05,
            value: 0.75,
          },
          environmentFile: {
            label: 'environment',
            value: 'night',
            options: environmentFilesMap,
          },
        },
        { collapsed: true }
      ),
      material: folder(
        {
          roughness: {
            label: 'roughness',
            min: 0,
            max: 1,
            step: 0.05,
            value: 0.2,
          },
          metalness: {
            label: 'metalness',
            min: 0,
            max: 1,
            step: 0.05,
            value: 0.0,
          },
        },
        { collapsed: true }
      ),
      glow: folder(
        {
          showBloom: {
            label: 'enabled',
            value: false,
          },
          bloomStrength: {
            label: 'strength',
            value: 1,
            min: 0,
            max: 3,
            step: 0.01,
          },
          bloomRadius: {
            label: 'radius',
            value: 1.5,
            min: 0,
            max: 2,
            step: 0.01,
          },
          bloomThreshold: {
            label: 'threshold',
            value: 0.15,
            min: 0,
            max: 1,
            step: 0.01,
          },
        },
        { collapsed: true }
      ),
      positioning: folder(
        {
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
                  0.5,
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
        },
        { collapsed: true }
      ),
    }),
    enableTurntable: { value: false, label: 'spin' },
    numSlices: { value: 4, step: 1, min: 2, max: 10, label: '# slices' },
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
    const id = `slice ${i + 1}`
    controlConfig[id] = folder({
      [`value${i}`]: { value: Math.random(), label: 'value' },
      details: folder(
        {
          [`color${i}`]: { value: palette[i % palette.length], label: 'color' },
          //`hsl(${Math.random() * 360},${0.7 * 100},${0.5 * 100})`,

          [`explode${i}`]: { value: false, label: 'explode' },
          [`height${i}`]: {
            value: 0.5,
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

  return [
    {
      ...controlValues,
      numSlices,
      innerRadius,
      outerRadius,
      cornerRadius,
      padAngle,
      allHeights,
      environmentFile,
      spotLightIntensity,
      ambientLightIntensity,
      roughness,
      metalness,
      valueLabelPosition,
      showBloom,
      bloomStrength,
      bloomRadius,
      bloomThreshold,
      enableTurntable,
    },
    set,
  ]
}
export default useInputControls

export function pieDataFromControls(controlValues) {
  const data = []
  for (let i = 0; i < controlValues.numSlices; ++i) {
    data.push({
      value: controlValues[`value${i}`],
      color: controlValues[`color${i}`],
      explode: controlValues[`explode${i}`],
      height: controlValues[`height${i}`],
      offset: controlValues[`offset${i}`],
    })
  }

  return data
}