import { SET_MAP_OPACITY, SET_BASEMAP, SET_ZOOM, SET_MAP_CENTER, SET_MAP_MODE } from '../actions/map'
import { LOAD_CONFIGURATION } from '../actions/saves'

const defaultState = {
  opacity: 1,
  basemap: '//{s}.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
  zoom: 4,
  center: [55.0, -112.0],
}

export default (state = defaultState, action: any) => {
  switch (action.type) {
    case SET_MAP_OPACITY:
      return { ...state, opacity: action.opacity }

    case SET_BASEMAP:
      return { ...state, basemap: action.basemap }

    case SET_ZOOM:
      return { ...state, zoom: action.zoom }

    case SET_MAP_CENTER:
      return { ...state, center: action.center }

    case LOAD_CONFIGURATION:
      return { ...state, center: [action.configuration.point.y, action.configuration.point.x] }

    case SET_MAP_MODE:
      return { ...state, mode: action.mode }

    default:
      return state
  }
}
