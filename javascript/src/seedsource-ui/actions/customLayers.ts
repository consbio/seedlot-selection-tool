import { GeoJSON } from 'geojson'

export const TOGGLE_CUSTOM_LAYER = 'TOGGLE_CUSTOM_LAYER'
export const ADD_CUSTOM_LAYER = 'ADD_CUSTOM_LAYER'
export const REMOVE_CUSTOM_LAYER = 'REMOVE_CUSTOM_LAYER'
export const SET_CUSTOM_COLOR = 'SET_CUSTOM_COLOR'

export const addCustomLayer = (geoJSON: GeoJSON, filename: string) => {
  return {
    type: ADD_CUSTOM_LAYER,
    geoJSON,
    filename,
  }
}

export const removeCustomLayer = (id: string) => {
  return {
    type: REMOVE_CUSTOM_LAYER,
    id,
  }
}

export const toggleCustomLayer = (id: string) => {
  return {
    type: TOGGLE_CUSTOM_LAYER,
    id,
  }
}

export const setCustomColor = (id: string, color: string) => {
  return {
    type: SET_CUSTOM_COLOR,
    id,
    color,
  }
}
