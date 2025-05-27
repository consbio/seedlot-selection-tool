import { t } from 'ttag'
import { post, executeGPTask } from '../io'
import { setError } from './error'
import { dumpConfiguration } from './saves'
import config, { reports } from '../config'

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export const REQUEST_REPORT = 'REQUEST_REPORT'
export const RECEIVE_REPORT = 'RECEIVE_REPORT'
export const FAIL_REPORT = 'FAIL_REPORT'

export const requestReport = (name: string) => {
  return {
    type: REQUEST_REPORT,
    name,
  }
}

export const receiveReport = () => {
  return {
    type: RECEIVE_REPORT,
  }
}

export const failReport = () => {
  return {
    type: FAIL_REPORT,
  }
}

export const createReport = (name: string) => {
  const { species = [] } = config

  return (dispatch: (event: any) => any, getState: () => any) => {
    const { lastRun, job, map } = getState()
    const { basemap, zoom, center, opacity } = map

    const resultsLayer = `/tiles/${job.serviceId}/{z}/{x}/{y}.png`

    let configuration = dumpConfiguration(lastRun)
    configuration = Object.assign(configuration, {
      traits: configuration.traits.map((trait: any) => {
        const traitConfig = config.functions.find(fn => fn.name === trait.name)
        if (!traitConfig) {
          return trait
        }
        return Object.assign(trait, {
          transfer: trait.transfer || traitConfig.transfer,
          defaultTransfer: traitConfig.transfer,
        })
      }),
      customFunctions: configuration.customFunctions.filter((cf: any) => cf.selected),
    })

    const data = {
      configuration,
      tile_layers: [basemap, resultsLayer],
      zoom,
      center,
      opacity,
    }

    const speciesConfig = species.find(item => item.name === data.configuration.species)
    if (speciesConfig !== undefined) {
      data.configuration.species = speciesConfig.label
    }

    dispatch(requestReport(name))
    const reportUrl = reports.find(r => r.name === name)?.url

    if (!reportUrl) {
      throw new Error(`Report config not found: ${name}`)
    }

    // Safari workaround
    const supportsDownloadAttr = 'download' in document.createElement('a')
    if (!supportsDownloadAttr && navigator.msSaveBlob === undefined) {
      const form = document.createElement('form')
      form.method = 'POST'
      form.action = reportUrl

      Object.entries(data).forEach(([key, value]) => {
        const input = document.createElement('input')
        input.type = 'hidden'
        input.name = key as string
        input.value = JSON.stringify(value)

        form.appendChild(input)
      })

      form.submit()

      // We don't know when the report is complete in this so wait a few seconds and dispatch the receive event
      setTimeout(() => dispatch(receiveReport()), 5000)

      return
    }

    post(reportUrl, data)
      .then(response => {
        const { status } = response

        if (status >= 200 && status < 300) {
          return response.blob()
        }

        throw new Error(`Bad status creating report: ${response.status}`)
      })
      .then(blob => {
        const today = new Date()
        const filename = `SST Report ${months[today.getMonth()]} ${today.getDate()}, ${today.getFullYear()}.${
          getState().report.name
        }`
        if (navigator.msSaveBlob !== undefined) {
          navigator.msSaveBlob(blob, filename)
        } else {
          const reader = new FileReader()
          reader.addEventListener('loadend', e => {
            const node = document.createElement('a')
            node.setAttribute('href', e.target?.result as string)
            node.setAttribute('download', filename)
            document.body.appendChild(node)
            node.click()
            document.body.removeChild(node)
          })
          reader.readAsDataURL(blob)
        }

        dispatch(receiveReport())
      })
      .catch(err => {
        dispatch(
          setError(
            t`Error creating report`,
            t`Sorry, there was an error creating the report.`,
            JSON.stringify(
              {
                action: 'createReport',
                error: err ? err.message : null,
                data,
              },
              null,
              2,
            ),
          ),
        )
        dispatch(failReport())
      })
  }
}

export const runTIFJob = () => {
  return (dispatch: (event: any) => any, getState: () => any) => {
    dispatch(requestReport('tif'))

    const inputs = {
      service_id: getState().job.serviceId,
    } as any

    if (config.runtime.languageCode) {
      inputs.language_code = config.runtime.languageCode
    }

    return executeGPTask('write_tif', inputs)
      .then((json: any) => {
        dispatch(receiveReport())

        const { filename } = JSON.parse(json.outputs)
        const today = new Date()

        window.location.href = `/downloads/${filename}?date=${
          months[today.getMonth()]
        } ${today.getDate()}, ${today.getFullYear()}`
      })
      .catch(err => {
        const data = { action: 'runTIFJob' } as { action: string; response?: any }
        if (err.json !== undefined) {
          data.response = err.json
        }

        dispatch(failReport())
        dispatch(setError(t`Processing error`, t`Sorry, processing failed.`, JSON.stringify(data, null, 2)))
      })
  }
}
