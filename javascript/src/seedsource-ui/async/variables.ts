import resync from '../resync'
import { requestTransfer, receiveTransfer, requestValue, receiveValue, setVariablesRegion } from '../actions/variables'
import { urlEncode } from '../io'
import { fetchVariables } from '../utils'
import config, { DefaultVariable } from '../config'

const transferSelect = ({ runConfiguration }: any) => {
  let { point } = runConfiguration
  const { method, zones, climate, useDefaultVariables, variables, region } = runConfiguration

  if (point) {
    point = { x: point.x, y: point.y }
  }

  return {
    method,
    point,
    zone: zones.selected,
    year: climate.seedlot.time,
    useDefaultVariables,
    variables: variables.map((item: any) => item.name),
    region,
  }
}

const valueSelect = ({ runConfiguration }: any) => {
  let { point } = runConfiguration
  const { objective, climate, variables, validRegions } = runConfiguration

  if (point) {
    point = { x: point.x, y: point.y }
  }

  return {
    objective,
    point,
    climate,
    variables: variables.map((item: any) => item.name),
    validRegions,
  }
}

const climateRegionObjectiveSelect = ({ runConfiguration }: any) => {
  const { climate, region, objective } = runConfiguration

  return {
    climate,
    region,
    objective,
  }
}

export const fetchValues = (store: any, state: any, io: any, previousState: any, regionIn?: any) => {
  const { objective, point } = state
  const pointIsValid = point !== null && point.x && point.y
  const { runConfiguration } = store.getState()
  const { climate, validRegions } = runConfiguration
  let { variables } = runConfiguration

  if (!(pointIsValid && validRegions.length)) {
    return []
  }

  // If region is not supplied, use nearest region captured
  const region = regionIn || validRegions[0]

  // If only variables have changed, then not all variables need to be refreshed
  const variablesOnly =
    JSON.stringify({ ...state, variables: null }) === JSON.stringify({ ...previousState, variables: null })
  if (variablesOnly) {
    variables = variables.filter((item: any) => item.value === null)
  }

  return fetchVariables(variables, objective, climate, region, point, io)
}

export default (store: any) => {
  // Transfer limit information
  resync(store, transferSelect, (state, io, dispatch, previousState) => {
    const flag = (window as any).waffle.flag_is_active('default-vars')

    const { method, point, zone, year, useDefaultVariables } = state

    const pointIsValid = point !== null && point.x && point.y
    const { runConfiguration } = store.getState()
    let { variables } = runConfiguration
    const { validRegions } = runConfiguration

    if (!validRegions.length) {
      return
    }

    const region = validRegions[0]

    if (!(pointIsValid && method === 'seedzone')) {
      if (pointIsValid && region && useDefaultVariables) {
        const { defaultVariables } = config

        if (flag) {
          variables
            .map(({ name }: { name: string }) => defaultVariables.find(({ variable }) => variable === name))
            .filter((item?: DefaultVariable) => !!item)
            .forEach(({ getValue }: DefaultVariable) => getValue(dispatch, point, region))
        }
      }
      return
    }

    // If only variables have changed, then not all variables need to be refreshed
    const variablesOnly =
      JSON.stringify({ ...state, variables: null }) === JSON.stringify({ ...previousState, variables: null })

    if (variablesOnly) {
      variables = variables.filter((item: any) => item.defaultTransfer === null)
    }

    // Only need to fetch transfer for variables which don't have one
    variables.forEach((item: any) => {
      dispatch(requestTransfer(item.name))

      const url = `${config.apiRoot}transfer-limits/?${urlEncode({
        point: `${point.x},${point.y}`,
        variable: item.name,
        zone__zone_uid: zone,
        time_period: year,
      })}`

      return io
        .get(url)
        .then(response => response.json())
        .then(json => {
          if (json.results.length) {
            const { transfer, avg_transfer: avgTransfer, center } = json.results[0]

            dispatch(receiveTransfer(item.name, transfer, avgTransfer, center))
          } else {
            dispatch(receiveTransfer(item.name, null, null, null))
          }
        })
        .catch(() => dispatch(receiveTransfer(item.name, null, null, null)))
    })
  })

  // Values at point (for variables list)
  resync(store, valueSelect, (state, io, dispatch, previousState) => {
    const { validRegions } = state

    if (validRegions.length) {
      const requests = fetchValues(store, state, io, previousState, validRegions[0])

      requests.forEach((request: any) => {
        dispatch(requestValue(request.item.name))
        request.promise.then((json: any) => dispatch(receiveValue(request.item.name, json)))
      })
    }
  })

  resync(store, climateRegionObjectiveSelect, (state, io, dispatch) => {
    const { region } = state || null

    dispatch(setVariablesRegion(region))
  })
}
