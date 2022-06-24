import { extent, max, maxIndex, min } from 'd3-array'
import { button, buttonGroup, folder, useControls, LevaInputs } from 'leva'
import React from 'react'
import { palette } from './theme'

// lazy global state to track whether we did the first initialization of controls
// otherwise, we set everything in the URL immediately.
let initialized = false

function writeChangesToUrl(key) {
  return (value) => {
    if (!initialized) return
    const params = new URLSearchParams(window.location.search)
    params.set(
      key,
      typeof value === 'number' ? Math.round(100 * value) / 100 : value
    )
    const searchString = params.toString()
    window.history.replaceState(
      window.location.state,
      '',
      `${window.location.protocol}//${window.location.host}${
        window.location.pathname
      }${searchString ? '?' + searchString : ''}`
    )
  }
}

function parseValue(value, type) {
  if (value == null || type == null) return value
  if (type === 'boolean') {
    return value === 'true' || value === true
  }

  return value
}

/** adds URL write support to a param */
function createUrlSync() {
  const initialParams = new URLSearchParams(window.location.search)
  return (key, defaultValue, type) => ({
    value: parseValue(initialParams.get(key), type) ?? defaultValue,
    onChange: writeChangesToUrl(key, type),
    transient: false,
  })
}

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
  const maxKeyIndex = maxIndex(prefixKeys, (key) => controlValues[key])
  for (let i = 0; i < prefixKeys.length; ++i) {
    // start to the left of the max index... (not perfect, but hopefully reasonable ux)
    const key =
      prefixKeys[(prefixKeys.length - 1 - i + maxKeyIndex) % prefixKeys.length]
    update[key] = prefixExtent[0] + increment * i
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
  const [urlSync] = React.useState(() => createUrlSync())
  const controlValuesRef = React.useRef()
  const {
    numSlices,
    title,
    titleOffset,
    titleMaxWidth,
    backgroundColor,
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
    spinSpeed,
    showValues,
    valuesAsPercent,
  } = useControls({
    reset: button(() => {
      window.location.href = '/'
    }),
    customize: folder(
      {
        title: folder(
          {
            title: {
              label: 'text',
              value: '',
              type: LevaInputs.STRING,
              ...urlSync('t', ''),
            },
            titleMaxWidth: {
              label: 'max width',
              step: 5,
              min: 0,
              type: LevaInputs.NUMBER,
              max: 100,
              value: 80,
              ...urlSync('tmw', 80),
            },
            titleOffset: {
              label: 'y-offset',
              min: -50,
              type: LevaInputs.NUMBER,
              max: 50,
              step: 0.5,
              value: -30,
              ...urlSync('tmw', -30),
            },
          },
          { collapsed: true }
        ),
        dimensions: folder(
          {
            allHeights: {
              value: 0.5,
              min: 0.01,
              type: LevaInputs.NUMBER,
              max: 2,
              step: 0.05,
              label: 'all heights',
              ...urlSync('ah', 0.5),
            },
            valueLabelPosition: {
              label: 'labels',
              min: 0,
              type: LevaInputs.NUMBER,
              max: 1,
              step: 0.01,
              value: 0.65,
              ...urlSync('vlp', 0.65),
            },
            innerRadius: {
              value: 2,
              min: 0,
              type: LevaInputs.NUMBER,
              max: 100,
              step: 1,
              label: 'donut',
              ...urlSync('dnt', 2),
            },
            outerRadius: {
              value: 150,
              min: 50,
              type: LevaInputs.NUMBER,
              max: 300,
              step: 1,
              label: 'radius',
              ...urlSync('r', 150),
            },
            cornerRadius: {
              value: 0,
              min: 0,
              type: LevaInputs.NUMBER,
              max: 50,
              step: 1,
              label: 'corners',
              ...urlSync('cr', 0),
            },
            padAngle: {
              value: 0.05,
              min: 0,
              type: LevaInputs.NUMBER,
              max: Math.PI / 8,
              step: 0.001,
              label: 'pad angle',
              ...urlSync('ang', 0.05),
            },
          },
          { collapsed: false }
        ),
        lighting: folder(
          {
            ambientLightIntensity: {
              label: 'ambient',
              min: 0,
              type: LevaInputs.NUMBER,
              max: 1,
              step: 0.05,
              value: 0.2,
              ...urlSync('amb', 0.2),
            },
            spotLightIntensity: {
              label: 'spot',
              min: 0,
              type: LevaInputs.NUMBER,
              max: 1,
              step: 0.05,
              value: 0.75,
              ...urlSync('spt', 0.75),
            },
            environmentFile: {
              label: 'environment',
              value: environmentFilesMap.night,
              type: LevaInputs.SELECT,
              options: environmentFilesMap,
              ...urlSync('env', environmentFilesMap.night),
            },
          },
          { collapsed: true }
        ),
        material: folder(
          {
            roughness: {
              label: 'roughness',
              min: 0,
              type: LevaInputs.NUMBER,
              max: 1,
              step: 0.05,
              value: 0.2,
              ...urlSync('rgh', 0.2),
            },
            metalness: {
              label: 'metalness',
              min: 0,
              type: LevaInputs.NUMBER,
              max: 1,
              step: 0.05,
              value: 0.0,
              ...urlSync('met', 0.0),
            },
          },
          { collapsed: true }
        ),
        glow: folder(
          {
            showBloom: {
              label: 'enabled',
              value: false,
              type: LevaInputs.BOOLEAN,
              ...urlSync('blm', false, 'boolean'),
            },
            bloomStrength: {
              label: 'strength',
              value: 1,
              min: 0,
              type: LevaInputs.NUMBER,
              max: 3,
              step: 0.01,
              ...urlSync('bls', 1),
            },
            bloomRadius: {
              label: 'radius',
              value: 1.5,
              min: 0,
              type: LevaInputs.NUMBER,
              max: 2,
              step: 0.01,
              ...urlSync('blr', 1.5),
            },
            bloomThreshold: {
              label: 'threshold',
              value: 0.15,
              min: 0,
              type: LevaInputs.NUMBER,
              max: 1,
              step: 0.01,
              ...urlSync('blt', 0.15),
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
        backgroundColor: {
          value: '#1f2937',
          label: 'bg',
          type: LevaInputs.COLOR,
          ...urlSync('bg', '#1f2937'),
        },
        showValues: {
          value: true,
          label: 'show values',
          type: LevaInputs.BOOLEAN,
          ...urlSync(`show_values`, true, 'boolean'),
        },
        valuesAsPercent: {
          value: true,
          label: '% format',
          type: LevaInputs.BOOLEAN,
          ...urlSync(`pct_values`, true, 'boolean'),
        },
      },
      { collapsed: window.innerHeight < 1000 }
    ),
    spinSpeed: {
      label: 'spin',
      min: 0,
      max: 1,
      value: 0.0,
      step: 0.01,
      type: LevaInputs.NUMBER,
      ...urlSync('spn', 0),
    },
    numSlices: {
      value: 4,
      step: 1,
      min: 2,
      max: 10,
      type: LevaInputs.NUMBER,
      label: '# slices',
      ...urlSync('n', 4),
    },
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
      [`value${i}`]: {
        value: i === 0 ? 1.5 : +(1 / Math.pow(2, i * 0.35)).toFixed(2),
        label: 'value',
        ...urlSync(
          `v${i}`,
          i === 0 ? 1.5 : +(1 / Math.pow(2, i * 0.35)).toFixed(2)
        ),
      },
      details: folder(
        {
          [`label${i}`]: {
            value: '',
            label: 'label',
            type: LevaInputs.STRING,
            ...urlSync(`l${i}`, ''),
          },
          [`color${i}`]: {
            value: palette[i % palette.length],
            label: 'color',
            type: LevaInputs.COLOR,
            ...urlSync(`c${i}`, palette[i % palette.length]),
          },

          [`explode${i}`]: {
            value: false,
            label: 'explode',
            type: LevaInputs.BOOLEAN,
            ...urlSync(`x${i}`, false, 'boolean'),
          },
          [`height${i}`]: {
            value: allHeights,
            min: 0.01,
            max: 2,
            step: 0.05,
            label: 'height',
            type: LevaInputs.NUMBER,
            ...urlSync(`h${i}`, allHeights),
          },
          [`offset${i}`]: {
            value: 0,
            min: 0.0,
            max: 2,
            step: 0.05,
            label: 'offset',
            type: LevaInputs.NUMBER,
            ...urlSync(`o${i}`, 0.0),
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

  // lazy global initialization flag
  React.useEffect(() => {
    initialized = true
    return () => {
      initialized = false
    }
  }, [])

  return [
    {
      ...controlValues,
      title,
      titleMaxWidth,
      titleOffset,
      backgroundColor,
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
      spinSpeed,
      showValues,
      valuesAsPercent,
    },
    set,
  ]
}
export default useInputControls

export function pieDataFromControls(controlValues) {
  const data = []
  for (let i = 0; i < controlValues.numSlices; ++i) {
    data.push({
      value: +controlValues[`value${i}`],
      color: controlValues[`color${i}`],
      label: controlValues[`label${i}`],
      explode: controlValues[`explode${i}`],
      height: +controlValues[`height${i}`],
      offset: +controlValues[`offset${i}`],
    })
  }

  return data
}
