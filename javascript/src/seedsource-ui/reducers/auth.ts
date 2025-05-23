import { LOGIN, LOGOUT } from '../actions/auth'

const defaultState = {
  isLoggedIn: false,
  email: null,
}

export default (state = defaultState, action: any) => {
  switch (action.type) {
    case LOGIN:
      return { ...state, isLoggedIn: true, email: action.email }

    case LOGOUT:
      return defaultState

    default:
      return state
  }
}
