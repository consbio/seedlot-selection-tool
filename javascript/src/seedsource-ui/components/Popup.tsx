import React from 'react'
import { getZoneLabel } from '../utils'
import L from 'leaflet'
import { c, t } from 'ttag'
import ReactDOM from 'react-dom'
import config, { variables as allVariables } from '../config'
import * as io from '../io'

type PopupProps = {
  mode: string
  point: { x: number; y: number }
  map: any
  unit: string
  onSave: (x: number, y: number) => void
  onClose: () => void
}

type PopupState = {
  popup: null | L.Popup
  content: HTMLElement
  elevation: number
  values: []
  zones: []
  region: any
}

class Popup extends React.Component<PopupProps, PopupState> {
  constructor(props: PopupProps) {
    super(props)
    this.state = {
      popup: null,
      content: document.createElement('div'),
      elevation: 0,
      values: [],
      zones: [],
      region: null,
    }
  }

  updateData() {
    const { point } = this.props
    const pointIsValid = point !== null && point.x && point.y
    if (pointIsValid) {
      this.setState({ region: null, zones: [], elevation: 0 })

      // Update popup regions
      const regionUrl = `${config.apiRoot}regions/?${io.urlEncode({
        point: `${point.x},${point.y}`,
      })}`

      io.get(regionUrl)
        .then(response => response.json())
        .then(json => {
          const { results } = json
          const validRegions = results.map((region: any) => region.name)

          const region = validRegions.length ? validRegions[0] : null
          this.setState({ region })
          return region
        })
        .then(region => {
          if (region !== null) {
            // Set elevation at point
            const url = `/arcgis/rest/services/${region}_dem/MapServer/identify/?${io.urlEncode({
              f: 'json',
              tolerance: '2',
              imageDisplay: '1600,1031,96',
              geometryType: 'esriGeometryPoint',
              mapExtent: '0,0,0,0',
              geometry: JSON.stringify({ x: point.x, y: point.y }),
            })}`

            io.get(url)
              .then(response => response.json())
              .then(json => {
                const { results } = json
                let value = null

                if (results.length) {
                  value = results[0].attributes['Pixel value']
                }

                if (Number.isNaN(value)) {
                  value = null
                }

                this.setState({ elevation: value })
              })

            /* // Set values at point
            const requests = fetchValues(store, state, io, dispatch, previousState, region)
            if (requests) {
              requests.forEach((request: any) => {
                dispatch(requestPopupValue(request.item.name))
                request.promise
                  .then((json: any) => this.setState({values: })dispatch(receivePopupValue(request.item.name, json)))
              })
            } */

            // Find seedzones at point
            const zonesUrl = `${config.apiRoot}seedzones/?${io.urlEncode({ point: `${point.x},${point.y}` })}`

            io.get(zonesUrl)
              .then(response => response.json())
              .then((json: any) => {
                const zones = json.results.map((zone: any) => ({
                  id: zone.zone_uid,
                  name: zone.name,
                  elevation_band: zone.elevation_band,
                }))
                this.setState({
                  zones,
                })
              })
          }
        })
    }
  }

  componentDidMount() {
    this.props.map.on('popupclose', () => {
      this.props.onClose ? this.props.onClose() : ''
    })
    this.setState({
      popup: L.popup({ closeOnClick: false }).setLatLng([this.props.point.y, this.props.point.x]).addTo(this.props.map),
    })
    this.updateData()
  }

  componentDidUpdate(prevProps: Readonly<PopupProps>) {
    if (this.props.point.x !== prevProps.point.x || this.props.point.y !== prevProps.point.y) {
      this.updateData()
    }
  }

  componentWillUnmount() {
    this.props.map.closePopup(this.state.popup)
    this.setState({ popup: null })
  }

  render() {
    setTimeout(() => {
      if (this.state.popup) {
        const { point, unit, mode, onSave, onClose, map } = this.props
        const { elevation, values, zones } = this.state
        this.state.popup.setLatLng([point.y, point.x])
        ReactDOM.render(
          <>
            <div className="map-info-popup">
              <div className="columns is-mobile">
                <div className="column">
                  <div>{t`Location`}</div>
                  <div className="has-text-weight-bold">
                    {point.y.toFixed(2)}, {point.x.toFixed(2)}
                  </div>
                </div>
                <div className="column">
                  <div>{t`Elevation`}</div>
                  <div className="has-text-weight-bold">
                    {`${Math.round(elevation / 0.3048)} ${c("Abbreviation of 'feet' (measurement)")
                      .t`ft`} (${Math.round(elevation)} ${c("Abbreviation of 'meters'").t`m`})`}
                  </div>
                </div>
              </div>

              {!!values.length && (
                <>
                  <h6 className="title is-6">{t`Climate`}</h6>
                  <table>
                    <tbody>
                      {values.map((item: any) => {
                        const variableConfig = allVariables.find(variable => variable.name === item.name)
                        const { multiplier, units }: { multiplier: number; units: any } = variableConfig!
                        let value: string | number = c('i.e., Not Applicable').t`N/A`
                        let unitLabel = units.metric.label

                        if (item.value !== null) {
                          value = item.value / multiplier

                          let { precision } = units.metric
                          if (unit === 'imperial') {
                            precision = units.imperial.precision
                            unitLabel = units.imperial.label
                            value = units.imperial.convert(value)
                          }

                          value = (value as number).toFixed(precision)
                        }

                        return (
                          <tr key={item.name}>
                            <td>{item.name}</td>
                            <td className="has-text-weight-bold">
                              {value} {unitLabel}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </>
              )}

              {!!zones.length && (
                <>
                  <h6 className="title is-6">{t`Available Zones`}</h6>
                  <ul className="popup-zones">
                    {zones.map((item: any) => (
                      <li key={item.id}>{getZoneLabel(item)}</li>
                    ))}
                  </ul>
                </>
              )}

              <button
                type="button"
                className="button is-primary is-fullwidth"
                onClick={() => {
                  onSave(point.x, point.y)
                  onClose()
                }}
              >
                {mode === 'add_sites' ? t`Add Location` : t`Set Point`}
              </button>
            </div>
          </>,
          this.state.content,
        )
        this.state.popup.setContent(this.state.content)
      }
    }, 1)

    return <></>
  }
}

export default Popup
