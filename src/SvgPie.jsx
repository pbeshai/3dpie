import * as React from 'react'
import makePie from './makePie'
import { palette } from './theme'

export const SvgPie = ({
  data,
  innerRadius = 2,
  outerRadius = 100,
  cornerRadius = 0,
  padAngle = 0.05,
}) => {
  const { arcs, arcGenerator } = makePie(
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
              fill={data[i].color ?? palette[i % palette.length]}
              stroke="black"
            />
          )
        })}
      </g>
    </svg>
  )
}
