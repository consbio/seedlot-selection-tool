import { urlEncode } from '../io'
import config from '../config'

const fetchElevation = async (lat: number, lon: number, io?: any): Promise<number | undefined> => {
  try {
    const get = io?.get || ((url: string) => fetch(url))

    const getJson = async (url: string) => {
      const response = await get(url)
      return response.json()
    }

    const regionUrl = `${config.apiRoot}regions/?${urlEncode({
      point: `${lon},${lat}`,
    })}`

    const regionJson = await getJson(regionUrl)
    const { results } = regionJson
    const validRegions = results.map((region: any) => region.name)

    if (!validRegions.length) {
      // eslint-disable-next-line no-console
      console.warn(`No regions found for coordinates (${lat}, ${lon}).`)
      return undefined
    }

    const region = validRegions[0]

    const elevationUrl = `/arcgis/rest/services/${region}_dem/MapServer/identify/?${urlEncode({
      f: 'json',
      tolerance: '2',
      imageDisplay: '1600,1031,96',
      geometryType: 'esriGeometryPoint',
      mapExtent: '0,0,0,0',
      geometry: JSON.stringify({ x: lon, y: lat }),
    })}`

    const elevationJson = await getJson(elevationUrl)
    const elevationResults = elevationJson.results

    if (!elevationResults || elevationResults.length === 0) {
      return undefined
    }

    let value = elevationResults[0].attributes['Pixel value']

    if (Number.isNaN(value)) {
      value = null
    }

    return value !== null ? value : undefined
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Failed to fetch elevation:', error)
    return undefined
  }
}

export default fetchElevation
