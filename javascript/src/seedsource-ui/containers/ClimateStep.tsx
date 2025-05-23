import React from 'react'
import { t } from 'ttag'
import { connect } from 'react-redux'
import ConfigurationStep from './ConfigurationStep'
import { timeLabels } from '../config'
import { selectClimateModel, selectClimateYear } from '../actions/climate'

type ClimateStepProps = {
  title?: string
  seedlotHelpText?: string
  siteHelpText?: string
  climate: any
  number: number
  active: boolean
  onChange: (type: string, value: string, climate: string) => any
}

const ClimateStep = ({ title, seedlotHelpText, siteHelpText, climate, number, active, onChange }: ClimateStepProps) => {
  const { seedlot, site } = climate
  let modelSelect = null

  if (!active) {
    let siteKey = site.time
    if (site.time !== '1961_1990' && site.time !== '1981_2010') {
      siteKey += site.model
    }

    return (
      <ConfigurationStep title={title!} number={number} name="climate" active={false}>
        <div>
          <strong>{t`Seedlot climate:`} </strong>
          {timeLabels[seedlot.time]}
        </div>
        <div>
          <strong>{t`Planting site climate:`} </strong>
          {timeLabels[siteKey]}
        </div>
      </ConfigurationStep>
    )
  }

  if (site.time !== '1961_1990' && site.time !== '1981_2010') {
    modelSelect = (
      <div className="select is-inline-block">
        <select
          value={site.model}
          onChange={e => {
            e.preventDefault()
            onChange('model', e.target.value, 'site')
          }}
        >
          <option value="rcp45">RCP4.5</option>
          <option value="rcp85">RCP8.5</option>
        </select>
      </div>
    )
  }

  return (
    <ConfigurationStep title={title!} number={number} name="climate" active>
      <div className="is-size-7">
        <em>{seedlotHelpText}</em>
      </div>

      <div className="select is-inline-block">
        <select
          value={seedlot.time}
          onChange={e => {
            e.preventDefault()
            onChange('year', e.target.value, 'seedlot')
          }}
        >
          <option value="1961_1990">1961 - 1990</option>
          <option value="1981_2010">1981 - 2010</option>
        </select>
      </div>
      <div style={{ height: '10px' }} />
      <div className="is-size-7">
        <em>{siteHelpText}</em>
      </div>

      <div className="select is-inline-block">
        <select
          value={site.time}
          onChange={e => {
            e.preventDefault()
            onChange('year', e.target.value, 'site')
          }}
        >
          <option value="1961_1990">1961 - 1990</option>
          <option value="1981_2010">1981 - 2010</option>
          <option value="2025">2011 - 2040</option>
          <option value="2055">2041 - 2070</option>
          <option value="2085">2071 - 2100</option>
        </select>
      </div>
      <span> </span>
      {modelSelect}
    </ConfigurationStep>
  )
}

ClimateStep.defaultProps = {
  title: t`Select climate scenarios`,
  seedlotHelpText: t`Which climate are the seedlots adapted to?`,
  siteHelpText: t`When should trees be best adapted to the planting site?`,
}

export default connect(
  ({ runConfiguration }: { runConfiguration: any }) => {
    const { climate } = runConfiguration
    return { climate }
  },
  (dispatch: (event: any) => any) => ({
    onChange: (type: string, value: string, climate: string) => {
      switch (type) {
        case 'year':
          dispatch(selectClimateYear(value, climate))
          break
        case 'model':
        default:
          dispatch(selectClimateModel(value, climate))
          break
      }
    },
  }),
)(ClimateStep)
