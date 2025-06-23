export const ADD_CONSTRAINT = 'ADD_CONSTRAINT'
export const REMOVE_CONSTRAINT = 'REMOVE_CONSTRAINT'
export const UPDATE_CONSTRAINT_VALUES = 'UPDATE_CONSTRAINT_VALUES'

export const addConstraint = (constraint: any) => {
  return {
    type: ADD_CONSTRAINT,
    constraint,
  }
}

export const removeConstraint = (index: number) => {
  return {
    type: REMOVE_CONSTRAINT,
    index,
  }
}

export const updateConstraintValues = (index: number, values: any) => {
  return {
    type: UPDATE_CONSTRAINT_VALUES,
    index,
    values,
  }
}
