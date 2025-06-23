export const SET_LATITUDE = 'SET_LATITUDE'
export const SET_LONGITUDE = 'SET_LONGITUDE'
export const SET_POINT = 'SET_POINT'
export const SET_ELEVATION = 'SET_ELEVATION'
export const ADD_USER_SITES = 'ADD_USER_SITE'
export const REMOVE_USER_SITE = 'REMOVE_USER_SITE'
export const SET_USER_SITE_SCORE = 'SET_USER_SITE_SCORE'
export const SET_USER_SITE_LABEL = 'SET_USER_SITE_LABEL'
export const SET_ACTIVE_USER_SITE = 'SET_ACTIVE_USER_SITE'

export const setLatitude = (value: number) => {
  return {
    type: SET_LATITUDE,
    value,
  }
}

export const setLongitude = (value: number) => {
  return {
    type: SET_LONGITUDE,
    value,
  }
}

export const setPoint = (lat: number, lon: number) => {
  return {
    type: SET_POINT,
    lat,
    lon,
  }
}

export const setElevation = (elevation: number | null) => {
  return {
    type: SET_ELEVATION,
    elevation,
  }
}

export const addUserSites = (sites: { latlon: { lat: number; lon: number }; label: string }[]) => {
  return {
    type: ADD_USER_SITES,
    sites,
  }
}

export const addUserSite = (latlon: { lat: number; lon: number }, label: string) => addUserSites([{ latlon, label }])

export const removeUserSite = (index: number) => {
  return {
    type: REMOVE_USER_SITE,
    index,
  }
}

export const setUserSiteScore = (latlon: { lat: number; lon: number }, score: number, deltas?: any) => {
  return {
    type: SET_USER_SITE_SCORE,
    latlon,
    score,
    deltas,
  }
}

export const setUserSiteLabel = (label: string, index: number) => {
  return {
    type: SET_USER_SITE_LABEL,
    label,
    index,
  }
}

export const setActiveUserSite = (index: number | null) => {
  return {
    type: SET_ACTIVE_USER_SITE,
    index,
  }
}
