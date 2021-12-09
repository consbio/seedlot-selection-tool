import { t } from 'ttag'
import baseConfig, { updateConfig } from 'seedsource-ui/lib/config'
import { get, urlEncode } from 'seedsource-ui/lib/io'
import SpeciesConstraint from 'seedsource-ui/lib/containers/SpeciesConstraint'
import Logo from 'seedsource-ui/images/logo.png'
import { receiveTransfer } from 'seedsource-ui/lib/actions/variables'

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

export default () => {
  updateConfig({
    languages: {
      en: 'English',
      es: 'Español',
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
        name: 'HT',
        label: 'Height',
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
      objects: Object.assign(baseConfig.constraints.objects, {
        pico: {
          component: SpeciesConstraint,
          values: {
            label: t`Lodgepole Pine`,
            species: 'pico',
          },
          constraint: 'raster',
          serialize: serializeSpeciesConstraint,
        },
        pisi: {
          component: SpeciesConstraint,
          values: {
            label: t`Sitka Spruce`,
            species: 'pisi',
          },
          constraint: 'raster',
          serialize: serializeSpeciesConstraint,
        },
        psme: {
          component: SpeciesConstraint,
          values: {
            label: t`Douglas-fir`,
            species: 'psme',
          },
          constraint: 'raster',
          serialize: serializeSpeciesConstraint,
        },
        pipo: {
          component: SpeciesConstraint,
          values: {
            label: t`Ponderosa Pine`,
            species: 'pipo',
          },
          constraint: 'raster',
          serialize: serializeSpeciesConstraint,
        },
        pien: {
          component: SpeciesConstraint,
          values: {
            label: t`Engelmann Spruce`,
            species: 'pien',
          },
          constraint: 'raster',
          serialize: serializeSpeciesConstraint,
        },
      }),
      categories: [
        ...baseConfig.constraints.categories,
        {
          name: 'species',
          label: t`Species Range`,
          type: 'category',
          items: [
            {
              name: 'pico',
              label: t`Lodgepole Pine`,
              type: 'constraint',
            },
            {
              name: 'pisi',
              label: t`Sitka Spruce`,
              type: 'constraint',
            },
            {
              name: 'psme',
              label: t`Douglas-fir`,
              type: 'constraint',
            },
            {
              name: 'pipo',
              label: t`Ponderosa Pine`,
              type: 'constraint',
            },
            {
              name: 'pien',
              label: t`Engelmann Spruce`,
              type: 'constraint',
            },
          ],
        },
      ],
    },
  })
}
