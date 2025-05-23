import React from 'react'
import { connect } from 'react-redux'
import { setLatitude, setLongitude } from '../actions/point'

type PointChooserProps = {
  lat: string | number
  lon: string | number
  onBlur: (target: string, value: string) => any
}

type PointChooserState = {
  latValue: string | null
  lonValue: string | null
}

class PointChooser extends React.Component<PointChooserProps, PointChooserState> {
  constructor(props: any) {
    super(props)
    this.state = { latValue: null, lonValue: null }
  }

  render() {
    const { lat, lon, onBlur } = this.props
    const { latValue, lonValue } = this.state
    const flag = (window as any).waffle.flag_is_active('map-seedlots')

    return (
      <div className={`point-chooser ${flag ? 'columns is-mobile' : ''}`} style={flag ? { marginBottom: '0' } : {}}>
        <label className={flag ? 'column is-narrow' : ''}>
          {flag ? <div>Lat</div> : <strong>Lat: </strong>}
          <input
            type="text"
            data-lpignore="true"
            className="input is-inline is-small"
            value={latValue === null ? lat : latValue}
            onChange={e => {
              this.setState({ latValue: e.target.value })
            }}
            onBlur={e => {
              this.setState({ latValue: null })

              if (e.target.value !== lat) {
                onBlur('lat', e.target.value)
              }
            }}
            onKeyPress={e => {
              if (e.key === 'Enter') {
                ;(e.target as HTMLInputElement).blur()
              }
            }}
          />
        </label>

        <label className={flag ? 'column is-narrow' : ''}>
          {flag ? <div>Lon</div> : <strong> Lon: </strong>}
          <input
            type="text"
            data-lpignore="true"
            className="input is-inline is-small"
            value={lonValue === null ? lon : lonValue}
            onChange={e => {
              this.setState({ lonValue: e.target.value })
            }}
            onBlur={e => {
              this.setState({ lonValue: null })

              if (e.target.value !== lon) {
                onBlur('lon', e.target.value)
              }
            }}
            onKeyPress={e => {
              if (e.key === 'Enter') {
                ;(e.target as HTMLInputElement).blur()
              }
            }}
          />
        </label>
      </div>
    )
  }
}

export default connect(
  (state: any) => {
    const { point } = state.runConfiguration
    let lat = ''
    let lon = ''

    if (point !== null) {
      lat = point.y ? point.y.toFixed(4) : ''
      lon = point.x ? point.x.toFixed(4) : ''
    }

    return { lat, lon }
  },
  (dispatch: (action: any) => any) => {
    return {
      onBlur: (type: string, value: string) => {
        const number = parseFloat(value)

        if (Number.isNaN(number)) {
          return
        }

        switch (type) {
          case 'lat':
            dispatch(setLatitude(number))
            break
          case 'lon':
          default:
            dispatch(setLongitude(number))
            break
        }
      },
    }
  },
)(PointChooser)
