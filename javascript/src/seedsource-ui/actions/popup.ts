export const SET_POPUP_LOCATION = 'SET_POPUP_LOCATION'
export const RESET_POPUP_LOCATION = 'RESET_POPUP_LOCATION'
export const REQUEST_POPUP_VALUE = 'REQUEST_POPUP_VALUE'
export const RECEIVE_POPUP_VALUE = 'RECEIVE_POPUP_VALUE'
export const RECEIVE_POPUP_ELEVATION = 'RECEIVE_POPUP_ELEVATION'
export const REQUEST_POPUP_REGION = 'REQUEST_POPUP_REGION'
export const RECEIVE_POPUP_REGION = 'RECEIVE_POPUP_REGION'
export const RECEIVE_POPUP_ZONES = 'RECEIVE_POPUP_ZONES'

export const setPopupLocation = (lat: number, lon: number) => {
  return {
    type: SET_POPUP_LOCATION,
    lat,
    lon,
  }
}

export const resetPopupLocation = () => {
  return {
    type: RESET_POPUP_LOCATION,
  }
}

export const requestPopupValue = (variable: string) => {
  return {
    type: REQUEST_POPUP_VALUE,
    variable,
  }
}

export const receivePopupValue = (variable: string, json: any) => {
  let value = null
  if (json.results.length) {
    value = json.results[0].attributes['Pixel value']
  }

  return {
    type: RECEIVE_POPUP_VALUE,
    value,
    variable,
  }
}

export const receivePopupElevation = (elevation: number) => {
  return {
    type: RECEIVE_POPUP_ELEVATION,
    elevation,
  }
}

export const requestPopupRegion = () => {
  return {
    type: REQUEST_POPUP_REGION,
  }
}

export const receivePopupRegion = (region: string) => {
  return {
    type: RECEIVE_POPUP_REGION,
    region,
  }
}

export const receivePopupZones = (zones: any[]) => {
  return {
    type: RECEIVE_POPUP_ZONES,
    zones,
  }
}
