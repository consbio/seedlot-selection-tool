import baseConfig, { updateConfig } from 'seedsource-ui/lib/config'
import SpeciesConstraint from 'seedsource-ui/lib/containers/SpeciesConstraint'
import Logo from 'seedsource-ui/images/logo.png'

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
    apiRoot: '/sst/',
    logo: Logo as string,
    species: [
      {
        name: 'psme',
        label: 'Douglas-fir',
      },
      {
        name: 'pico',
        label: 'Lodgepole pine',
      },
      {
        name: 'piba',
        label: 'Jack pine',
      },
      {
        name: 'pipo',
        label: 'Ponderosa pine',
      },
      {
        name: 'pima',
        label: 'Black spruce',
      },
      {
        name: 'thpl',
        label: 'Western red cedar',
      },
      {
        name: 'pimo',
        label: 'Western white pine',
      },
      {
        name: 'abam',
        label: 'Pacific silver fir',
      },
      {
        name: 'abco',
        label: 'White fir',
      },
      {
        name: 'abgr',
        label: 'Grand fir',
      },
      {
        name: 'abpr',
        label: 'Noble Fir',
      },
      {
        name: 'absh',
        label: 'Shasta red fir',
      },
      {
        name: 'alru2',
        label: 'Red alder',
      },
      {
        name: 'cade27',
        label: 'Incense cedar',
      },
      {
        name: 'chla',
        label: 'Port orford cedar',
      },
      {
        name: 'chno',
        label: 'Alaska yellow cedar',
      },
      {
        name: 'laoc',
        label: 'Western larch',
      },
      {
        name: 'pial',
        label: 'Whitebark pine',
      },
      {
        name: 'pien',
        label: 'Engelmann spruce',
      },
      {
        name: 'pije',
        label: 'Jeffrey pine',
      },
      {
        name: 'pila',
        label: 'Sugar pine',
      },
      {
        name: 'tabr2',
        label: 'Pacific yew',
      },
      {
        name: 'tshe',
        label: 'Western hemlock',
      },
      {
        name: 'tsme',
        label: 'Mountain hemlock',
      },
    ],
    constraints: {
      objects: Object.assign(baseConfig.constraints.objects, {
        pico: {
          component: SpeciesConstraint,
          values: {
            label: 'Lodgepole Pine',
            species: 'pico',
          },
          constraint: 'raster',
          serialize: serializeSpeciesConstraint,
        },
        pisi: {
          component: SpeciesConstraint,
          values: {
            label: 'Sitka Spruce',
            species: 'pisi',
          },
          constraint: 'raster',
          serialize: serializeSpeciesConstraint,
        },
        psme: {
          component: SpeciesConstraint,
          values: {
            label: 'Douglas-fir',
            species: 'psme',
          },
          constraint: 'raster',
          serialize: serializeSpeciesConstraint,
        },
        pipo: {
          component: SpeciesConstraint,
          values: {
            label: 'Ponderosa Pine',
            species: 'pipo',
          },
          constraint: 'raster',
          serialize: serializeSpeciesConstraint,
        },
        pien: {
          component: SpeciesConstraint,
          values: {
            label: 'Engelmann Spruce',
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
          label: 'Species Range',
          type: 'category',
          items: [
            {
              name: 'pico',
              label: 'Lodgepole Pine',
              type: 'constraint',
            },
            {
              name: 'pisi',
              label: 'Sitka Spruce',
              type: 'constraint',
            },
            {
              name: 'psme',
              label: 'Douglas-fir',
              type: 'constraint',
            },
            {
              name: 'pipo',
              label: 'Ponderosa Pine',
              type: 'constraint',
            },
            {
              name: 'pien',
              label: 'Engelmann Spruce',
              type: 'constraint',
            },
          ],
        },
      ],
    },
  })
}
