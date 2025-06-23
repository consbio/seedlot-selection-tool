import resync from '../resync'
import { urlEncode } from '../io'
import {
  receivePopupElevation,
  requestPopupValue,
  receivePopupValue,
  requestPopupRegion,
  receivePopupRegion,
  receivePopupZones,
} from '../actions/popup'
import { fetchValues } from './variables'
import config from '../config'
import { receiveAvailableSpecies } from '../actions/species'

const popupSelect = ({ popup }: any) => {
  const { point } = popup

  return { point }
}

export default (store: any) =>
  resync(store, popupSelect, (state, io, dispatch, previousState) => {
    const { point } = state
    const pointIsValid = point !== null && point.x && point.y
    if (pointIsValid) {
      // Update popup regions
      const regionUrl = `${config.apiRoot}regions/?${urlEncode({
        point: `${point.x},${point.y}`,
      })}`

      dispatch(requestPopupRegion())

      io.get(regionUrl)
        .then(response => response.json())
        .then(json => {
          const { results } = json
          const validRegions = results.map((region: any) => region.name)

          const region = validRegions.length ? validRegions[0] : null
          dispatch(receivePopupRegion(region))
          return region
        })
        .then(region => {
          if (region !== null) {
            // Set elevation at point
            const url = `/arcgis/rest/services/${region}_dem/MapServer/identify/?${urlEncode({
              f: 'json',
              tolerance: '2',
              imageDisplay: '1600,1031,96',
              geometryType: 'esriGeometryPoint',
              mapExtent: '0,0,0,0',
              geometry: JSON.stringify({ x: point.x, y: point.y }),
            })}`

            io.get(url)
              .then(response => response.json())
              .then(json => {
                const { results } = json
                let value = null

                if (results.length) {
                  value = results[0].attributes['Pixel value']
                }

                if (Number.isNaN(value)) {
                  value = null
                }

                dispatch(receivePopupElevation(value))
              })

            // Set values at point
            const requests = fetchValues(store, state, io, dispatch, previousState, region)
            if (requests) {
              requests.forEach((request: any) => {
                dispatch(requestPopupValue(request.item.name))
                request.promise.then((json: any) => dispatch(receivePopupValue(request.item.name, json)))
              })
            }

            // Find seedzones at point
            const zonesUrl = `${config.apiRoot}seedzones/?${urlEncode({ point: `${point.x},${point.y}` })}`

            io.get(zonesUrl)
              .then(response => response.json())
              .then((json: any) =>
                dispatch(
                  receivePopupZones(
                    // eslint-disable-next-line camelcase
                    json.results.map((zone: any) => ({
                      id: zone.zone_uid,
                      name: zone.name,
                      elevation_band: zone.elevation_band,
                    })),
                  ),
                ),
              )
          }
        })
    }
  })
