export const SELECT_OBJECTIVE = 'SELECT_OBJECTIVE'

export const selectObjective = (objective: string) => {
  return {
    type: SELECT_OBJECTIVE,
    objective,
  }
}
