export const SET_ERROR = 'SET_ERROR'
export const CLEAR_ERROR = 'CLEAR_ERROR'

export const setError = (title: string, message: string, debugInfo: any = null) => {
  return {
    type: SET_ERROR,
    title,
    message,
    debugInfo,
  }
}

export const clearError = () => {
  return {
    type: CLEAR_ERROR,
  }
}
