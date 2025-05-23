import { t, c } from 'ttag'
import ElevationConstraint from './containers/ElevationConstraint'
import PhotoperiodConstraint from './containers/PhotoperiodConstraint'
import LatitudeConstraint from './containers/LatitudeConstraint'
import LongitudeConstraint from './containers/LongitudeConstraint'
import DistanceConstraint from './containers/DistanceConstraint'
import ShapefileConstraint from './containers/ShapefileConstraint'
import { getServiceName } from './utils'

interface RuntimeConfig {
  title: string
  staticRoot: string
  mbtileserverRoot: string
  languageCode?: string
}

export interface DefaultVariable {
  variable: string
  getValue: (dispatch: (action: any) => any, point: { x: number; y: number }, region: string) => any
}

export interface LayerConfig {
  type: 'raster' | 'vector'
  label: string
  show: (state: any) => boolean
  url: string | ((state: any) => string)
  style?: any
  zIndex?: number
  legendUrl?: (state: any) => string
}

export interface LayerCategory {
  label: string
  show: (state: any) => boolean | string
  layers: string[]
  showByDefault?: boolean
}

export interface Config {
  languages?: { [name: string]: string }
  apiRoot: string
  logo: string
  navbarClass: string
  speciesLabel: string
  labels: any[]
  functions: any[]
  species: any[]
  defaultVariables: DefaultVariable[]
  text: any
  constraints: { objects: any; categories: any }
  layers: { [id: string]: LayerConfig }
  layerCategories: LayerCategory[]
  runtime: RuntimeConfig
}

export interface PartialConfig {
  languages?: { [name: string]: string }
  apiRoot: string
  logo?: string
  navbarClass?: string
  speciesLabel?: string
  labels?: any[]
  functions?: any[]
  species: any[]
  defaultVariables?: DefaultVariable[]
  constraints: { objects: any; categories: any }
  layers?: { [id: string]: LayerConfig }
  layerCategories?: LayerCategory[]
  runtime?: RuntimeConfig
}

interface Window {
  SS_CONFIG: RuntimeConfig
  SEEDSOURCE_UI_CONFIG: Config
}

const celsiusUnits = {
  metric: {
    label: `°${c("Abbreviation of 'Celsius'").t`C`}`,
    convert: (value: number) => (value - 32) / 1.8, // Convert to celsius
    convertTransfer: (value: number) => value / 1.8, // Convert difference to celsuis
    precision: 1,
    transferPrecision: 2,
  },
  imperial: {
    label: `°${c("Abbreviation of 'Fahrenheit'").t`F`}`,
    convert: (value: number) => value * 1.8 + 32, // Convert to fahrenheit
    convertTransfer: (value: number) => value * 1.8, // Convert difference to fahrenheit
    precision: 1,
    transferPrecision: 2,
  },
}

const mmUnits = {
  metric: {
    label: c("Abbreviation of 'millimeters'").t`mm`,
    convert: (value: number) => value * 25.4, // Convert to millimeters
    precision: 0,
    transferPrecision: 0,
  },
  imperial: {
    label: c("Abbreviation of 'inches'").t`in`,
    convert: (value: number) => value / 25.4, // Convert to inches
    precision: 1,
    transferPrecision: 1,
  },
}

const daysUnits = {
  metric: {
    label: t`days`,
    convert: (value: number) => value,
    precision: 0,
    transferPrecision: 0,
  },
  imperial: {
    label: t`days`,
    convert: (value: number) => value,
    precision: 0,
    transferPrecision: 0,
  },
}

const degreeDaysUnits = {
  metric: {
    label: 'dd', // Do not translate
    convert: (value: number) => value,
    precision: 0,
    transferPrecision: 0,
  },
  imperial: {
    label: 'dd', // Do not translate
    convert: (value: number) => value,
    precision: 0,
    transferPrecision: 0,
  },
}

const heatMoistureUnits = {
  metric: {
    label: '',
    convert: (value: number) => value,
    precision: 1,
    transferPrecision: 1,
  },
  imperial: {
    label: '',
    convert: (value: number) => value,
    precision: 1,
    transferPrecision: 1,
  },
}

