import React from 'react'
import { t } from 'ttag'
import { connect } from 'react-redux'
import ColorPicker from './ColorPicker'
import { toggleCustomLayer, removeCustomLayer, setCustomColor } from '../actions/customLayers'
import { CustomLayer, customLayerColors } from '../reducers/customLayers'

interface CustomLayerListItemProps {
  layer: CustomLayer
  onToggleCustomLayer: (id: string) => any
  onRemoveCustomLayer: (id: string) => any
  onSetCustomColor: (id: string, color: string) => any
  showColorPicker: boolean
  toggleColorPicker: (id: string) => void
}

const CustomLayerListItem = ({
  layer,
  onToggleCustomLayer,
  onRemoveCustomLayer,
  onSetCustomColor,
  showColorPicker,
  toggleColorPicker,
}: CustomLayerListItemProps) => {
  return (
    <li className="layer-list" style={{ marginTop: '10px' }}>
      <div
        tabIndex={0}
        role="button"
        aria-label={t`Button to pick a new color for the custom layer.`}
        onClick={() => toggleColorPicker(layer.id)}
        onKeyPress={event => {
          if (event.key === 'Enter') {
            toggleColorPicker(layer.id)
          }
        }}
        className="is-clickable"
        style={{
          float: 'left',
          height: '20px',
          width: '20px',
          borderRadius: '100%',
          background: layer.color,
          marginRight: '12px',
        }}
      />
      <input
        className="is-checkradio"
        type="checkbox"
        aria-label={t`Checkbox to show or hide custom layer on map.`}
        value={layer.filename}
        checked={layer.displayed}
        readOnly
      />
      <label onClick={() => onToggleCustomLayer(layer.id)}>{layer.filename}</label>
      <div
        tabIndex={0}
        role="button"
        aria-label={t`Button to delete custom layer."`}
        className="delete"
        style={{
          display: 'inline-block',
          borderRadius: '100%',
          background: 'rgba(10, 10, 10, 0.2)',
          float: 'right',
        }}
        onClick={() => {
          onRemoveCustomLayer(layer.id)
        }}
        onKeyPress={event => {
          if (event.key === 'Enter') onRemoveCustomLayer(layer.id)
        }}
      />
      {showColorPicker ? (
        <ColorPicker
          colors={customLayerColors}
          onPick={(color: string) => {
            onSetCustomColor(layer.id, color)
          }}
        />
      ) : null}
    </li>
  )
}

export default connect(null, (dispatch: (action: any) => any) => {
  return {
    onToggleCustomLayer: (id: string) => {
      dispatch(toggleCustomLayer(id))
    },
    onRemoveCustomLayer: (id: string) => {
      dispatch(removeCustomLayer(id))
    },
    onSetCustomColor: (id: string, color: string) => {
      dispatch(setCustomColor(id, color))
    },
  }
})(CustomLayerListItem)
