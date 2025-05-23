export const SELECT_REGION_METHOD = 'SELECT_REGION_METHOD'
export const SET_REGION = 'SET_REGION'
export const REQUEST_REGIONS = 'REQUEST_REGIONS'
export const RECEIVE_REGIONS = 'RECEIVE_REGIONS'

export const selectRegionMethod = (method: string) => {
  return {
    type: SELECT_REGION_METHOD,
    method,
  }
}

export const setRegion = (region: string) => {
  return {
    type: SET_REGION,
    region,
  }
}

export const requestRegions = () => {
  return {
    type: REQUEST_REGIONS,
  }
}

export const receiveRegions = (regions: string) => {
  return {
    type: RECEIVE_REGIONS,
    regions,
  }
}
