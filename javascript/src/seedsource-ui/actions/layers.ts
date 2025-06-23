export const TOGGLE_LAYER = 'TOGGLE_LAYER'

export const toggleLayer = (name: string) => {
  return {
    type: TOGGLE_LAYER,
    name,
  }
}
