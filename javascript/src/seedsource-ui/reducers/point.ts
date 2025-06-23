import { SET_LATITUDE, SET_LONGITUDE, SET_POINT, SET_ELEVATION } from '../actions/point'

export const defaultState = {
  x: '',
  y: '',
  elevation: null,
}

export default (state = defaultState, action: any) => {
  switch (action.type) {
    case SET_LATITUDE:
      return { ...state, y: action.value, elevation: null }

    case SET_LONGITUDE:
      return { ...state, x: action.value, elevation: null }

    case SET_POINT:
      return { ...state, x: action.lon, y: action.lat, elevation: null }

    case SET_ELEVATION:
      return { ...state, elevation: action.elevation }

    default:
      return state
  }
}
