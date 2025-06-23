export const SELECT_TAB = 'SELECT_TAB'

export const selectTab = (tab: string) => {
  return {
    type: SELECT_TAB,
    tab,
  }
}
