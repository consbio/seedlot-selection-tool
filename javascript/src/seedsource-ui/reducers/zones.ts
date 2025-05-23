import {
  SELECT_ZONE,
  REQUEST_ZONES,
  RECEIVE_ZONES,
  FAIL_ZONES,
  REQUEST_GEOMETRY,
  RECEIVE_GEOMETRY,
  FAIL_GEOMETRY,
} from '../actions/zones'

const defaultState = {
  matched: [],
  elevationAtPoint: null,
  selected: null,
  geometry: null,
  isFetchingZones: false,
  isFetchingGeometry: false,
}

export default (state = defaultState, action: any) => {
  if (action.type === RECEIVE_ZONES) {
    let newState = { ...state, matched: action.zones, isFetchingZones: false }

    if (newState.matched.length) {
      newState.elevationAtPoint = newState.matched[0].elevation_at_point
    } else {
      newState.elevationAtPoint = null
    }

    // Clear zone geometry if new set doesn't match selected zone
    if (action.zones.find((item: any) => item.zone_uid === state.selected) === undefined) {
      newState = Object.assign(newState, { selected: null, geometry: null, isFetchingGeometry: false })
    }

    if (newState.selected === null && action.zones.length) {
      newState.selected = action.zones[0].zone_uid
    }

    return newState
  }

  switch (action.type) {
    case SELECT_ZONE:
      return { ...state, selected: action.zone, geometry: null, isFetchingGeometry: null }

    case REQUEST_ZONES:
      return { ...state, isFetchingZones: true }

    case FAIL_ZONES:
      return { ...state, isFetchingZones: false }

    case REQUEST_GEOMETRY:
      return { ...state, isFetchingGeometry: true }

    case RECEIVE_GEOMETRY:
      return { ...state, geometry: action.geometry, isFetchingGeometry: false }

    case FAIL_GEOMETRY:
      return { ...state, isFetchingGeometry: false, geometry: null, selected: null }

    default:
      return state
  }
}
