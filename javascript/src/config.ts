import { t, c } from 'ttag'
import baseConfig, { updateConfig } from './seedsource-ui/config'
import { get, urlEncode } from './seedsource-ui/io'
import SpeciesConstraint from './seedsource-ui/containers/SpeciesConstraint'
import Logo from '../images/logo.png'
import { receiveTransfer } from './seedsource-ui/actions/variables'

const serializeSpeciesConstraint = ({ climate }: { climate: any }, { species }: { species: string }) => {
  const { time, model } = climate.site
  let climateFragment

  if (time === '1961_1990' || time === '1981_2010') {
    climateFragment = `p${time}_800m`
  } else {
    climateFragment = `15gcm_${model}_${time}`
  }

  return {
    service: `${species}_${climateFragment}_pa`,
  }
}

const speciesConstraints = [
  ['pico', t`Lodgepole Pine`],
  ['pisi', t`Sitka Spruce`],
  ['psme', t`Douglas-fir`],
  ['pipo', t`Ponderosa Pine`],
  ['pien', t`Engelmann Spruce`],
]

export default () => {
  updateConfig({
    languages: {
      'en-us': 'English',
      'es-mx': 'Español',
    },
    apiRoot: '/sst/',
    logo: Logo as string,
    species: [
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
        label: t`Noble Fir`,
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
        label: t`Western hemlock`,
      },
      {
        name: 'tsme',
        label: t`Mountain hemlock`,
      },
    ],
    functions: [
      {
        name: 'HGT',
        label: t`Scaled Height`,
        // Tmin_sp is multiplied by 10, so we divide by 10 here to get the real value
        fn: 'math_e**(6.705 + (0.07443/10 * Tmin_sp))',
        transfer: 66,
        units: '',
        customTransfer: false,
        species: ['pico'],
      },
      {
        name: 'HT',
        label: t`Height`,
        // Tmin_sp is multiplied by 10, so we divide by 10 here to get the real value
        fn: '(2.80648/10 * Tmin_sp) + (0.03923*Eref) + (0.02529*PPT_sm) + 20.96417',
        transfer: 5.2,
        units: '',
        customTransfer: false,
        species: ['pien'],
      },
    ],
    defaultVariables: [
      {
        variable: 'MCMT',
        getValue: dispatch => dispatch(receiveTransfer('MCMT', 20, null, null)),
      },
      {
        variable: 'SHM',
        getValue: (dispatch, point, region) => {
          const url = `/arcgis/rest/services/${region}_1961_1990Y_SHM/MapServer/identify/?${urlEncode({
            f: 'json',
            tolerance: 2,
            imageDisplay: '1600,1031,96',
            geometryType: 'esriGeometryPoint',
            mapExtent: '0,0,0,0',
            geometry: JSON.stringify(point),
          })}`

          get(url)
            .then(response => response.json())
            .then(json => {
              const pixelValue = json.results[0].attributes['Pixel value']
              dispatch(receiveTransfer('SHM', pixelValue / 2, null, null))
            })
        },
      },
    ],
    constraints: {
      objects: {
        ...baseConfig.constraints.objects,
        ...Object.fromEntries(
          speciesConstraints.map(([species, label]) => [
            species,
            {
              component: SpeciesConstraint,
              values: { label, species },
              constraint: 'raster',
              serialize: serializeSpeciesConstraint,
            },
          ]),
        ),
      },
      categories: [
        ...baseConfig.constraints.categories,
        {
          name: 'species',
          label: t`Species Range`,
          type: 'category',
          items: speciesConstraints.map(([name, label]) => ({ name, label, type: 'constraint' })),
        },
      ],
    },
    layers: {
      ...baseConfig.layers,
      ...Object.fromEntries(
        speciesConstraints.map(([species, label]) => [
          `constraint-${species}`,
          {
            type: 'raster',
            label,
            show: () => true,
            url: ({ runConfiguration: { climate } }: any) =>
              `/tiles/${serializeSpeciesConstraint({ climate }, { species }).service}/{z}/{x}/{y}.png`,
            zIndex: 2,
          },
        ]),
      ),
      littles94: {
        type: 'vector',
        label: t`White spruce`,
        show: () => true,
        url: 'https://seedlotselectiontool.org/services/littles_s94/tiles/{z}/{x}/{y}.pbf',
        style: { littles_s94: { weight: 2, color: '#a6cee3', opacity: 0.6, fillOpacity: 0.3, fill: true } },
      },
      littles97: {
        type: 'vector',
        label: t`Red spruce`,
        show: () => true,
        url: 'https://seedlotselectiontool.org/services/littles_s97/tiles/{z}/{x}/{y}.pbf',
        style: { littles_s97: { weight: 2, color: '#1f78b4', opacity: 0.6, fillOpacity: 0.3, fill: true } },
      },
      littles105: {
        type: 'vector',
        label: t`Jack pine`,
        show: () => true,
        url: 'https://seedlotselectiontool.org/services/littles_s105/tiles/{z}/{x}/{y}.pbf',
        style: { littles_s105: { weight: 2, color: '#b2df8a', opacity: 0.6, fillOpacity: 0.3, fill: true } },
      },
      littles125: {
        type: 'vector',
        label: t`Red pine`,
        show: () => true,
        url: 'https://seedlotselectiontool.org/services/littles_s125/tiles/{z}/{x}/{y}.pbf',
        style: { littles_s125: { weight: 2, color: '#33a02c', opacity: 0.6, fillOpacity: 0.3, fill: true } },
      },
      littles129: {
        type: 'vector',
        label: t`Eastern white pine`,
        show: () => true,
        url: 'https://seedlotselectiontool.org/services/littles_s129/tiles/{z}/{x}/{y}.pbf',
        style: { littles_s129: { weight: 2, color: '#fb9a99', opacity: 0.6, fillOpacity: 0.3, fill: true } },
      },
      littles407: {
        type: 'vector',
        label: t`Shagbark hickory`,
        show: () => true,
        url: 'https://seedlotselectiontool.org/services/littles_s407/tiles/{z}/{x}/{y}.pbf',
        style: { littles_s407: { weight: 2, color: '#e31a1c', opacity: 0.6, fillOpacity: 0.3, fill: true } },
      },
      littles602: {
        type: 'vector',
        label: t`Black walnut`,
        show: () => true,
        url: 'https://seedlotselectiontool.org/services/littles_s602/tiles/{z}/{x}/{y}.pbf',
        style: { littles_s602: { weight: 2, color: '#fdbf6f', opacity: 0.6, fillOpacity: 0.3, fill: true } },
      },
      littles802: {
        type: 'vector',
        label: t`White oak`,
        show: () => true,
        url: 'https://seedlotselectiontool.org/services/littles_s802/tiles/{z}/{x}/{y}.pbf',
        style: { littles_s802: { weight: 2, color: '#ff7f00', opacity: 0.6, fillOpacity: 0.3, fill: true } },
      },
      littles804: {
        type: 'vector',
        label: t`Swamp white oak`,
        show: () => true,
        url: 'https://seedlotselectiontool.org/services/littles_s804/tiles/{z}/{x}/{y}.pbf',
        style: { littles_s804: { weight: 2, color: '#cab2d6', opacity: 0.6, fillOpacity: 0.3, fill: true } },
      },
      littles812: {
        type: 'vector',
        label: t`Southern red oak`,
        show: () => true,
        url: 'https://seedlotselectiontool.org/services/littles_s812/tiles/{z}/{x}/{y}.pbf',
        style: { littles_s812: { weight: 2, color: '#6a3d9a', opacity: 0.6, fillOpacity: 0.3, fill: true } },
      },
      littles833: {
        type: 'vector',
        label: t`Northern red oak`,
        show: () => true,
        url: 'https://seedlotselectiontool.org/services/littles_s833/tiles/{z}/{x}/{y}.pbf',
        style: { littles_s833: { weight: 2, color: '#b15928', opacity: 0.6, fillOpacity: 0.3, fill: true } },
      },
    },
    layerCategories: [
      ...baseConfig.layerCategories,
      {
        label: t`Constraints`,
        show: () => true,
        layers: speciesConstraints.map(([species]) => `constraint-${species}`),
      },
      {
        label: c('"Little" is a proper noun').t`Little's Range Maps`,
        show: () => true,
        layers: [
          'littles94',
          'littles97',
          'littles105',
          'littles125',
          'littles129',
          'littles407',
          'littles602',
          'littles802',
          'littles804',
          'littles812',
          'littles833',
        ],
      },
    ],
  })
}
