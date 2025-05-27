import config from '../config'
import { executeGPTask } from '../io'
import { setError } from './error'
import { selectTab } from './tabs'
import { UserSite } from '../reducers/runConfiguration'
import { setUserSiteScore } from './point'
import type { CustomFunction } from '../reducers/customFunctions'

export const START_JOB = 'START_JOB'
export const FAIL_JOB = 'FAIL_JOB'
export const RECEIVE_JOB_STATUS = 'RECEIVE_JOB_STATUS'
export const FINISH_JOB = 'FINISH_JOB'

export const startJob = (configuration: any) => {
  return {
    type: START_JOB,
    configuration,
  }
}

export const failJob = () => {
  return {
    type: FAIL_JOB,
  }
}

export const receiveJobStatus = (json: any) => {
  return {
    type: RECEIVE_JOB_STATUS,
    status: json.status,
    serviceId: json.status === 'success' ? JSON.parse(json.outputs).raster_out : null,
  }
}

export const finishJob = (configuration: any) => {
  return {
    type: FINISH_JOB,
    configuration,
  }
}

export const runJob = (configuration: any) => {
  const { functions, constraints: constraintsConfig } = config

  return (dispatch: (action: any) => any) => {
    const {
      variables,
      traits,
      objective,
      climate,
      region,
      constraints,
      userSites,
      customMode,
      customFunctions,
    } = configuration

    /* Run the tool against the seedlot climate when looking for seedlots, otherwise run against the
     * planting site climate.
     */
    const selectedClimate = objective === 'seedlots' ? climate.seedlot : climate.site
    const { time: year } = selectedClimate

    const inputs = {
      region,
      year: selectedClimate.time,
      model: year === '1961_1990' || year === '1981_2010' ? undefined : selectedClimate.model,
      variables: variables.map((item: any) => {
        const { name, transfer, customCenter } = item
        const value = customMode ? customCenter : item.value
        return {
          name,
          limit: { min: value - transfer, max: value + transfer },
        }
      }),
      functions: [
        ...customFunctions
          .filter((cf: CustomFunction) => cf.selected && cf.value && cf.transfer)
          .map((cf: CustomFunction) => {
            const { name, func: fn, value, transfer } = cf
            return {
              name,
              fn,
              limit: { min: value! - transfer!, max: value! + transfer! },
            }
          }),
        ...traits.map((item: any) => {
          const { name, value, transfer: customTransfer } = item
          const traitConfig = functions.find((trait: any) => trait.name === name)
          const { transfer: defaultTransfer, fn } = traitConfig
          const transfer = customTransfer === null ? defaultTransfer : customTransfer
          return {
            name,
            fn,
            limit: { min: value - transfer, max: value + transfer },
          }
        }),
      ],
      constraints: constraints.map(({ name, values }: { name: any; values: any }) => {
        const { constraint, serialize } = constraintsConfig.objects[name]
        return { name: constraint, args: serialize(configuration, values) }
      }),
    } as {
      region: string
      year: string
      variables: any
      functions: any
      constraints: any
      points?: any
    }

    if (userSites.length) {
      inputs.points = {
        headers: { x: 'lon', y: 'lat' },
        points: userSites.map(({ lat, lon }: UserSite) => ({ lat, lon })),
      }
    }

    dispatch(startJob(configuration))

    return executeGPTask('generate_scores', inputs, json => dispatch(receiveJobStatus(json)))
      .then((json: any) => {
        dispatch(finishJob(configuration))
        dispatch(selectTab('map'))

        const { points } = JSON.parse(json.outputs)
        if (points?.length) {
          points.forEach(({ lat, lon, score, deltas }: { lat: number; lon: number; score: number; deltas?: any }) => {
            dispatch(setUserSiteScore({ lat, lon }, score, deltas))
          })
        }
      })
      .catch(err => {
        const data = { action: 'runJob' } as { action: string; response?: any }
        if (err.json !== undefined) {
          data.response = err.json
        }

        dispatch(failJob())
        dispatch(setError('Processing error', 'Sorry, processing failed.', JSON.stringify(data, null, 2)))
      })
  }
}
