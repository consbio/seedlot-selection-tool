import resync from '../resync'
import { requestLayersLegend, receiveLayersLegend, resetLegends } from '../actions/legends'
import config from '../config'

// Possibly add: `legends`
const layerLegendSelect = ({ layers, runConfiguration, job }: any) => {
  const { objective, climate, region } = runConfiguration
  const { serviceId } = job

  // Possibly add: `hasLegend: legends.results.legend !== null`
  return {
    layers,
    objective,
    climate,
    region,
    serviceId,
  }
}

export default (store: any) => {
  // Layers legend
  resync(store, layerLegendSelect, ({ layers }, io, dispatch) => {
    if (layers.length) {
      dispatch(resetLegends())
      layers
        .filter((layer: any) => config.layers[layer].type !== 'vector')
        .forEach((layer: string) => {
          dispatch(requestLayersLegend())
          const { legendUrl } = config.layers[layer]
          let url
          switch (typeof legendUrl) {
            case 'undefined':
              return
            default:
              url = legendUrl(store.getState())
          }

          return io
            .get(url)
            .then(response => response.json())
            .then(json => {
              dispatch(receiveLayersLegend(json))
            })
        })
    }
  })
}
