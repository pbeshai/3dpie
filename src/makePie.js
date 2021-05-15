import { arc, pie } from 'd3-shape'

/** make our pie svg and arc generators */
export default function makePie(
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
  const pieSvgDataUri = `data:image/svg+xml;base64,${btoa(`
    <svg xmlns="http://www.w3.org/2000/svg">
    <g transform="scale(0.01)">
      ${arcs.map((arcData, i) => {
        return `<path d="${arcGenerator(arcData)}" />`
      })}
      </g>
    </svg>
  `)}`
  // sample data URI:
  // const pieSvgDataUri = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxNTAgMTUwKSI+PHBhdGggZD0iTTY5LjM5NjcwMjg0NjU3MDUyLDY2LjEyMTgyNDU2OTEyMTQ2QTQsNCwwLDAsMSw2OS40NjE1NTcyMTM1NTMwNCw3MS45MzgxMTI3NzM4ODU3MkExMDAsMTAwLDAsMCwxLC05Ni4wNTc3Mjc0OTI2MjAxNiwyNy44MDEzMTI3MTk5NjkyNzhBNCw0LDAsMCwxLC05My4xMDU1MDIxMjg3NDA2MSwyMi43ODk1NDg1NjI0NDMyMjZMLTEuNjM1ODM3ODY4NDQ0MDcxMywxLjkxMjE5NDU5MDM3MjYwNDVBMi4zMzM1OTExMTk0MjI2MTc4LDIuMzMzNTkxMTE5NDIyNjE3OCwwLDAsMSwwLjQ2NjU0Nzg0Mzc1ODU5ODM3LDIuNDcyODA5NDkzODI4ODYwN1oiIGZpbGw9InRvbWF0byIgc3Ryb2tlPSJibGFjayI+PC9wYXRoPjxwYXRoIGQ9Ik0tMzEuMjg2ODQ1MjMxNjcyMjAzLC05MC42NTYyMzc2MjEwMjQwOUE0LDQsMCwwLDEsLTI4LjY1NjM1MjA1MDk4MzI4NywtOTUuODA2MTI0NDc2MTAwNzJBMTAwLDEwMCwwLDAsMSwtNS42Nzg4NjkwMzM4NTc0MzMsLTk5LjgzODYyMjAxODIxNjQ1QTQsNCwwLDAsMSwtMS40NTE5OTE3MTc3MzAzMDI4LC05NS44OTIxODg1NDYzMTQwMkwtMC4zNDU3MTIwODMwMDcyNDA3NywtMS45Njk4OTQxOTkxMDM3OTgxWiIgZmlsbD0iI2NjMCIgc3Ryb2tlPSJibGFjayI+PC9wYXRoPjxwYXRoIGQ9Ik0xLjUwMDI0MzcwOTM5MDA3MzYsLTk1Ljg0MjMwNDQzMzU3MTA2QTQsNCwwLDAsMSw1LjcyOTQyMDUzMDYxNDY2LC05OS44MzU3MzM3ODQ5Njk4NUExMDAsMTAwLDAsMCwxLDc3LjIzNTI1NzY4MjQ2NDA4LDYzLjUxOTQwNjI1MjkxOTA2QTQsNCwwLDAsMSw3MS40MzIyMzk0NTM2MDU5Miw2My45MTczOTM2OTY2MTExNUwyLjc3MjE5Mjg3NjkxMzc5MDUsMC41MTc3OTI0NzA1MzEwMTExQTMuOTU1MDkwMTc0NTc4MzI0LDMuOTU1MDkwMTc0NTc4MzI0LDAsMCwxLDEuNTAwMjQzNzA5MzkwMDM2MywtMi4zODc5NzYzODIxNjY3MDNaIiBmaWxsPSIjYzRjIiBzdHJva2U9ImJsYWNrIj48L3BhdGg+PHBhdGggZD0iTS05My43Nzg4OTkzMDgwNjIyMSwxOS44NzMxNjg0NTEzOTgxMDRBNCw0LDAsMCwxLC05OC42MDYyNzcyMzYyNDQ2MiwxNi42MzczNzAyNzMyMzkzMDJBMTAwLDEwMCwwLDAsMSwtMzkuMzc0ODMwNjg1NzcyMTQ2LC05MS45MjE4MjkzMzU5NDU5N0E0LDQsMCwwLDEsLTM0LjA0MTMwNjQzNDc4MDE4LC04OS42MTM2OTQ0NjY1NDE4TC0xLjc1NTY3MzI2MDEyNDg0OTUsLTAuOTU3OTIwMzUzNTE3MjM0MVoiIGZpbGw9IiMwYmIiIHN0cm9rZT0iYmxhY2siPjwvcGF0aD48L2c+PC9zdmc+`

  return { pieSvgDataUri, arcs, arcGenerator }
}
