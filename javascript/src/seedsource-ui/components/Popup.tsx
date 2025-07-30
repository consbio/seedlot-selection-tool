import React from 'react'
import { fetchVariables, getZoneLabel } from '../utils'
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
  selectedVariables: any
  objective: any
  climate: any
  region: any
  onSave: (x: number, y: number) => void
  onClose: () => void
}

type VariableData = {
  name: string
  value: number | null
}

type PopupState = {
  elevation: number
  variables: VariableData[]
  queryingVariables: boolean
  zones: []
  queryingZones: boolean
  region: any
}

class Popup extends React.Component<PopupProps, PopupState> {
  popup: L.Popup
  content: HTMLElement
  runningZoneQueries: number
  runningVariableQueries: number

  constructor(props: PopupProps) {
    super(props)

    this.popup = L.popup({ closeOnClick: false })
      .setLatLng([this.props.point.y, this.props.point.x])
      .addTo(this.props.map)

    this.content = document.createElement('div')

    this.runningZoneQueries = 0
    this.runningVariableQueries = 0

    this.state = {
      elevation: 0,
      variables: [],
      zones: [],
      region: null,
      queryingVariables: false,
      queryingZones: false,
    }
  }

  updateValue = (name: string, value: number | null) => {
    const { variables } = this.state
    const index = variables.findIndex((item: any) => item.name === name)

    let newVariables = [...variables]
    if (index === -1) {
      newVariables.push({ name, value })
    } else {
      newVariables = variables.slice(0, index).concat([{ name, value }, ...variables.slice(index + 1)])
    }

    this.setState({ variables: newVariables })
  }

  updateVariables = (selectedVariables: any) => {
    const { point, objective, region, climate } = this.props

    if (region) {
      // Fetch Selected Variable Values at point
      const requests = fetchVariables(selectedVariables, objective, climate, region, point)
      if (requests) {
        requests.forEach(request => {
          this.setState({ queryingVariables: true })
          this.runningVariableQueries += 1
          request.promise
            .then(json => {
              if (JSON.stringify(point) === JSON.stringify(this.props.point)) {
                this.updateValue(request.item.name as string, json.results[0]['attributes']['Pixel value'])
              }
            })
            .catch(() => {})
            .finally(() => {
              this.runningVariableQueries -= 1
              if (this.runningVariableQueries < 1) {
                this.setState({ queryingVariables: false })
              }
            })
        })
      }
    } else {
      this.setState({
        variables: selectedVariables.map((item: any) => {
          return { name: item.name, value: null }
        }),
      })
    }
  }

  updateData() {
    const { point, selectedVariables } = this.props
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
          if (JSON.stringify(point) === JSON.stringify(this.props.point)) {
            this.setState({ region })
          }
          return region
        })
        .then(regionName => {
          if (regionName !== null) {
            // Set elevation at point
            const url = `/arcgis/rest/services/${regionName}_dem/MapServer/identify/?${io.urlEncode({
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
                if (JSON.stringify(point) === JSON.stringify(this.props.point)) {
                  this.setState({ elevation: value })
                }
              })

            this.updateVariables(selectedVariables)

            // Find seedzones at point
            const zonesUrl = `${config.apiRoot}seedzones/?${io.urlEncode({ point: `${point.x},${point.y}` })}`

            this.setState({ queryingZones: true })
            this.runningZoneQueries += 1

            io.get(zonesUrl)
              .then(response => response.json())
              .then((json: any) => {
                const zones = json.results.map((zone: any) => ({
                  id: zone.zone_uid,
                  name: zone.name,
                  elevation_band: zone.elevation_band,
                }))
                if (JSON.stringify(point) === JSON.stringify(this.props.point)) {
                  this.setState({
                    zones,
                  })
                }
              })
              .finally(() => {
                this.runningZoneQueries -= 1
                if (this.runningZoneQueries < 1) {
                  this.setState({ queryingZones: false })
                }
              })
          }
        })
    }
  }

  componentDidMount() {
    this.props.map.on('popupclose', () => {
      this.props.onClose ? this.props.onClose() : ''
    })
    this.updateData()
  }

  componentDidUpdate(prevProps: Readonly<PopupProps>) {
    if (JSON.stringify(prevProps.point) !== JSON.stringify(this.props.point)) {
      this.updateData()
    } else if (JSON.stringify(prevProps.selectedVariables) !== JSON.stringify(this.props.selectedVariables)) {
      this.setState({ variables: [] })
      this.updateVariables(this.props.selectedVariables)
    }
  }

  componentWillUnmount() {
    this.props.map.closePopup(this.popup)
  }

  render() {
    setTimeout(() => {
      const { point, unit, mode, onSave, onClose, map } = this.props
      const { elevation, variables, zones, queryingVariables, queryingZones } = this.state
      this.popup.setLatLng([point.y, point.x])
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
                  {`${Math.round(elevation / 0.3048)} ${c("Abbreviation of 'feet' (measurement)").t`ft`} (${Math.round(
                    elevation,
                  )} ${c("Abbreviation of 'meters'").t`m`})`}
                </div>
              </div>
            </div>

            {!!variables.length && !queryingVariables && (
              <>
                <h6 className="title is-6">{t`Climate`}</h6>
                <table>
                  <tbody>
                    {variables.map(item => {
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

            {!!zones.length && !queryingZones && (
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
        this.content,
      )
      this.popup.setContent(this.content)
    }, 1)

    return <></>
  }
}

export default Popup
