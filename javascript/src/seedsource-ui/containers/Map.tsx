/**
 * This component ensures that the Leaflet map state reflects the redux application state, and dispatches map-related
 * events via redux.
 */

import React from 'react'
import ReactDOM from 'react-dom'
import { connect, ConnectedProps } from 'react-redux'
import L, { LeafletMouseEvent, Popup } from 'leaflet'
import { topojson } from 'leaflet-omnivore'
import { Lethargy } from 'lethargy'
import 'leaflet-basemaps'
import 'leaflet-geonames/L.Control.Geonames'
import 'leaflet-zoombox/L.Control.ZoomBox'
import 'leaflet-range/L.Control.Range'
import { t, c } from 'ttag'

import * as io from '../io'
import { isClose, getZoneLabel } from '../utils'
import config, { variables as allVariables, timeLabels, regions, regionsBoundariesUrl } from '../config'
import { setMapOpacity, setBasemap, setZoom, setMapCenter, setMapMode } from '../actions/map'
import { toggleLayer } from '../actions/layers'
import { setPopupLocation, resetPopupLocation } from '../actions/popup'
import { setPoint, addUserSite } from '../actions/point'
import { LegendControl, ButtonControl } from '../leaflet-controls'

import 'leaflet.vectorgrid'
import { GeoJSON } from 'geojson'
import { CustomLayer } from '../reducers/customLayers'

type PopupInfo = {
  popup: Popup
  point: { x: number; y: number }
  content: HTMLElement
}

const iconRetinaUrl = require('leaflet/dist/images/marker-icon-2x.png')
const iconUrl = require('leaflet/dist/images/marker-icon.png')
const shadowUrl = require('leaflet/dist/images/marker-shadow.png')

/* This is a workaround for a webpack-leaflet incompatibility (https://github.com/PaulLeCam/react-leaflet/issues/255)w */
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
})

const connector = connect(
  (state: any) => {
    const { runConfiguration, map, job, legends, popup, lastRun, layers, customLayers } = state
    const { opacity, center, zoom, mode } = map
    const {
      objective,
      point,
      climate,
      unit,
      method,
      zones,
      region,
      regionMethod,
      constraints,
      userSites,
      activeUserSite,
    } = runConfiguration
    const { geometry, selected: zone, matched } = zones
    const resultRegion = lastRun ? lastRun.region : null
    const shapefileConstraints = constraints.filter((item: any) => item.type === 'shapefile')

    const zoneConfig = matched.find((item: any) => item.zone_uid === zone)

    return {
      objective,
      point,
      climate,
      opacity,
      job,
      legends,
      popup,
      unit,
      method,
      geometry,
      zone,
      zoneConfig,
      center,
      zoom,
      region,
      regionMethod,
      resultRegion,
      shapefileConstraints,
      layers,
      customLayers,
      userSites,
      activeUserSite,
      mode,
      state,
    }
  },
  dispatch => {
    return {
      onBasemapChange: (basemap: string) => {
        dispatch(setBasemap(basemap))
      },

      onZoomChange: (zoom: number) => {
        dispatch(setZoom(zoom))
      },

      onOpacityChange: (opacity: number) => {
        dispatch(setMapOpacity(opacity))
      },

      onMapClick: (lat: number, lon: number) => {
        dispatch(setPoint(lat, lon))
      },

      onAddSite: (lat: number, lon: number, label: string) => {
        dispatch(addUserSite({ lat, lon }, label))
        dispatch(setMapMode('normal'))
      },

      onPopupLocation: (lat: number, lon: number) => {
        dispatch(setPopupLocation(lat, lon))
      },

      onPopupClose: () => {
        // Dispatching this event immediately causes state warnings
        setTimeout(() => dispatch(resetPopupLocation()), 1)
      },

      onToggleVisibility: () => {
        dispatch(toggleLayer('results'))
      },

      onMapMove: (center: { lat: number; lng: number }) => {
        dispatch(setMapCenter([center.lat, center.lng]))
      },
    }
  },
)

