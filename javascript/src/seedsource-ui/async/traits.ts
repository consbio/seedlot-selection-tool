import config from '../config'
import resync from '../resync'
import { pointIsValid } from './utils'
import { getServiceName } from '../utils'
import { setTraitValue } from '../actions/traits'
import parser, { getNames } from '../parser'
import { urlEncode } from '../io'

const valueSelect = ({ runConfiguration }: any) => {
  const { objective, climate, traits, region, species } = runConfiguration
  let { point } = runConfiguration

  if (point) {
    point = { x: point.x, y: point.y }
  }

  return {
    objective,
    point,
    climate,
    traits: traits.map((item: any) => item.name),
    region,
    species,
  }
}

export default (store: any) => {
  const { functions } = config

  resync(store, valueSelect, (state, io, dispatch, previousState) => {
    const { objective, point, climate, region } = state
    let { traits } = store.getState().runConfiguration

    if (!(pointIsValid(point) && !!region)) {
      return
    }

    traits = traits.map((item: any, i: number) => Object.assign(item, { index: i }))

    // If the only change is adding traits, we only need to fetch values for new traits
    const traitsOnly = JSON.stringify({ ...state, traits: null }) === JSON.stringify({ ...previousState, traits: null })
    if (traitsOnly) {
      traits = traits.filter((item: any) => item.value === null)
    }

    traits.forEach((item: any) => {
      dispatch(setTraitValue(item.index, null))

      const fnConfig = functions.find(fn => item.name === fn.name)
      const variables = getNames(fnConfig.fn)
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
          dispatch(setTraitValue(item.index, parser(fnConfig.fn, context)))
        })
        .catch(() => {
          dispatch(setTraitValue(item.index, null))
        })
    })
  })
}
