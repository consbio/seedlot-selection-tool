import resync from '../resync'
import { pointIsValid } from './utils'
import { setFunctionValue } from '../actions/customFunctions'
import parser, { getNames } from '../parser'
import { getServiceName } from '../utils'
import { urlEncode } from '../io'
import { CustomFunction } from '../reducers/customFunctions'

const valueSelect = ({ runConfiguration }: any) => {
  const { customFunctions, objective, climate, region } = runConfiguration
  let { point } = runConfiguration

  if (point) {
    point = { x: point.x, y: point.y }
  }

  return {
    objective,
    climate,
    region,
    point,
    customFunctions: customFunctions.map((cf: CustomFunction) => ({ id: cf.id, func: cf.func, selected: cf.selected })),
  }
}

export default (store: any) => {
  resync(store, valueSelect, (state, io, dispatch, previousState) => {
    const { objective, point, climate, region } = state
    let { customFunctions } = store.getState().runConfiguration

    if (!(pointIsValid(point) && !!region)) {
      return
    }

    // If the only change is to customFunctions, we only need to fetch values for new or changed customFunctions
    const customFunctionsOnly =
      JSON.stringify({ ...state, customFunctions: null }) ===
      JSON.stringify({ ...previousState, customFunctions: null })
    if (customFunctionsOnly) {
      customFunctions = customFunctions.filter((cf: any) => {
        const prevFunc = previousState.customFunctions.find((pf: any) => pf.id === cf.id)
        if (prevFunc) {
          const { id, func, selected } = cf
          return JSON.stringify(prevFunc) !== JSON.stringify({ id, func, selected })
        }
        return true
      })
    }

    customFunctions.forEach((cf: any) => {
      dispatch(setFunctionValue(cf.id, null))

      if (cf.selected) {
        const variables = getNames(cf.func)
        Promise.all(
          variables.map(variable => {
            if (variable === 'LAT') {
              return Promise.resolve([variable, point.y])
            }

            const serviceName = getServiceName(variable, objective, climate, region)
            const url = `/arcgis/rest/services/${serviceName}/MapServer/identify/?${urlEncode({
              f: 'json',
              tolerance: 2,
              imageDisplay: '1600,1031,96',
              geometryType: 'esriGeometryPoint',
              mapExtent: '0,0,0,0',
              geometry: JSON.stringify(point),
            })}`
            return io
              .get(url)
              .then(response => response.json())
              .then(json => [variable, json.results[0].attributes['Pixel value']])
          }),
        )
          .then(values => {
            const context: any = {}
            values.forEach(([variable, value]) => {
              context[variable] = value
            })
            dispatch(setFunctionValue(cf.id, parser(cf.func, context)))
          })
          .catch(() => {
            dispatch(setFunctionValue(cf.id, null))
          })
      }
    })
  })
}
