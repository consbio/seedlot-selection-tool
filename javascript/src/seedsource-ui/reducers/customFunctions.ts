import { v4 as uuidv4 } from 'uuid'
import {
  CREATE_FUNCTION,
  DELETE_FUNCTION,
  TOGGLE_FUNCTION,
  SET_FUNCTION,
  SET_FUNCTION_TRANSFER,
  SET_FUNCTION_VALUE,
} from '../actions/customFunctions'
import { SELECT_METHOD } from '../actions/variables'

export interface CustomFunction {
  name: string
  func: string
  value: number | null
  transfer: number | null
  selected: boolean
  id: string
}

export default (state: CustomFunction[] = [], action: any) => {
  switch (action.type) {
    case CREATE_FUNCTION:
      return [
        ...state,
        { name: action.name, func: action.func, value: null, transfer: null, selected: true, id: uuidv4() },
      ]
    case DELETE_FUNCTION:
      return state.filter(func => func.id !== action.id)
    case TOGGLE_FUNCTION:
      return state.map(func => (func.id === action.id ? { ...func, selected: !func.selected } : func))
    case SET_FUNCTION:
      return state.map(func => (func.id === action.id ? { ...func, name: action.name, func: action.func } : func))
    case SET_FUNCTION_TRANSFER:
      return state.map(func => (func.id === action.id ? { ...func, transfer: action.transfer } : func))
    case SET_FUNCTION_VALUE:
      return state.map(func => (func.id === action.id ? { ...func, value: action.value } : func))
    case SELECT_METHOD:
      return state.map(func => ({ ...func, selected: false }))
    default:
      return state
  }
}