type MapProps = ConnectedProps<typeof connector> & {
  simple?: boolean
}

class Map extends React.Component<MapProps> {
  map: any

  mapNode: HTMLElement | null

  regionsBoundaries: any

  clickedRegion: any

  showPreview: boolean

  resultRegion: any

  pointMarker: any

  legend: any

  zoneLayer: any

  zoneElevationLayer: any

  zoneElevationService: any

  currentZone: any

  opacityControl: any

  visibilityButton: any

  boundaryName: any

  popup: PopupInfo | null

  mapIsMoving: boolean

  shpLayers: L.GeoJSON[]

  shpData: GeoJSON[]

  displayedRasterLayers: any[]

  displayedVectorLayers: any[]

  userSitesLayer: any

  simple: boolean

  static defaultProps = {
    simple: false,
  }

  constructor(props: MapProps) {
    super(props)

    this.map = null
    this.mapNode = null
    this.regionsBoundaries = null
    this.clickedRegion = null
    this.showPreview = false
    this.resultRegion = props.resultRegion
    this.pointMarker = null
    this.legend = null
    this.zoneLayer = null
    this.zoneElevationLayer = null
    this.zoneElevationService = null
    this.currentZone = null
    this.opacityControl = null
    this.visibilityButton = null
    this.boundaryName = null
    this.popup = null
    this.mapIsMoving = false
    this.shpLayers = []
    this.shpData = []
    this.displayedRasterLayers = []
    this.displayedVectorLayers = []
    this.userSitesLayer = null
    this.simple = props.simple!
  }

