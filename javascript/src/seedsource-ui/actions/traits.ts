export const ADD_TRAIT = 'ADD_TRAIT'
export const REMOVE_TRAIT = 'REMOVE_TRAIT'
export const SET_TRAIT_VALUE = 'SET_TRAIT_VALUE'
export const SET_TRAIT_TRANSFER = 'SET_TRAIT_TRANSFER'

export const addTrait = (trait: string) => {
  return {
    type: ADD_TRAIT,
    trait,
  }
}

export const removeTrait = (index: number) => {
  return {
    type: REMOVE_TRAIT,
    index,
  }
}

export const setTraitValue = (index: number, value: number | null) => {
  return {
    type: SET_TRAIT_VALUE,
    index,
    value,
  }
}

export const setTraitTransfer = (index: number, transfer: number) => {
  return {
    type: SET_TRAIT_TRANSFER,
    index,
    transfer,
  }
}
