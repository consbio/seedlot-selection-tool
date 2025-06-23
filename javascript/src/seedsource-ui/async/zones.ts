import config from '../config'
import resync from '../resync'
import { requestZones, receiveZones, failZones, requestGeometry, receiveGeometry, failGeometry } from '../actions/zones'
import { receiveAvailableSpecies } from '../actions/species'
import { urlEncode } from '../io'
import { pointIsValid } from './utils'

const availableZoneSelect = ({ runConfiguration }: any) => {
  let { point } = runConfiguration
  const { method } = runConfiguration

  if (point) {
    point = { x: point.x, y: point.y }
  }

  return { point, method }
}

const zoneSelect = ({ runConfiguration }: any) => {
  const { method, species } = runConfiguration
  let { point } = runConfiguration

  if (point) {
    point = { x: point.x, y: point.y }
  }

  return { point, method, species }
}

const zoneGeometrySelect = ({ runConfiguration }: any) => {
  const { zones } = runConfiguration
  const { selected, geometry } = zones

  return {
    zone: selected,
    hasGeometry: geometry !== null,
  }
}

export default (store: any) => {
  // Available Zones
  resync(store, availableZoneSelect, ({ point, method }, io, dispatch) => {
    if (method === 'seedzone' && pointIsValid(point)) {
      dispatch(requestZones())

      const url = `${config.apiRoot}seedzones/?${urlEncode({ point: `${point.x},${point.y}` })}`

      io.get(url)
        .then(response => response.json())
        .then((json: any) => dispatch(receiveAvailableSpecies(json.results.map((zone: any) => zone.species))))
    }
  })

  // Zones
  resync(store, zoneSelect, ({ point, method, species }, io, dispatch) => {
    if (method === 'seedzone' && pointIsValid(point)) {
      dispatch(requestZones())

      const url = `${config.apiRoot}seedzones/?${urlEncode({
        point: `${point.x},${point.y}`,
        species,
      })}`

      io.get(url)
        .then(response => response.json())
        .then(json => {
          dispatch(receiveZones(json.results))
        })
        .catch(() => {
          dispatch(failZones())
        })
    }
  })

  // Zone geometry
  resync(store, zoneGeometrySelect, ({ zone, hasGeometry }, io, dispatch) => {
    if (zone !== null && !hasGeometry) {
      dispatch(requestGeometry())
      const url = `${config.apiRoot}seedzones/${store.getState().runConfiguration.zones.selected}/geometry/`

      io.get(url)
        .then(response => response.json())
        .then(json => dispatch(receiveGeometry(json)))
        .catch(() => {
          dispatch(failGeometry())
        })
    }
  })
}
