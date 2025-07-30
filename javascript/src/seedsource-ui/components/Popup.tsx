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
  elevation: number | null
  variables: VariableData[]
  queryingData: boolean
  zones: any[]
  region: any
}

class Popup extends React.Component<PopupProps, PopupState> {
  popup: L.Popup
  content: HTMLElement
  runningZoneQueries: number
  runningVariableQueries: number
  mounted: boolean = false

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
      queryingData: false,
    }
  }

  async getUpdatedVariables(selectedVariables: any, variableData: VariableData[]) {
    const { point, objective, region, climate } = this.props

    if (region) {
      // Fetch Selected Variable Values at point
      const requests = fetchVariables(selectedVariables, objective, climate, region, point)
      if (requests) {
        const resolvedPromises = await Promise.all(requests.map(req => req.promise))

        let newVariables = [...variableData]

        for (let i = 0; i < resolvedPromises.length; i++) {
          const name = requests[i].item.name
          const value = resolvedPromises[i].results[0]['attributes']['Pixel value']
          const index = newVariables.findIndex((item: any) => item.name === name)
          if (index === -1) {
            newVariables.push({ name, value })
          } else {
            newVariables = newVariables.slice(0, index).concat([{ name, value }, ...newVariables.slice(index + 1)])
          }
        }
        return newVariables
      }
    } else {
      return selectedVariables.map((item: any) => {
        return { name: item.name, value: null }
      })
    }
  }

  async updateData() {
    const { point, selectedVariables } = this.props
    const { variables } = this.state
    const pointIsValid = point !== null && point.x && point.y
    if (pointIsValid) {
      this.setState({ region: null, zones: [], elevation: null, variables: [], queryingData: true })

      try {
        let region: string | null = null
        let zones: any[] = []
        let elevation: number | null = null
        let newVariables = []

        // Update popup regions
        const regionUrl = `${config.apiRoot}regions/?${io.urlEncode({
          point: `${point.x},${point.y}`,
        })}`

        const regionResponse = await (await io.get(regionUrl)).json()
        const validRegions = regionResponse.results.map((region: any) => region.name)

        region = validRegions.length ? validRegions[0] : null

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

          const elevationReponse = await (await io.get(url)).json()

          if (elevationReponse.results.length) {
            elevation = elevationReponse.results[0].attributes['Pixel value']
          }

          if (Number.isNaN(elevation)) {
            elevation = null
          }

          newVariables = await this.getUpdatedVariables(selectedVariables, variables)

          // Find seedzones at point
          const zonesUrl = `${config.apiRoot}seedzones/?${io.urlEncode({ point: `${point.x},${point.y}` })}`

          const zoneResponse = await (await io.get(zonesUrl)).json()

          zones = zoneResponse.results.map((zone: any) => ({
            id: zone.zone_uid,
            name: zone.name,
            elevation_band: zone.elevation_band,
          }))
        }

        if (JSON.stringify(point) === JSON.stringify(this.props.point) && this.mounted) {
          this.setState({ region, elevation, zones, variables: newVariables })
        }
      } finally {
        if (this.mounted) this.setState({ queryingData: false })
      }
    }
  }

  componentDidMount() {
    this.props.map.on('popupclose', () => {
      this.props.onClose ? this.props.onClose() : ''
    })
    this.mounted = true
    this.updateData()
  }

  componentDidUpdate(prevProps: Readonly<PopupProps>) {
    if (JSON.stringify(prevProps.point) !== JSON.stringify(this.props.point)) {
      this.updateData()
    } else if (JSON.stringify(prevProps.selectedVariables) !== JSON.stringify(this.props.selectedVariables)) {
      this.getUpdatedVariables(this.props.selectedVariables, []).then(variables => {
        if (this.mounted) this.setState({ variables })
      })
    }
  }

  componentWillUnmount() {
    this.mounted = false
    this.props.map.closePopup(this.popup)
  }

  render() {
    setTimeout(() => {
      const { point, unit, mode, onSave, onClose, map } = this.props
      const { elevation, variables, zones, queryingData } = this.state
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

              {!queryingData && elevation ? (
                <div className="column">
                  <div>{t`Elevation`}</div>
                  <div className="has-text-weight-bold">
                    {elevation &&
                      `${Math.round(elevation / 0.3048)} ${c("Abbreviation of 'feet' (measurement)")
                        .t`ft`} (${Math.round(elevation)} ${c("Abbreviation of 'meters'").t`m`})`}
                  </div>
                </div>
              ) : (
                <div className="column" style={{ alignSelf: 'center' }}>
                  Loading...
                </div>
              )}
            </div>

            {!!variables.length && !queryingData && (
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

            {!!zones.length && !queryingData && (
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
