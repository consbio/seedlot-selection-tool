import { variables as allVariables } from '../config'
import {
  ADD_VARIABLES,
  REMOVE_VARIABLE,
  MODIFY_VARIABLE,
  RESET_TRANSFER,
  REQUEST_VALUE,
  RECEIVE_VALUE,
  SELECT_METHOD,
  REQUEST_TRANSFER,
  RECEIVE_TRANSFER,
} from '../actions/variables'
import { SET_LATITUDE, SET_LONGITUDE, SET_POINT } from '../actions/point'
import { SELECT_OBJECTIVE } from '../actions/objectives'
import { SELECT_CLIMATE_YEAR, SELECT_CLIMATE_MODEL } from '../actions/climate'
import { SELECT_ZONE } from '../actions/zones'

export default (state: any = [], action: any) => {
  let variable: any
  let index

  const getVariable = (name: string) => state.find((item: any) => item.name === name)

  const updateVariable = (name: string, values: any) => {
    index = state.findIndex((item: any) => item.name === name)

    if (index === -1) {
      return state
    }

    variable = { ...state[index], ...values }
    return state.slice(0, index).concat([variable, ...state.slice(index + 1)])
  }

  switch (action.type) {
    case ADD_VARIABLES:
      return [
        ...state,
        ...action.variables.map((name: string) => ({
          name,
          value: null,
          transfer: null,
          defaultTransfer: null,
          avgTransfer: null,
          zoneCenter: null,
          transferIsModified: false,
          isFetching: false,
          isFetchingTransfer: false,
          customCenter: null,
        })),
      ]

    case REMOVE_VARIABLE:
      return state.slice(0, action.index).concat(state.slice(action.index + 1))

    case MODIFY_VARIABLE: {
      const { transfer, customCenter } = action.modifications
      const modifications = {} as any
      if (transfer !== undefined) {
        modifications.transfer = transfer
        modifications.transferIsModified = true
      }
      if (customCenter !== undefined) {
        modifications.customCenter = customCenter
      }
      return updateVariable(action.variable, modifications)
    }

    case RESET_TRANSFER:
      variable = getVariable(action.variable)

      return updateVariable(action.variable, { transfer: variable.defaultTransfer, transferIsModified: false })

    case REQUEST_VALUE:
      return updateVariable(action.variable, { isFetching: true })

    case RECEIVE_VALUE:
      return updateVariable(action.variable, { isFetching: false, value: action.value })

    case SET_LATITUDE:
    case SET_LONGITUDE:
    case SET_POINT:
      return state.map((item: any) => ({
        ...item,
        isFetching: false,
        isFetchingTransfer: false,
        value: null,
        defaultTransfer: null,
        avgTransfer: null,
        zoneCenter: null,
        transfer: item.transferIsModified ? item.transfer : null,
      }))

    case SELECT_OBJECTIVE:
    case SELECT_CLIMATE_YEAR:
    case SELECT_CLIMATE_MODEL:
      return state.map((item: any) => ({ ...item, isFetching: false, defaultTransfer: null, value: null }))

    case SELECT_ZONE:
    case SELECT_METHOD:
      if (action.method === 'trait' || action.method === 'function') {
        return []
      }

      return state.map((item: any) => ({
        ...item,
        isFetchingTransfer: false,
        defaultTransfer: null,
        avgTransfer: null,
        zoneCenter: null,
        transfer: item.transferIsModified ? item.transfer : null,
      }))

    case REQUEST_TRANSFER:
      return updateVariable(action.variable, { isFetchingTransfer: true })

    case RECEIVE_TRANSFER:
      variable = getVariable(action.variable)
      if (variable === undefined) {
        return state
      }

      return updateVariable(action.variable, {
        isFetchingTransfer: false,
        defaultTransfer: action.transfer,
        avgTransfer: action.avgTransfer,
        zoneCenter: action.center,
        transfer: variable.transferIsModified ? variable.transfer : action.transfer,
      })

    default:
      return state
  }
}
