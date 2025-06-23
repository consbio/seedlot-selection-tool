import { saveVersion, migrations } from './config'

declare const document: any

export const getServiceName = (variable: string, objective: string, climate: any, region: string) => {
  let serviceName = `${region}_`

  // Show site climate when looking for seedlots, and seedlot climate when looking for sites
  const selectedClimate = objective === 'seedlots' ? climate.site : climate.seedlot
  const { time, model } = selectedClimate

  if (time === '1961_1990' || time === '1981_2010') {
    serviceName += time
  } else {
    serviceName += `${model}_${time}`
  }

  return `${serviceName}Y_${variable}`
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
    2025: '2011 - 2040',
    2055: '2041 - 2070',
    2085: '2071 - 2100',
  }

  return labels[year]
}

export const formatModel = (model: string) => {
  const labels: any = {
    rcp45: 'RCP 4.5',
    rcp85: 'RCP 8.5',
  }

  return labels[model]
}

export const formatClimate = (year: string, model: string) => {
  let label = formatYear(year)
  if (year !== '1961_1990' && year !== '1981_2010') {
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
