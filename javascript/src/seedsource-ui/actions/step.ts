export const SELECT_STEP = 'SELECT_STEP'

export const selectStep = (step: string) => {
  return {
    type: SELECT_STEP,
    step,
  }
}
