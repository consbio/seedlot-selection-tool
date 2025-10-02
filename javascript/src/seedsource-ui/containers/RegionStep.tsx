import React from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { t } from 'ttag'
import ConfigurationStep from './ConfigurationStep'
import RegionButton from './RegionButton'
import { setRegion } from '../actions/region'
import { regions } from '../config'

const connector = connect(
  (state: any) => {
    const { region, regionMethod } = state.runConfiguration

    return { region, regionMethod }
  },
  (dispatch: (event: any) => any) => {
    return {
      onChange: (region: string) => {
        dispatch(setRegion(region))
      },
    }
  },
)

type RegionStepProps = ConnectedProps<typeof connector> & {
  number: number
}

const helpTooltip = (
  <p>
    {t`The map is broken into large geographic regions such as the Western US and the Eastern US.`}&nbsp;
    {t`Select`} <strong>{t`Automatic`} </strong>
    {t`if your seedlot(s) and planting site(s) are from the same region (most common).`}&nbsp;
    {t`Select`} <strong>{t`Custom`} </strong>
    {t`if they are from different regions, and then specify the region that does not include the location chosen 
    in step 2.`}
  </p>
)

const RegionStep = ({ number, region, regionMethod, onChange }: RegionStepProps) => {
  const buttons = (
    <div className="tabs is-toggle is-small">
      <ul>
        <RegionButton name="auto">{t`Automatic`}</RegionButton>
        <RegionButton name="custom">{t`Custom`}</RegionButton>
      </ul>
    </div>
  )

  if (regionMethod === 'auto') {
    const regionLabel = region !== null ? regions.find(r => r.name === region)?.label : 'N/A'
    return (
      <ConfigurationStep title={t`Select region`} number={number} name="region" active helpTooltip={helpTooltip}>
        {buttons}
        <strong>{t`Region:`}</strong> {regionLabel}
      </ConfigurationStep>
    )
  }
  return (
    <ConfigurationStep title={t`Select region`} number={number} name="region" active helpTooltip={helpTooltip}>
      {buttons}
      <div style={{ marginTop: '3px' }}>
        <div className="align-middle is-inline-block">
          <strong>{t`Region:`}</strong>
        </div>
        <div className="select align-middle is-inline-block">
          <select
            value={region || regions[0].name}
            onChange={e => {
              e.preventDefault()
              onChange(e.target.value)
            }}
          >
            {regions.map(r => (
              <option value={r.name} key={r.name}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </ConfigurationStep>
  )
}

const container = connector(RegionStep)

export default container
