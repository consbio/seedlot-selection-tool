import { GeoJSON } from 'geojson'
import { v4 as uuidv4 } from 'uuid'
import { ADD_CUSTOM_LAYER, REMOVE_CUSTOM_LAYER, TOGGLE_CUSTOM_LAYER, SET_CUSTOM_COLOR } from '../actions/customLayers'
import { LOAD_CONFIGURATION, RESET_CONFIGURATION } from '../actions/saves'

export interface CustomLayer {
  filename: string
  geoJSON: GeoJSON
  zIndex: number
  displayed: boolean
  color: string
  id: string
}

// Named colors used so screen readers can read them in ColorPicker
export const customLayerColors = ['CornflowerBlue', 'darkSlateBlue', 'mediumVioletRed', 'chocolate', 'orange']

const defaultLayer: CustomLayer = {
  filename: '',
  geoJSON: { type: 'Polygon', coordinates: [] },
  zIndex: 2,
  displayed: true,
  color: customLayerColors[0],
  id: '',
}

const getLeastUsedColor = (state: CustomLayer[]) => {
  const colorsCount = new Array(customLayerColors.length).fill(0)
  state.forEach(layer => {
    const colorIndex = customLayerColors.indexOf(layer.color)
    colorsCount[colorIndex] += 1
  })
  const indexMin = colorsCount.indexOf(Math.min(...colorsCount))
  return customLayerColors[indexMin]
}

export default (state: CustomLayer[] = [], action: any) => {
  switch (action.type) {
    case ADD_CUSTOM_LAYER:
      return [
        ...state,
        {
          ...defaultLayer,
          filename: ['.zip', '.shp'].some(ext => action.filename.endsWith(ext))
            ? action.filename.slice(0, -4)
            : action.filename,
          geoJSON: action.geoJSON,
          color: getLeastUsedColor(state),
          id: uuidv4(),
        },
      ]

    case REMOVE_CUSTOM_LAYER:
      return state.filter(layer => layer.id !== action.id)

    case TOGGLE_CUSTOM_LAYER:
      return state.map(layer => {
        if (layer.id === action.id) {
          return { ...layer, displayed: !layer.displayed }
        }
        return layer
      })

    case SET_CUSTOM_COLOR:
      return state.map(layer => {
        if (layer.id === action.id) {
          return { ...layer, color: action.color }
        }
        return layer
      })

    case RESET_CONFIGURATION:
      return []

    case LOAD_CONFIGURATION:
      if (action.configuration.customLayers) {
        return action.configuration.customLayers
      }
      return state

    default:
      return state
  }
}
