import { TOGGLE_LAYER } from '../actions/layers'
import { FINISH_JOB } from '../actions/job'

export default (state: string[] = [], action: any) => {
  if (action.type === TOGGLE_LAYER) {
    const { name } = action

    if (state.includes(name)) {
      return state.filter(n => n !== name)
    }
    return [...state, name]
  }
  if (action.type === FINISH_JOB && !state.includes('results')) {
    return [...state, 'results']
  }
  return state
}