export const variables = [
  {
    name: 'MAT',
    label: t`Mean annual temperature`,
    multiplier: 10,
    units: celsiusUnits,
  },
  {
    name: 'MWMT',
    label: t`Mean warmest month temperature`,
    multiplier: 10,
    units: celsiusUnits,
  },
  {
    name: 'MCMT',
    label: t`Mean coldest month temperature`,
    multiplier: 10,
    units: celsiusUnits,
  },
  {
    name: 'TD',
    label: `Temperature difference between MWMT and MCMT, or continentality`,
    multiplier: 10,
    units: {
      metric: {
        label: `°${c("Abbreviation of 'Celsius'").t`C`}`,
        convert: (value: number) => value / 1.8, // Convert temp difference to C
        precision: 1,
        transferPrecision: 2,
      },
      imperial: {
        label: `°${c("Abbreviation of 'Fahrenheit'").t`F`}`,
        convert: (value: number) => value * 1.8, // Convert temp difference to F
        precision: 1,
        transferPrecision: 2,
      },
    },
  },
  {
    name: 'MAP',
    label: t`Mean annual precipitation`,
    multiplier: 1,
    units: mmUnits,
  },
  {
    name: 'MSP',
    label: t`Mean summer precipitation, May to September`,
    multiplier: 1,
    units: mmUnits,
  },
  {
    name: 'AHM',
    label: t`Annual heat-moisture index`,
    multiplier: 10,
    units: heatMoistureUnits,
  },
  {
    name: 'SHM',
    label: t`Summer heat-moisture index`,
    multiplier: 10,
    units: heatMoistureUnits,
  },
  {
    name: 'DD_0',
    label: t`Degree-days below 0° C`,
    multiplier: 1,
    units: degreeDaysUnits,
  },
  {
    name: 'DD5',
    label: t`Degree-days above 5° C`,
    multiplier: 1,
    units: degreeDaysUnits,
  },
  {
    name: 'FFP',
    label: t`Frost-free period`,
    multiplier: 1,
    units: daysUnits,
  },
  {
    name: 'PAS',
    label: t`Precipitation as snow, August to July`,
    multiplier: 1,
    units: mmUnits,
  },
  {
    name: 'EMT',
    label: t`Extreme minimum temperature over 30 years`,
    multiplier: 10,
    units: celsiusUnits,
  },
  {
    name: 'EXT',
    label: t`Extreme maximum temperature over 30 years`,
    multiplier: 10,
    units: celsiusUnits,
  },
  {
    name: 'Eref',
    label: t`Hargreaves reference evaporation`,
    multiplier: 1,
    units: mmUnits,
  },
  {
    name: 'CMD',
    label: t`Hargreaves climatic moisture deficit`,
    multiplier: 1,
    units: mmUnits,
  },
]

declare const window: Window

