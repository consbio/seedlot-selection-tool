import fetch from 'isomorphic-fetch'
import { getCookies } from './utils'

type GPTaskCallback = (data: any) => any

class GPTaskError extends Error {
  json: any
}

export const urlEncode = (data: any) => {
  const items = Object.keys(data).map(item => `${encodeURIComponent(item)}=${encodeURIComponent(data[item])}`)

  return items.join('&')
}

export const get = (url: string) => {
  return fetch(url, {
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json, */*',
    },
  })
}

export const post = (url: string, data: any, options: { [key: string]: string } = {}) => {
  let { method } = options

  if (!method) {
    method = 'POST'
  }
  const cookies = getCookies()

  // Accept-Language
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json, */*',
    'X-CSRFToken': getCookies().csrftoken,
  } as any

  if (cookies.django_language) {
    headers['Accept-Language'] = cookies.django_language
  }

  return fetch(url, {
    method,
    credentials: 'same-origin',
    headers,
    body: data ? JSON.stringify(data) : data,
  })
}

export const put = (url: string, data: any, options?: { [key: string]: string }) =>
  post(url, data, { method: 'PUT', ...options })

export const ioDelete = (url: string, options?: { [key: string]: string }) =>
  post(url, null, { method: 'DELETE', ...options })

export const executeGPTask = (job: string, inputs: any, statusCallback: GPTaskCallback | null = null) => {
  const data = {
    job,
    inputs: JSON.stringify(inputs),
  }

  const handleJSONResponse = (response: Response) => {
    const { status } = response

    if (status >= 200 && status < 300) {
      return response.json()
    }

    throw new Error(`Bad response code:  ${response.status}`)
  }

  return post('/geoprocessing/rest/jobs/', data)
    .then(handleJSONResponse)
    .then(json => {
      const { uuid } = json

      return new Promise((resolve, reject) => {
        const pollStatus = () => {
          get(`/geoprocessing/rest/jobs/${uuid}/`)
            .then(handleJSONResponse)
            .then(statusJson => {
              if (statusCallback) {
                statusCallback(statusJson)
              }

              if (statusJson.status === 'success') {
                resolve(statusJson)
              } else if (statusJson.status === 'failure') {
                const err = new GPTaskError('Job failed')
                err.json = statusJson
                reject(err)
              } else {
                setTimeout(pollStatus, 1000)
              }
            })
            .catch(err => reject(err))
        }

        setTimeout(pollStatus, 1000)
      })
    })
}
