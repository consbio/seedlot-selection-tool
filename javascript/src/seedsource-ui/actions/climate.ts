export const SELECT_CLIMATE_YEAR = 'SELECT_CLIMATE_YEAR'
export const SELECT_CLIMATE_MODEL = 'SELECT_CLIMATE_MODEL'

export const selectClimateYear = (year: string, climate: string) => {
  return {
    type: SELECT_CLIMATE_YEAR,
    year,
    climate,
  }
}

export const selectClimateModel = (model: string, climate: string) => {
  return {
    type: SELECT_CLIMATE_MODEL,
    model,
    climate,
  }
}
