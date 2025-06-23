import {
  SHOW_SAVE_MODAL,
  HIDE_SAVE_MODAL,
  RECEIVE_SAVE,
  REQUEST_SAVE,
  FAIL_SAVE,
  REQUEST_SAVES,
  RECEIVE_SAVES,
  FAIL_SAVES,
  REMOVE_SAVE,
  LOAD_CONFIGURATION,
} from '../actions/saves'

const defaultState = {
  showModal: false,
  isSaving: false,
  isFetching: false,
  lastSave: null,
  saves: [],
}

export default (state: any = defaultState, action: any) => {
  switch (action.type) {
    case SHOW_SAVE_MODAL:
      return { ...state, showModal: true }

    case HIDE_SAVE_MODAL:
      return { ...state, showModal: false }

    case RECEIVE_SAVE:
      return { ...state, showModal: false, isSaving: false, lastSave: { title: action.title, saveId: action.saveId } }

    case FAIL_SAVE:
      return { ...state, isSaving: false }

    case REQUEST_SAVE:
      return { ...state, isSaving: true }

    case REQUEST_SAVES:
      return { ...state, isFetching: true }

    case RECEIVE_SAVES:
      return { ...state, isFetching: false, saves: action.saves }

    case FAIL_SAVES:
      return { ...state, isFetching: false }

    case LOAD_CONFIGURATION:
      if (!action.save) {
        return state
      }
      return { ...state, lastSave: { title: action.save.title, saveId: action.save.uuid } }

    case REMOVE_SAVE:
      return {
        ...state,
        saves: state.saves.filter((item: any) => item.uuid !== action.uuid),
        lastSave: state.lastSave !== null && state.lastSave.saveId === action.uuid ? null : state.lastSave,
      }

    default:
      return state
  }
}
