// eslint-disable-next-line import/prefer-default-export
export const pointIsValid = (point: { x: number; y: number }) =>
  point !== null && (!!point.x || point.x === 0) && (!!point.y || point.y === 0)
