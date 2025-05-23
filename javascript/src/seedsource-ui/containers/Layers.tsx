import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { t } from 'ttag'
import config, { LayerConfig } from '../config'
import { toggleLayer } from '../actions/layers'
import ShapefileUpload from './ShapefileUpload'
import { CustomLayer } from '../reducers/customLayers'
import CustomLayerListItem from './CustomLayerListItem'

type LayersProps = {
  layers: string[]
  customLayers: CustomLayer[]
  state: any

  onToggleLayer: (namne: string) => void
}

const Layers = ({ layers, customLayers, state, onToggleLayer }: LayersProps) => {
  const { layers: layersConfig, layerCategories } = config

  const [expanded, setExpanded] = useState<string[]>([])
  const [showColorPicker, setShowColorPicker] = useState<string>('')

  useEffect(() => {
    if (!expanded.length) {
      setExpanded([...layerCategories.filter(c => c.showByDefault === true).map(c => c.label), 'custom'])
    }
  }, [expanded, layerCategories])

  const customExpanded = expanded.includes('custom')

  return (
    <div className="layers-tab">
      <div className="menu">
        <ul className="menu-list">
          {layerCategories
            .filter(c => c.show(state))
            .map(c => {
              const isExpanded = expanded.includes(c.label)
              const status = c.show(state)

              return (
                <li key={c.label}>
                  <a
                    onClick={() => {
                      if (isExpanded) {
                        setExpanded(expanded.filter(e => e !== c.label))
                      } else {
                        setExpanded([...expanded, c.label])
                      }
                    }}
                  >
                    <h4 className="title">
                      {isExpanded ? (
                        <span className="icon-chevron-bottom-12" />
                      ) : (
                        <span className="icon-chevron-top-12" />
                      )}
                      &nbsp; {c.label}
                    </h4>
                  </a>

                  {isExpanded && (
                    <ul>
                      {status !== true && <span>{status}</span>}
                      {status === true &&
                        c.layers
                          .map((l): [string, LayerConfig] => [l, layersConfig[l]])
                          .filter(([, l]) => l.show(state))
                          .map(([key, l]) => (
                            <li className="layer-list" key={key}>
                              <input
                                className="is-checkradio"
                                type="checkbox"
                                value={key}
                                checked={layers.includes(key)}
                                readOnly
                              />
                              <label onClick={() => onToggleLayer(key)}>{l.label}</label>
                            </li>
                          ))}
                    </ul>
                  )}
                </li>
              )
            })}

          <li>
            <a
              onClick={() => {
                if (customExpanded) {
                  setExpanded(expanded.filter(e => e !== 'custom'))
                } else {
                  setExpanded([...expanded, 'custom'])
                }
              }}
            >
              <h4 className="title">
                {customExpanded ? (
                  <span className="icon-chevron-bottom-12" />
                ) : (
                  <span className="icon-chevron-top-12" />
                )}
                &nbsp; {t`Custom`}
              </h4>
            </a>
            {customExpanded && (
              <ul>
                <div className="layer-list" key="shapeUpload">
                  <ShapefileUpload storeTo="customLayers">
                    <div className="is-clickable" tabIndex={0} role="button">
                      <div
                        style={{
                          display: 'inline-block',
                          height: '25px',
                          width: '25px',
                          padding: '1px 0 0px 6px',
                          borderRadius: '100%',
                          border: '1px solid #505050',
                          marginRight: '10px',
                        }}
                      >
                        +
                      </div>
                      {t`Upload a shapefile`}
                    </div>
                  </ShapefileUpload>
                </div>

                {customLayers.map(layer => (
                  <CustomLayerListItem
                    layer={layer}
                    key={`${layer.id}`}
                    showColorPicker={showColorPicker === layer.id}
                    toggleColorPicker={layerId => {
                      if (showColorPicker === layerId) {
                        return setShowColorPicker('')
                      }
                      setShowColorPicker(layerId)
                    }}
                  />
                ))}
              </ul>
            )}
          </li>
        </ul>
      </div>
    </div>
  )
}

export default connect(
  (state: any) => {
    const { layers, customLayers } = state

    return { state, layers, customLayers }
  },
  (dispatch: (action: any) => any) => {
    return {
      onToggleLayer: (name: string) => {
        dispatch(toggleLayer(name))
      },
    }
  },
)(Layers)
