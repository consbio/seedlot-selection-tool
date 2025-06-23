import { SELECT_CLIMATE_YEAR, SELECT_CLIMATE_MODEL } from '../actions/climate'

const defaultState = {
  seedlot: {
    time: '1961_1990',
    model: null,
  },

  site: {
    time: '1961_1990',
    model: 'rcp45',
  },
}

export default (state: any = defaultState, action: any) => {
  const climate = state[action.climate]
  const newState = { ...state }

  switch (action.type) {
    case SELECT_CLIMATE_YEAR:
      newState[action.climate] = { ...climate, time: action.year }
      return newState

    case SELECT_CLIMATE_MODEL:
      newState[action.climate] = { ...climate, model: action.model }
      return newState

    default:
      return state
  }
}
