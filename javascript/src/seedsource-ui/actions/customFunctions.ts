export const CREATE_FUNCTION = 'CREATE_FUNCTION'
export const DELETE_FUNCTION = 'DELETE_FUNCTION'
export const TOGGLE_FUNCTION = 'TOGGLE_FUNCTION'
export const SET_FUNCTION = 'SET_FUNCTION'
export const SET_FUNCTION_TRANSFER = 'SET_FUNCTION_TRANSFER'
export const SET_FUNCTION_VALUE = 'SET_FUNCTION_VALUE'

export const createFunction = (name: string, func: string) => {
  return {
    type: CREATE_FUNCTION,
    name,
    func,
  }
}

export const deleteFunction = (id: string) => {
  return {
    type: DELETE_FUNCTION,
    id,
  }
}

export const toggleFunction = (id: string) => {
  return {
    type: TOGGLE_FUNCTION,
    id,
  }
}

export const setFunction = (id: string, name: string, func: string) => {
  return {
    type: SET_FUNCTION,
    id,
    name,
    func,
  }
}

export const setFunctionTransfer = (id: string, transfer: number | null) => {
  return {
    type: SET_FUNCTION_TRANSFER,
    id,
    transfer,
  }
}

export const setFunctionValue = (id: string, value: number | null) => {
  return {
    type: SET_FUNCTION_VALUE,
    id,
    value,
  }
}
