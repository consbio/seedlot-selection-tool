import { saveVersion, migrations } from './config'
import { get, urlEncode } from './io'

declare const document: any

export const getServiceName = (variable: string, objective: string, climate: any, region: string) => {
  let serviceName = `${region}_`

  // Show site climate when looking for seedlots, and seedlot climate when looking for sites
  const selectedClimate = objective === 'seedlots' ? climate.site : climate.seedlot
  const { time, model } = selectedClimate

  if (['1961_1990', '1981_2010', '1991_2020'].includes(time)) {
    serviceName += time
  } else {
    serviceName += `${model}_${time}`
  }

  return `${serviceName}SY_${variable}`
}

export const getCookies = () => {
  const cookies: { [key: string]: string } = {}

  document.cookie.split(';').forEach((item: string) => {
    const [name, value] = item.trim().split('=')
    cookies[name] = decodeURIComponent(value)
  })

  return cookies
}

export const isClose = (a: number, b: number) => {
  return Math.abs(a - b) <= Math.max(1e-3 * Math.max(Math.abs(a), Math.abs(b)), 0.0)
}

// export const text = (key: string, def: string) => {
//   if (config.text !== undefined && Object.prototype.hasOwnProperty.call(config.text, key)) {
//     return config.text[key]
//   }
//   return def
// }

export const formatYear = (year: string) => {
  const labels: any = {
    '1961_1990': '1961 - 1990',
    '1981_2010': '1981 - 2010',
    '1991_2020': '1991 - 2020',
    '2011-2040': '2011 - 2040',
    '2041-2070': '2041 - 2070',
    '2071-2100': '2071 - 2100',
  }

  return labels[year]
}

export const formatModel = (model: string) => {
  return model.toUpperCase()
}

export const formatClimate = (year: string, model: string) => {
  let label = formatYear(year)
  if (!['1961_1990', '1981_2010', '1991_2020'].includes(year)) {
    label += ` ${formatModel(model)}`
  }
  return label
}

export const getZoneLabel = (zone?: any) => {
  if (zone === undefined) {
    return null
  }

  let label = zone.name

  if (zone.elevation_band && zone.elevation_band.length > 2 && zone.elevation_band[2].trim()) {
    label += ` ${zone.elevation_band[2]}`
  } else if (zone.elevation_band) {
    label += `, ${zone.elevation_band[0]}' - ${zone.elevation_band[1]}'`
  }

  return label
}

export const migrateConfiguration = (configuration: any, version: number) => {
  let updatedConfiguration = configuration

  for (let i = version; i < saveVersion; i += 1) {
    const migration = migrations.find(m => m.version === i)
    if (migration) {
      updatedConfiguration = migration.migrate(updatedConfiguration)
    }
  }
  return updatedConfiguration
}

export const fetchVariables = (variables: any, objective: any, climate: any, region: any, point: any, io?: any) => {
  type APIType = {
    results: {
      layerId: any
      layerName: any
      value: any
      displayFieldName: any
      attributes: { 'Pixel value': number }
    }[]
  }
  const requests: { item: any; promise: Promise<APIType> }[] = variables.map((item: any) => {
    const serviceName = getServiceName(item.name, objective, climate, region)
    const url = `/arcgis/rest/services/${serviceName}/MapServer/identify/?${urlEncode({
      f: 'json',
      tolerance: 2,
      imageDisplay: '1600,1031,96',
      geometryType: 'esriGeometryPoint',
      mapExtent: '0,0,0,0',
      geometry: JSON.stringify(point),
    })}`

    let promise: Promise<APIType>
    if (io) {
      promise = io.get(url).then((response: any) => response.json())
    } else {
      promise = get(url).then((response: any) => response.json())
    }

    return { item, promise }
  })

  return requests
}