  // Initial map setup
  componentDidMount() {
    // Help minimize jumpy zoom with Apple mice and trackpads
    const lethargy = new Lethargy(7, 10, 0.05)

    ;(L.Map as any).ScrollWheelZoom.prototype._onWheelScroll = function (e: MouseEvent) {
      L.DomEvent.stop(e)

      if ((lethargy as any).check(e) === false) {
        return
      }

      let delta = L.DomEvent.getWheelDelta(e)
      if (delta <= -0.25) delta = -0.25
      if (delta >= 0.25) delta = 0.25

      this._delta += delta
      this._lastMousePos = this._map.mouseEventToContainerPoint(e)

      this._performZoom()
    }

    this.map = L.map(this.mapNode!, {
      zoom: 4,
      center: [55.0, -112.0],
      minZoom: 3,
      maxZoom: 13,
      preferCanvas: true,
    })

    this.map.on('moveend', () => {
      this.mapIsMoving = false
      setTimeout(() => {
        if (!this.mapIsMoving) {
          const { onMapMove } = this.props
          onMapMove(this.map.getCenter())
        }
      }, 1)
    })

    this.map.on('movestart', () => {
      this.mapIsMoving = true
    })

    this.map.zoomControl.setPosition('topright')

    this.map.addControl(
      (L.control as any).zoomBox({
        position: 'topright',
      }),
    )

    if (!this.simple) {
      const geonamesControl = (L.control as any).geonames({
        geonamesURL: 'https://secure.geonames.org/searchJSON',
        position: 'topright',
        username: 'seedsource',
        showMarker: false,
        showPopup: false,
      })
      geonamesControl.on('select', ({ geoname }: any) => {
        const latlng = { lat: parseFloat(geoname.lat), lng: parseFloat(geoname.lng) }
        this.map.setView(latlng)
        this.map.fire('click', { latlng })
      })
      this.map.addControl(geonamesControl)
    }

    const basemapControl = (L.control as any).basemaps({
      basemaps: [
        L.tileLayer('//{s}.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
          attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
          maxZoom: 16,
          subdomains: ['server', 'services'],
        }),
        L.tileLayer('//{s}.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
          maxZoom: 16,
          subdomains: ['server', 'services'],
        }),
        L.tileLayer('//{s}.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}', {
          attribution: 'Tiles &copy; Esri &mdash; Source: USGS, Esri, TANA, DeLorme, and NPS',
          maxZoom: 13,
          subdomains: ['server', 'services'],
        }),
        L.tileLayer(
          '//{s}.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
          {
            attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
            maxZoom: 16,
            subdomains: ['server', 'services'],
          },
        ),
        L.tileLayer(
          '//{s}.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
          {
            attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
            maxZoom: 16,
            subdomains: ['server', 'services'],
          },
        ),
      ],
      tileX: 0,
      tileY: 0,
      tileZ: 1,
      position: 'bottomleft',
    })
    this.map.addControl(basemapControl)
    if (this.simple) {
      basemapControl.remove()
    }

    this.map.on('baselayerchange', (layer: any) => {
      const { onBasemapChange } = this.props
      onBasemapChange(layer._url)
    })

    if (!this.simple) {
      this.map.on('popupclose', () => {
        const { onPopupClose } = this.props
        onPopupClose()
      })

      this.map.on('click', (e: LeafletMouseEvent) => {
        const { onPopupLocation } = this.props

        if (!e.latlng) {
          return
        }

        this.updateBoundaryPreview(e.latlng)

        onPopupLocation(e.latlng.lat, e.latlng.lng)
      })
    }

    this.map.on('zoomend', () => {
      const { onZoomChange } = this.props
      onZoomChange(this.map.getZoom())
    })

    this.regionsBoundaries = topojson(
      regionsBoundariesUrl,
      null,
      (L as any).geoJson(null, {
        style: {
          fillColor: 'transparent',
          opacity: 0,
        },
      }),
    )

    this.map.addLayer(this.regionsBoundaries)

    if (this.simple) {
      const { zoom, center } = this.props

      if (zoom && center) {
        this.map.setView(center, zoom)
      }
    }

    this.userSitesLayer = L.layerGroup().addTo(this.map)
  }

  componentDidUpdate(prevProps: MapProps) {
    const { regionMethod, resultRegion } = this.props
    if (regionMethod === 'auto' && prevProps.regionMethod !== 'auto' && this.popup) {
      const { point } = this.popup
      this.updateBoundaryPreview({ lng: point.x, lat: point.y })
    }

    if (prevProps.resultRegion !== resultRegion) {
      this.removeBoundaryFromMap(this.resultRegion)
      this.resultRegion = resultRegion
    }
  }

  componentWillUnmount() {
    this.map = null
  }

  updatePointMarker(point: { x: number; y: number }) {
    const pointIsValid = point !== null && point.x && point.y

    if (pointIsValid) {
      if (this.pointMarker === null) {
        this.pointMarker = L.marker([point.y, point.x]).addTo(this.map)
      } else {
        this.pointMarker.setLatLng([point.y, point.x])
      }
    } else if (this.pointMarker !== null) {
      this.map.removeLayer(this.pointMarker)
      this.pointMarker = null
    }
  }

  addBoundaryToMap(region: string, color: string, showFill = true) {
    const fillOpacity = showFill ? 0.3 : 0
    this.regionsBoundaries.setStyle((f: any) =>
      f.properties.region === region ? { opacity: 1, fillColor: color, fillOpacity, color, weight: 2 } : {},
    )
  }

  removeBoundaryFromMap(region: any = null) {
    const style = { opacity: 0, fillColor: 'transparent', fillOpacity: 0 }
    if (region) {
      this.regionsBoundaries.setStyle((f: any) => (f.properties.region === region ? style : {}))
    } else {
      this.regionsBoundaries.setStyle(style)
    }
  }

  updateBoundaryPreview(point: { lat: number; lng: number }) {
    const { regionMethod } = this.props

    this.cancelBoundaryPreview()

    if (regionMethod === 'auto') {
      const regionUrl = `${config.apiRoot}regions/?${io.urlEncode({
        point: `${point.lng},${point.lat}`,
      })}`

      this.showPreview = true

      io.get(regionUrl)
        .then(response => response.json())
        .then(json => {
          const { results } = json
          const validRegions = results.map((region: any) => region.name)

          let region = null
          if (validRegions.length) {
            ;[region] = validRegions
          }

          if (this.showPreview && this.boundaryName !== region) {
            this.addBoundaryToMap(region, '#aaa')
            this.clickedRegion = region
          }
        })
    }
  }

  cancelBoundaryPreview() {
    this.showPreview = false
    if (this.clickedRegion) {
      this.removeBoundaryFromMap(this.clickedRegion)
      this.clickedRegion = null
    }
  }

  updateBoundaryLayer(region: string) {
    const { regionMethod } = this.props

    if (regionMethod === 'custom') {
      this.cancelBoundaryPreview()
    }

    if (region !== null && region !== this.boundaryName) {
      this.boundaryName = region

      // Remove existing layer from viewer
      this.removeBoundaryFromMap()

      const regionObj = regions.find(r => r.name === region)
      this.addBoundaryToMap(regionObj!.name, '#000066', false)
    } else if (region === null) {
      this.boundaryName = null
      this.removeBoundaryFromMap()

      if (this.showPreview && this.clickedRegion) {
        this.addBoundaryToMap(this.clickedRegion, '#aaa')
      }
    }

    if (this.resultRegion) {
      this.addBoundaryToMap(this.resultRegion, '#006600', false)
    }
  }

  updateOpacity(opacity: number) {
    if (!this.simple) {
      if (this.displayedRasterLayers.length) {
        if (this.opacityControl === null) {
          this.opacityControl = (L.control as any).range({ iconClass: 'icon-contrast-16' })
          this.map.addControl(this.opacityControl)

          this.opacityControl.on('change input', (e: any) => {
            const { onOpacityChange } = this.props
            onOpacityChange(e.value / 100)
          })
        }
        this.opacityControl.setValue(Math.round(opacity * 100))
      } else if (this.opacityControl !== null) {
        this.map.removeControl(this.opacityControl)
        this.opacityControl = null
      }
    }

    this.displayedRasterLayers.forEach(layer => layer.setOpacity(opacity))
  }

  updateVisibilityButton(layers: string[], state: any) {
    if (this.simple) {
      return
    }

    const resultsLayer = config.layers.results
    const showResultsLayer = resultsLayer.show(state)
    const visible = layers.includes('results')

    if (showResultsLayer) {
      const icon = visible ? 'eye-closed' : 'eye'

      if (this.visibilityButton === null) {
        this.visibilityButton = new ButtonControl({ icon } as any)
        this.visibilityButton.on('click', () => {
          const { onToggleVisibility } = this.props
          onToggleVisibility()
        })
        this.map.addControl(this.visibilityButton)
      } else if (this.visibilityButton.options.icon !== icon) {
        this.visibilityButton.setIcon(icon)
      }
    } else if (this.visibilityButton !== null) {
      this.map.removeControl(this.visibilityButton)
      this.visibilityButton = null
    }
  }

  updateLegends(legends: any, layers: any[], unit: string, state: any) {
    if (this.simple) {
      return
    }

    const mapLegends = legends.legends.map((legend: any) => {
      const variable = allVariables.find(item => item.name === legend.layerName)
      if (variable) {
        const { units, multiplier }: { units: any; multiplier: number } = variable
        const newLegend = legend.legend.map((item: any) => {
          let value: number | string = parseFloat(item.label)

          if (!Number.isNaN(value)) {
            value /= multiplier

            if (units !== null && unit === 'imperial') {
              value = units.imperial.convert(value)
            }

            value = `${parseFloat((value as number).toFixed(2))} ${units[unit].label}`

            return { ...item, label: value }
          }
          return item
        })

        return {
          label: legend.layerName,
          elements: newLegend,
        }
      }
      return {
        label: c('as in same or similar objects').t`Match`,
        elements: legend.legend,
      }
    })
    const legendOrder = layers.map(layer => {
      return layer.replace('variable-', '')
    })

    const orderedMapLegends = legendOrder
      .map(name => mapLegends.find((el: any) => el.label === name || (el.label === 'Match' && name === 'results')))
      .filter(el => typeof el === 'object')

    if (orderedMapLegends.length) {
      if (this.legend === null) {
        this.legend = new LegendControl({ legends: orderedMapLegends } as any)
        this.map.addControl(this.legend)
      } else if (JSON.stringify(orderedMapLegends) !== JSON.stringify(this.legend.options.legends)) {
        this.legend.setLegends(orderedMapLegends)
      }
    } else if (this.legend !== null) {
      this.map.removeControl(this.legend)
      this.legend = null
    }
  }

  updateZoneLayer(method: string, zone: string, zoneConfig: any, geometry: any) {
    if (method === 'seedzone' && geometry !== null) {
      if (zone !== this.currentZone) {
        if (this.zoneLayer !== null) {
          this.map.removeLayer(this.zoneLayer)
          this.zoneLayer = null
        }
        if (this.zoneElevationLayer !== null) {
          this.map.removeLayer(this.zoneElevationLayer)
          this.zoneElevationLayer = null
        }
      }

      if (zoneConfig.elevation_service !== this.zoneElevationService && this.zoneElevationLayer !== null) {
        this.map.removeLayer(this.zoneElevationLayer)
        this.zoneElevationLayer = null
      }
      this.zoneElevationService = zoneConfig.elevation_service

      if (this.zoneLayer === null) {
        this.zoneLayer = (L as any)
          .geoJson(geometry, {
            style: () => {
              return { color: '#0E630B', fill: false }
            },
          })
          .addTo(this.map)
      }

      this.currentZone = zone

      if (this.zoneElevationLayer === null && zoneConfig.elevation_service !== null) {
        this.zoneElevationLayer = L.tileLayer(`/tiles/${zoneConfig.elevation_service}/{z}/{x}/{y}.png`, {
          zIndex: 1,
          opacity: 0.5,
        }).addTo(this.map)
      }
    } else {
      if (this.zoneLayer !== null) {
        this.map.removeLayer(this.zoneLayer)
        this.zoneLayer = null
        this.currentZone = null
      }

      if (this.zoneElevationLayer !== null) {
        this.map.removeLayer(this.zoneElevationLayer)
        this.zoneElevationLayer = null
      }
    }
  }

  updateShapefileLayer(constraints: any[], custom: CustomLayer[]) {
    const constraintData = constraints.map(cn => cn.values.geoJSON).filter(geojson => !!geojson)
    const customData = custom.filter(cl => !!cl.geoJSON && cl.displayed).map(cl => ({ ...cl.geoJSON, color: cl.color }))
    const data = [...constraintData, ...customData]
    if (JSON.stringify(data) === JSON.stringify(this.shpData)) {
      return
    }

    // Create new layers for each feature, even if they already exist...
    const constraintLayers = constraintData.map(geojson =>
      L.geoJSON(geojson, { style: { fill: false, color: '#a50f15', weight: 1.5 } })
        .addTo(this.map)
        .setZIndex(15),
    )
    const customLayers = customData.map(datum =>
      L.geoJSON(datum, { style: { fill: false, color: datum.color, weight: 1.5 } })
        .addTo(this.map)
        .setZIndex(15),
    )
    const layers = [...constraintLayers, ...customLayers]

    // ... then delete the old layers
    this.shpLayers.forEach(layer => this.map.removeLayer(layer))

    this.shpLayers = layers
    this.shpData = data
  }

  updatePopup(popup: any, unit: any) {
    const { mode } = this.props
    const { point, elevation, values, zones } = popup

    if (point !== null) {
      if (this.popup === null) {
        this.popup = {
          popup: L.popup({ closeOnClick: false }).setLatLng([point.y, point.x]).addTo(this.map),
          point,
          content: document.createElement('div'),
        }
      }

      setTimeout(() => {
        if (this.popup) {
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
                    const { point: newPoint } = this.popup!
                    const { mode: newMode } = this.props

                    this.cancelBoundaryPreview()
                    this.map.closePopup(this.popup!.popup)

                    if (newMode === 'add_sites') {
                      const { onAddSite } = this.props
                      onAddSite(newPoint.y, newPoint.x, '')
                    } else {
                      const { onMapClick } = this.props
                      onMapClick(newPoint.y, newPoint.x)
                    }
                  }}
                >
                  {mode === 'add_sites' ? t`Add Location` : t`Set Point`}
                </button>
              </div>
            </>,
            this.popup!.content,
          )
          this.popup!.popup.setContent(this.popup!.content)
        }
      }, 1)

      this.popup.popup.setLatLng([point.y, point.x])
    } else if (this.popup) {
      this.cancelBoundaryPreview()
      this.map.closePopup(this.popup.popup)
      this.popup = null
    }
  }

  updateMapCenter(center: [lat: number, lng: number]) {
    if (this.mapIsMoving) {
      return
    }

    const mapCenter = this.map.getCenter()
    if (!isClose(center[0], mapCenter.lat) || !isClose(center[1], mapCenter.lng)) {
      this.map.setView(center)
    }
  }

  updateMapZoom(zoomLevel: number) {
    const mapZoomLevel = this.map.getZoom()

    if (zoomLevel !== mapZoomLevel) {
      this.map.setZoom(zoomLevel)
    }
  }

  updateRasterLayers(layers: string[], state: any) {
    const numLayersToAdd = layers.length - this.displayedRasterLayers.length

    if (numLayersToAdd > 0) {
      this.displayedRasterLayers.push(
        ...Array(numLayersToAdd)
          .fill(0)
          .map((_, index) => {
            const layer = config.layers[layers[this.displayedRasterLayers.length + index]]
            const url = typeof layer.url === 'string' ? layer.url : layer.url(state)
            return L.tileLayer(url, { zIndex: 1, opacity: 1 }).addTo(this.map)
          }),
      )
    } else if (numLayersToAdd < 0) {
      this.displayedRasterLayers
        .splice(numLayersToAdd, Math.abs(numLayersToAdd))
        .forEach(layer => this.map.removeLayer(layer))
    }

    layers.forEach((l, index) => {
      const layer = config.layers[l]
      const url = typeof layer.url === 'string' ? layer.url : layer.url(state)
      const rasterLayer = this.displayedRasterLayers[index]
      if (url !== rasterLayer._url) {
        rasterLayer.setUrl(url)
      }
      if (layer.zIndex !== undefined && layer.zIndex !== rasterLayer.zIndex) {
        rasterLayer.setZIndex(layer.zIndex)
      }
    })
  }

  updateVectorLayers(layers: string[], state: any) {
    if (
      this.displayedVectorLayers.map(layer => layer._url).toString() ===
      layers
        .map(l => {
          const layer = config.layers[l]
          return typeof layer.url === 'string' ? layer.url : layer.url(state)
        })
        .toString()
    ) {
      return
    }

    const numLayersToAdd = layers.length - this.displayedVectorLayers.length

    if (numLayersToAdd > 0) {
      this.displayedVectorLayers.push(
        ...Array(numLayersToAdd)
          .fill(0)
          .map((_, i) => {
            const layer = config.layers[layers[this.displayedVectorLayers.length + i]]
            const url = typeof layer.url === 'string' ? layer.url : layer.url(state)
            return (L as any).vectorGrid
              .protobuf(url, {
                zIndex: 1,
                opacity: 1,
                vectorTileLayerStyles: layer.style,
              })
              .addTo(this.map)
          }),
      )
    } else {
      this.displayedVectorLayers
        .splice(numLayersToAdd, Math.abs(numLayersToAdd))
        .forEach(layer => this.map.removeLayer(layer))
    }

    layers.forEach((l, index) => {
      const layer = config.layers[l]
      const url = typeof layer.url === 'string' ? layer.url : layer.url(state)
      const displayedLayer = this.displayedVectorLayers[index]
      if (displayedLayer.url !== url) {
        this.displayedVectorLayers[index].options.vectorTileLayerStyles = { ...layer.style }
        this.displayedVectorLayers[index].setUrl(url)
      }
    })
  }

  updateLayers(layers: string[], state: any) {
    const rasterLayers = layers.filter(l => config.layers[l].type === 'raster')
    const vectorLayers = layers.filter(l => config.layers[l].type === 'vector')
    this.updateRasterLayers(rasterLayers, state)
    this.updateVectorLayers(vectorLayers, state)
  }

  updateUserSites(userSites: { lat: number; lon: number }[], activeSite: number) {
    this.userSitesLayer.getLayers().forEach((layer: any, i: number) => {
      if (i >= userSites.length) {
        this.userSitesLayer.removeLayer(layer)
      } else {
        const site = userSites[i]
        const siteLatLng = L.latLng(site.lat, site.lon)

        layer.setLatLng(siteLatLng)
        layer.setIcon(
          L.divIcon({
            className: `user-site-layer-icon ${activeSite === i ? 'active' : ''}`,
            iconSize: [20, 20],
          }),
        )
      }
    })

    const start = this.userSitesLayer.getLayers().length
    userSites.slice(start).forEach((site, index) => {
      const siteLatLng = L.latLng(site.lat, site.lon)
      this.userSitesLayer.addLayer(
        L.marker(siteLatLng, {
          icon: L.divIcon({
            className: `user-site-layer-icon ${activeSite === start + index ? 'active' : ''}`,
            iconSize: [20, 20],
          }),
        }),
      )
    })
  }

  render() {
    let timeOverlay = null

    if (this.map !== null) {
      const {
        objective,
        point,
        climate,
        opacity,
        legends,
        popup,
        unit,
        method,
        zone,
        zoneConfig,
        geometry,
        center,
        region,
        shapefileConstraints,
        layers,
        customLayers,
        zoom,
        userSites,
        activeUserSite,
        mode,
        state,
      } = this.props

      this.updateLayers(layers, state)
      this.updatePointMarker(point)
      this.updateBoundaryLayer(region)
      this.updateVisibilityButton(layers, state)
      this.updateOpacity(opacity)
      this.updateLegends(legends, layers, unit, state)
      this.updateZoneLayer(method, zone, zoneConfig, geometry)
      this.updatePopup(popup, unit)
      this.updateMapCenter(center)
      this.updateMapZoom(zoom)
      this.updateShapefileLayer(shapefileConstraints, customLayers)
      this.updateUserSites(userSites, activeUserSite)

      // Update cursor
      if (mode === 'add_sites') {
        L.DomUtil.addClass(this.map._container, 'crosshair')
      } else {
        L.DomUtil.removeClass(this.map._container, 'crosshair')
      }

      // Time overlay
      if (layers.find((layer: string) => layer.startsWith('variable-'))) {
        const selectedClimate = objective === 'seedlots' ? climate.site : climate.seedlot
        const { time, model } = selectedClimate
        let labelKey = time

        if (time !== '1961_1990' && time !== '1981_2010') {
          labelKey += model
        }

        const climateLabel = timeLabels[labelKey]

        timeOverlay = (
          <div className="time-overlay">
            <span className="icon-clock-16" />
            <span>&nbsp;</span>
            {t`Showing climate for ${climateLabel}`}
          </div>
        )
      }
    }

    return (
      <div className="map-container">
        <div
          ref={input => {
            this.mapNode = input
          }}
          className="map-container"
        />
        {timeOverlay}
      </div>
    )
  }
}

export default connector(Map)
