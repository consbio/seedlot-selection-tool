import { REQUEST_REPORT, RECEIVE_REPORT } from '../actions/report'

const defaultState = {
  name: null,
}

export default (state = defaultState, action: any) => {
  switch (action.type) {
    case REQUEST_REPORT:
      return { ...state, name: action.name }

    case RECEIVE_REPORT:
      return { ...state, name: null, TIFJobIsFetching: false }

    default:
      return state
  }
}
