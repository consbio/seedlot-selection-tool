export const LOGIN = 'LOGIN'
export const LOGOUT = 'LOGOUT'

export const login = (email: string) => {
  return {
    type: LOGIN,
    email,
  }
}

export const logout = () => {
  return {
    type: LOGOUT,
  }
}
