import { START_JOB, RECEIVE_JOB_STATUS, FAIL_JOB } from '../actions/job'
import { LOAD_CONFIGURATION } from '../actions/saves'

const defaultState = {
  isRunning: false,
  isFetching: false,
  queued: false,
  jobId: null,
  serviceId: null,
  configuration: null,
}

export default (state = defaultState, action: any) => {
  switch (action.type) {
    case START_JOB:
      return { ...defaultState, isRunning: true, isFetching: true, configuration: action.configuration }

    case RECEIVE_JOB_STATUS:
      if (action.status === 'success') {
        return { ...state, isRunning: false, isFetching: false, queued: false, serviceId: action.serviceId }
      }
      if (action.status === 'failure') {
        return defaultState
      }
      if (action.status === 'pending') {
        return { ...state, queued: true, isFetching: false }
      }

      return { ...state, queued: false, isFetching: false }

    case FAIL_JOB:
      return defaultState

    case LOAD_CONFIGURATION:
      return defaultState

    default:
      return state
  }
}
