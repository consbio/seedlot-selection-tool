import config from '../config'
import { ADD_CONSTRAINT, REMOVE_CONSTRAINT, UPDATE_CONSTRAINT_VALUES } from '../actions/constraints'

export default (state = [], action: any) => {
  const { constraints } = config

  switch (action.type) {
    case ADD_CONSTRAINT:
      return [
        ...state,
        {
          type: constraints.objects[action.constraint].constraint,
          name: action.constraint,
          values: constraints.objects[action.constraint].values,
        },
      ]

    case REMOVE_CONSTRAINT:
      return state.filter((constraint, i) => i !== action.index)

    case UPDATE_CONSTRAINT_VALUES:
      return state.map((constraint: any, i) =>
        i === action.index ? { ...constraint, values: { ...constraint.values, ...action.values } } : constraint,
      )

    default:
      return state
  }
}
