import { SET_ERROR, CLEAR_ERROR } from '../actions/error'

export default (state = null, action: any) => {
  const { title, message, debugInfo } = action

  switch (action.type) {
    case SET_ERROR:
      return { title, message, debugInfo }

    case CLEAR_ERROR:
      return null

    default:
      return state
  }
}
