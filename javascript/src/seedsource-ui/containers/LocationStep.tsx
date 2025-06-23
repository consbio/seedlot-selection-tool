import React from 'react'
import { connect } from 'react-redux'
import { t, c, jt } from 'ttag'
import ConfigurationStep from './ConfigurationStep'
import PointChooser from './PointChooser'
import { setMapMode } from '../actions/map'
import { addUserSite } from '../actions/point'

type LocationStepProps = {
  objective: string
  number: number
  elevation?: any
}

const LocationStep = ({ objective, number, elevation }: LocationStepProps) => {
  const elevationNode =
    elevation !== null ? (
      <div>
        <div>
          <strong>{t`Elevation:`}</strong> {Math.round(elevation.ft)} ft ({Math.round(elevation.m)} m)
        </div>
      </div>
    ) : (
      elevation
    )

  const siteLabel =
    objective === 'sites'
      ? c("This is one possible value of 'siteLabel'").t`seedlot (its climatic center)`
      : c("This is one possible value of 'siteLabel'").t`planting site`

  return (
    <ConfigurationStep
      title={objective === 'seedlots' ? t`Select planting site location` : t`Select seedlot location`}
      number={number}
      name="location"
      active
    >
      <div className="columns">
        <div className="column is-narrow" style={{ width: '185px' }}>
          <h4 className="title is-6" style={{ marginBottom: '0' }}>
            {t`Location`}
          </h4>
          <div className="is-size-7 is-italic">
            {jt`Locate your ${siteLabel} by using the map or entering coordinates.`}
          </div>
        </div>
        <div className="column">
          <PointChooser />
          {elevationNode}
        </div>
      </div>
    </ConfigurationStep>
  )
}

LocationStep.defaultProps = {
  elevation: null,
}

export default connect(
  ({ runConfiguration, map }: { runConfiguration: any; map: any }) => {
    const { mode } = map
    const { objective, point } = runConfiguration
    let { elevation } = point

    if (elevation !== null) {
      elevation = { ft: elevation / 0.3048, m: elevation }
    }

    return { objective, point, elevation, mode }
  },
  dispatch => ({
    onSetMapMode: (mode: string) => dispatch(setMapMode(mode)),
    onAddUserSite: (lat: number, lon: number, label: string) => {
      dispatch(addUserSite({ lat, lon }, label))
      dispatch(setMapMode('normal'))
    },
  }),
)(LocationStep)
