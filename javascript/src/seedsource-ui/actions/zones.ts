export const SELECT_ZONE = 'SELECT_ZONE'
export const REQUEST_ZONES = 'REQUEST_ZONES'
export const RECEIVE_ZONES = 'RECEIVE_ZONES'
export const REQUEST_GEOMETRY = 'REQUEST_GEOMETRY'
export const RECEIVE_GEOMETRY = 'RECEIVE_GEOMETRY'
export const FAIL_GEOMETRY = 'FAIL_GEOMETRY'
export const FAIL_ZONES = 'FAIL_ZONES'

export const selectZone = (zone: string) => {
  return {
    type: SELECT_ZONE,
    zone,
  }
}

export const requestZones = () => {
  return {
    type: REQUEST_ZONES,
  }
}

export const receiveZones = (zones: any) => {
  return {
    type: RECEIVE_ZONES,
    zones,
  }
}

export const failZones = () => {
  return {
    type: FAIL_ZONES,
  }
}

export const requestGeometry = () => {
  return {
    type: REQUEST_GEOMETRY,
  }
}

export const receiveGeometry = (geometry: any) => {
  return {
    type: RECEIVE_GEOMETRY,
    geometry,
  }
}

export const failGeometry = () => {
  return {
    type: FAIL_GEOMETRY,
  }
}
