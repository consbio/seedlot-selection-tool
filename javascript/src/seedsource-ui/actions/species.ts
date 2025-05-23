export const SELECT_SPECIES = 'SELECT_SPECIES'
export const RECEIVE_AVAILABLE_SPECIES = 'RECEIVE_AVAILABLE_SPECIES'

export const receiveAvailableSpecies = (species: string) => {
  return {
    type: RECEIVE_AVAILABLE_SPECIES,
    species,
  }
}

export const selectSpecies = (species: string) => {
  return {
    type: SELECT_SPECIES,
    species,
  }
}
