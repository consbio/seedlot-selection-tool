import { REQUEST_LAYERS_LEGEND, RECEIVE_LAYERS_LEGEND, RESET_LEGENDS } from '../actions/legends'

const defaultState = {
  legends: [],
  isFetching: false,
}

export default (state = defaultState, action: any) => {
  switch (action.type) {
    case RESET_LEGENDS:
      return defaultState

    case REQUEST_LAYERS_LEGEND:
      return { ...state, isFetching: true }

    case RECEIVE_LAYERS_LEGEND:
      return { legends: [{ layerName: action.layerName, legend: action.legend }, ...state.legends], isFetching: false }

    default:
      return state
  }
}
