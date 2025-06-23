import { get, post, put, ioDelete } from '../io'
import { setError } from './error'
import config, { saveVersion } from '../config'

export const SHOW_SAVE_MODAL = 'SHOW_SAVE_MODAL'
export const HIDE_SAVE_MODAL = 'HIDE_SAVE_MODAL'
export const RECEIVE_SAVE = 'RECEIVE_SAVE'
export const FAIL_SAVE = 'FAIL_SAVE'
export const RESET_CONFIGURATION = 'RESET_CONFIGURATION'
export const LOAD_CONFIGURATION = 'LOAD_CONFIGURATION'
export const REQUEST_SAVE = 'REQUEST_SAVE'
export const RECEIVE_SAVES = 'RECEIVE_SAVES'
export const REQUEST_SAVES = 'REQUEST_SAVES'
export const FAIL_SAVES = 'FAIL_SAVES'
export const REMOVE_SAVE = 'REMOVE_SAVE'

export const dumpConfiguration = (configuration: any) => {
  const { zones } = configuration

  return { ...configuration, zones: { ...zones, geometry: null } }
}

export const showSaveModal = () => {
  return {
    type: SHOW_SAVE_MODAL,
  }
}

export const hideSaveModal = () => {
  return {
    type: HIDE_SAVE_MODAL,
  }
}

export const receiveSave = (json: any) => {
  return {
    type: RECEIVE_SAVE,
    saveId: json.uuid,
    title: json.title,
  }
}

export const resetConfiguration = () => {
  return {
    type: RESET_CONFIGURATION,
  }
}

export const loadConfiguration = (configuration: any, save: any) => {
  return {
    type: LOAD_CONFIGURATION,
    configuration,
    save,
  }
}

export const requestSave = () => {
  return {
    type: REQUEST_SAVE,
  }
}

export const failSave = () => {
  return {
    type: FAIL_SAVE,
  }
}

export const receiveSaves = (saves: [any?]) => {
  return {
    type: RECEIVE_SAVES,
    saves: saves.map(item => {
      const { modified, configuration } = item

      return Object.assign(item, {
        modified: new Date(modified),
        configuration: JSON.parse(configuration),
      })
    }),
  }
}

export const requestSaves = () => {
  return {
    type: REQUEST_SAVES,
  }
}

export const fetchSaves = () => {
  return (dispatch: (event: any) => any, getState: () => any): any => {
    const { isLoggedIn } = getState().auth

    if (isLoggedIn) {
      dispatch(requestSaves())

      return get(`${config.apiRoot}run-configurations/`)
        .then(response => {
          const { status } = response

          if (status >= 200 && status < 300) {
            return response.json()
          }

          throw new Error(`Bad status loading saves: ${response.status}`)
        })
        .then(json => dispatch(receiveSaves(json.results)))
        .catch(() => {
          dispatch(receiveSaves([]))
        })
    }

    return null
  }
}

export const createSave = (configuration: any, title: string) => {
  return (dispatch: (event: any) => any) => {
    const data = {
      title,
      version: saveVersion,
      configuration: JSON.stringify(dumpConfiguration(configuration)),
    }

    dispatch(requestSave())

    return post(`${config.apiRoot}run-configurations/`, data)
      .then(response => {
        const { status } = response

        if (status >= 200 && status < 300) {
          return response.json()
        }

        throw new Error(`Bad status creating save: ${response.status}`)
      })
      .then(json => {
        dispatch(receiveSave(json))
        dispatch(fetchSaves())
      })
      .catch(err => {
        dispatch(failSave())
        dispatch(
          setError(
            'Save error',
            'Sorry, there was an error saving the configuration',
            JSON.stringify(
              {
                action: 'createSave',
                error: err ? err.message : null,
                data,
              },
              null,
              2,
            ),
          ),
        )
      })
  }
}

export const updateSave = (configuration: any, lastSave: any) => {
  return (dispatch: (event: any) => any) => {
    const data = {
      title: lastSave.title,
      version: saveVersion,
      configuration: JSON.stringify(dumpConfiguration(configuration)),
    }

    dispatch(requestSave())

    const url = `${config.apiRoot}run-configurations/${lastSave.saveId}/`

    return put(url, data)
      .then(response => {
        const { status } = response

        if (status >= 200 && status < 300) {
          return response.json()
        }

        throw new Error(`Bad status creating save: ${response.status}`)
      })
      .then(json => {
        dispatch(receiveSave(json))
        dispatch(fetchSaves())
      })
      .catch(err => {
        dispatch(failSave())
        dispatch(
          setError(
            'Save error',
            'Sorry, there was an error saving the configuration',
            JSON.stringify(
              {
                action: 'updateSave',
                error: err ? err.message : null,
                data,
              },
              null,
              2,
            ),
          ),
        )
      })
  }
}

export const failSaves = () => {
  return {
    type: FAIL_SAVES,
  }
}

export const removeSave = (uuid: string) => {
  return {
    type: REMOVE_SAVE,
    uuid,
  }
}

export const deleteSave = (uuid: string) => {
  return (dispatch: (event: any) => any) => {
    const url = `${config.apiRoot}run-configurations/${uuid}/`

    return ioDelete(url).then(response => {
      const { status } = response

      if (status >= 200 && status < 300) {
        dispatch(removeSave(uuid))
      } else {
        throw new Error(`Bad status deleting save: ${response.status}`)
      }
    })
  }
}
