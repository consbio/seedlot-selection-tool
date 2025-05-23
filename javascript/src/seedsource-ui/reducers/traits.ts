import { ADD_TRAIT, REMOVE_TRAIT, SET_TRAIT_VALUE, SET_TRAIT_TRANSFER } from '../actions/traits'
import { SELECT_SPECIES } from '../actions/species'
import { SELECT_METHOD } from '../actions/variables'
import config from '../config'

export default (state: any = [], action: any) => {
  switch (action.type) {
    case ADD_TRAIT:
      return [...state, { name: action.trait, value: null, transfer: null }]
    case REMOVE_TRAIT:
      return state.slice(0, action.index).concat(state.slice(action.index + 1))
    case SET_TRAIT_VALUE:
      return state
        .slice(0, action.index)
        .concat([{ ...state[action.index], value: action.value }, ...state.slice(action.index + 1)])
    case SET_TRAIT_TRANSFER:
      return state
        .slice(0, action.index)
        .concat([{ ...state[action.index], transfer: action.transfer }, ...state.slice(action.index + 1)])
    case SELECT_SPECIES:
      return config.functions
        .filter(f => f.species.includes(action.species))
        .map(f => ({ name: f.name, value: null, transfer: null }))
    case SELECT_METHOD:
      return []
    default:
      return state
  }
}