if (!window.SEEDSOURCE_UI_CONFIG) {
  window.SEEDSOURCE_UI_CONFIG = {
    apiRoot: '/sst/',
    logo: '',
    navbarClass: '',
    speciesLabel: 'species',
    labels: [],
    functions: [],
    species: [],
    defaultVariables: [],
    text: {},
    constraints: {
      objects: {
        elevation: {
          component: ElevationConstraint,
          constraint: 'elevation',
          values: { range: 0 },
          serialize: (configuration: any, values: any) => {
            const { elevation } = configuration.point
            const { range } = values

            return { min: elevation - range, max: elevation + range }
          },
        },
        photoperiod: {
          component: PhotoperiodConstraint,
          constraint: 'photoperiod',
          values: {
            hours: 0,
            month: 1,
            day: 1,
            year: 1961,
          },
          serialize: (configuration: any, values: any) => {
            const { x, y } = configuration.point
            return { ...values, lon: x, lat: y }
          },
        },
        latitude: {
          component: LatitudeConstraint,
          constraint: 'latitude',
          values: { range: 0 },
          serialize: (configuration: any, { range }: { range: any }) => {
            const { y } = configuration.point
            return { min: y - range, max: y + range }
          },
        },
        longitude: {
          component: LongitudeConstraint,
          constraint: 'longitude',
          values: { range: 0 },
          serialize: (configuration: any, { range }: { range: any }) => {
            const { x } = configuration.point
            return { min: x - range, max: x + range }
          },
        },
        distance: {
          component: DistanceConstraint,
          constraint: 'distance',
          values: { range: 0 },
          serialize: (configuration: any, { range }: { range: any }) => {
            const { x, y } = configuration.point
            return { lat: y, lon: x, distance: range }
          },
        },
        shapefile: {
          component: ShapefileConstraint,
          constraint: 'shapefile',
          values: {
            geoJSON: null,
            filename: null,
          },
          serialize: (_: any, { geoJSON }: { geoJSON: any }) => {
            return { geoJSON }
          },
        },
      },
      categories: [
        {
          name: 'geographic',
          label: t`Geographic`,
          type: 'category',
          items: [
            {
              type: 'constraint',
              name: 'elevation',
              label: t`Elevation`,
            },
            {
              type: 'constraint',
              name: 'photoperiod',
              label: t`Photoperiod`,
            },
            {
              type: 'constraint',
              name: 'latitude',
              label: t`Latitude`,
            },
            {
              type: 'constraint',
              name: 'longitude',
              label: t`Longitude`,
            },
            {
              type: 'constraint',
              name: 'distance',
              label: t`Distance`,
            },
            {
              type: 'constraint',
              name: 'shapefile',
              label: 'Shapefile', // Do not localize
            },
          ],
        },
      ],
    },

    layers: {
      results: {
        type: 'raster',
        label: 'Last Run',
        show: ({ job: { serviceId } }) => !!serviceId,
        url: ({ job: { serviceId } }) => `/tiles/${serviceId}/{z}/{x}/{y}.png`,
        legendUrl: ({ job: { serviceId } }) => `/arcgis/rest/services/${serviceId}/MapServer/legend`,
        zIndex: 10,
      },
      ...Object.fromEntries(
        variables.map(({ name, label }) => {
          return [
            `variable-${name}`,
            {
              type: 'raster',
              label,
              show: () => true,
              url: ({ runConfiguration: { region, objective, climate } }) =>
                `/tiles/${getServiceName(name, objective, climate, region)}/{z}/{x}/{y}.png`,
              legendUrl: ({ runConfiguration: { region, objective, climate } }) =>
                `/arcgis/rest/services/${getServiceName(name, objective, climate, region)}/MapServer/legend`,
            },
          ]
        }),
      ),
    },

    layerCategories: [
      {
        label: t`Results`,
        show: ({ job: { serviceId } }) => !!serviceId || t`Run the tool to view results`,
        layers: ['results'],
        showByDefault: true,
      },
      {
        label: t`Variables`,
        show: ({ runConfiguration: { region } }) =>
          !!region || t`Select a region and climate scenario to view variables`,
        layers: variables.map(({ name }) => `variable-${name}`),
      },
    ],

    runtime: window.SS_CONFIG,
  }
}

const config: Config = window.SEEDSOURCE_UI_CONFIG

export default config
export const reports: { name: string; label: string; url: string }[] = []

export const updateConfig = (newConfig: PartialConfig) => {
  Object.assign(config, newConfig)

  const { apiRoot } = config

  reports.push(
    ...[
      {
        name: 'pdf',
        label: 'PDF',
        url: `${apiRoot}create-pdf/`,
      },
      {
        name: 'pptx',
        label: 'PPT',
        url: `${apiRoot}create-ppt/`,
      },
    ],
  )
}

export const collapsibleSteps = false

