import { SELECT_TAB } from '../actions/tabs'
import { LOAD_CONFIGURATION } from '../actions/saves'

export default (state = 'about', action: any) => {
  switch (action.type) {
    case SELECT_TAB:
      return action.tab

    case LOAD_CONFIGURATION:
      return 'tool'

    default:
      return state
  }
}
