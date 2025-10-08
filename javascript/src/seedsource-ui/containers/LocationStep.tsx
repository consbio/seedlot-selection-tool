import React from 'react'
import { connect } from 'react-redux'
import { t, c, jt } from 'ttag'
import ConfigurationStep from './ConfigurationStep'
import PointChooser from './PointChooser'
import { setMapMode } from '../actions/map'
import { addUserSite } from '../actions/point'
import fetchElevation from '../utils/elevation'

type LocationStepProps = {
  objective: string
  number: number
  elevation?: any
}

function LocationStep({ objective, number, elevation }: LocationStepProps) {
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

  const helpTooltip = (
    <p>{jt`Locate your ${siteLabel} by using the map or entering coordinates.`}</p>
  )

  return (
    <ConfigurationStep
      title={objective === 'seedlots' ? t`Select planting site location` : t`Select seedlot location`}
      number={number}
      name="location"
      active
      helpTooltip={helpTooltip}
    >
      <div>
        <PointChooser />
        {elevationNode}
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
    onAddUserSite: (lat: number, lon: number, label: string, elevation?: number) => {
      if (elevation !== undefined) {
        dispatch(addUserSite({ lat, lon, elevation }, label))
        dispatch(setMapMode('normal'))
      } else {
        fetchElevation(lat, lon).then(fetchedElevation => {
          dispatch(addUserSite({ lat, lon, elevation: fetchedElevation }, label))
          dispatch(setMapMode('normal'))
        })
      }
    },
  }),
)(LocationStep)