export const species = [
  {
    name: 'psme',
    label: t`Douglas-fir`,
  },
  {
    name: 'pico',
    label: t`Lodgepole pine`,
  },
  {
    name: 'piba',
    label: t`Jack pine`,
  },
  {
    name: 'pipo',
    label: t`Ponderosa pine`,
  },
  {
    name: 'pima',
    label: t`Black spruce`,
  },
  {
    name: 'thpl',
    label: t`Western red cedar`,
  },
  {
    name: 'pimo',
    label: t`Western white pine`,
  },
  {
    name: 'abam',
    label: t`Pacific silver fir`,
  },
  {
    name: 'abco',
    label: t`White fir`,
  },
  {
    name: 'abgr',
    label: t`Grand fir`,
  },
  {
    name: 'abpr',
    label: t`Grand fir`,
  },
  {
    name: 'absh',
    label: t`Shasta red fir`,
  },
  {
    name: 'alru2',
    label: t`Red alder`,
  },
  {
    name: 'cade27',
    label: t`Incense cedar`,
  },
  {
    name: 'chla',
    label: t`Port orford cedar`,
  },
  {
    name: 'chno',
    label: t`Alaska yellow cedar`,
  },
  {
    name: 'laoc',
    label: t`Western larch`,
  },
  {
    name: 'pial',
    label: t`Whitebark pine`,
  },
  {
    name: 'pien',
    label: t`Engelmann spruce`,
  },
  {
    name: 'pije',
    label: t`Jeffrey pine`,
  },
  {
    name: 'pila',
    label: t`Sugar pine`,
  },
  {
    name: 'tabr2',
    label: t`Pacific yew`,
  },
  {
    name: 'tshe',
    label: t`Western red cedar`,
  },
  {
    name: 'tsme',
    label: t`Mountain hemlock`,
  },
]

export const constraints = {
  elevation: {
    values: {
      range: 0,
    },
    serialize: (configuration: any, values: any) => {
      const { elevation } = configuration.point
      const { range } = values

      return { min: elevation - range, max: elevation + range }
    },
  },
  photoperiod: {
    values: {
      hours: 0,
      month: 1,
      day: 1,
      year: 1961,
    },
    serialize: (configuration: any, values: any) => {
      const { x, y } = configuration.point
      return { ...values, lon: x, lat: y }
    },
  },
  latitude: {
    values: {
      range: 0,
    },
    serialize: (configuration: any, { range }: { range: number }) => {
      const { y } = configuration.point
      return { min: y - range, max: y + range }
    },
  },
  longitude: {
    values: {
      range: 0,
    },
    serialize: (configuration: any, { range }: { range: number }) => {
      const { x } = configuration.point
      return { min: x - range, max: x + range }
    },
  },
  distance: {
    values: {
      range: 0,
    },
    serialize: (configuration: any, { range }: { range: number }) => {
      const { x, y } = configuration.point
      return { lat: y, lon: x, distance: range }
    },
  },
  shapefile: {
    values: {
      geoJSON: null,
      filename: null,
    },
    serialize: (configuration: any, { geoJSON }: { geoJSON: any }) => {
      return { geoJSON }
    },
  },
}

export const timeLabels: { [name: string]: string } = {
  '1961_1990': '1961 - 1990',
  '1981_2010': '1981 - 2010',
  '2025rcp45': '2025 RCP 4.5',
  '2025rcp85': '2025 RCP 8.5',
  '2055rcp45': '2055 RCP 4.5',
  '2055rcp85': '2055 RCP 8.5',
  '2085rcp45': '2085 RCP 4.5',
  '2085rcp85': '2085 RCP 8.5',
}

export const regions = [
  {
    name: 'ak2',
    label: t`Alaska`,
  },
  {
    name: 'west2',
    label: c('Western United States').t`Western US`,
  },
  {
    name: 'nc1',
    label: t`North Central`,
  },
  {
    name: 'uscentral1',
    label: c('Central United States').t`Central US`,
  },
  {
    name: 'ne1',
    label: t`North East`,
  },
  {
    name: 'useast1',
    label: c('Eastern United States').t`Eastern US`,
  },
  {
    name: 'mexico1',
    label: t`Mexico`,
  },
]

export const regionsBoundariesUrl = '/static/geometry/regions.topojson'

export const saveVersion = 2 // Next version should add +1 (must be a larger integer). When updating save version,
// also add to `migrations` below.

// `version` is the version you are migrating *from*.
export const migrations: { version: number; migrate: (configuration: any) => { configuration: any } }[] = [
  {
    version: 1,
    migrate: (configuration: any) => ({ ...configuration, customMode: false }),
  },
]
