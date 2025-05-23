export const SET_MAP_OPACITY = 'SET_MAP_OPACITY'
export const SET_BASEMAP = 'SET_BASEMAP'
export const SET_ZOOM = 'SET_ZOOM'
export const TOGGLE_VISIBILITY = 'TOGGLE_VISIBILITY'
export const SET_MAP_CENTER = 'SET_MAP_POINT'
export const SET_MAP_MODE = 'SET_MAP_MODE'

export const setMapOpacity = (opacity: number) => {
  return {
    type: SET_MAP_OPACITY,
    opacity,
  }
}

export const setBasemap = (basemap: string) => {
  return {
    type: SET_BASEMAP,
    basemap,
  }
}

export const setZoom = (zoom: number) => {
  return {
    type: SET_ZOOM,
    zoom,
  }
}

export const setMapCenter = (center: [number, number]) => {
  return {
    type: SET_MAP_CENTER,
    center,
  }
}

export const setMapMode = (mode: string) => {
  return {
    type: SET_MAP_MODE,
    mode,
  }
}
