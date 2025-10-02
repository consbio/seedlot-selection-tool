import React from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { t } from 'ttag'
import { selectCenter } from '../actions/variables'
import ConfigurationStep from './ConfigurationStep'
import MethodButton from './MethodButton'
import SpeciesChooser from './SpeciesChooser'
import SeedZoneChooser from './SeedZoneChooser'
import config from '../config'

const connector = connect(
  ({ runConfiguration }: { runConfiguration: any }) => {
    const { objective, method, center } = runConfiguration

    return { objective, method, center }
  },
  dispatch => {
    return {
      onCenterChange: (center: string) => {
        dispatch(selectCenter(center))
      },
    }
  },
)

type TransferStepProps = ConnectedProps<typeof connector> & {
  number: number
  active: boolean
}

const helpTooltip = (
  <>
    <p>
      {t`The transfer limit method selected determines how far climatically a seedlot may be moved and still 
      have an acceptable level of adaptation. `}
    </p>
    <p>{t`The SST uses four approaches to determine and map transfer limits: `}</p>
    <p>
      <strong>{t`Custom`}: </strong>
      {t`Allows for user-defined transfer limits for each climate variable selected in Step 6 based on user knowledge 
      and experience including the best available science.`}
    </p>
    <p>
      <strong>{t`Zone`}: </strong>
      {t`Suggests transfer limits based on the range of climate conditions within the zone of the planting site or 
      seedlot; these values are based on operational resource management over the past half-century and allows users 
      to customize climate variables in step 6 or choose them automatically.`}
    </p>
    <p>
      <strong>{t`Trait`}: </strong>
      {t`Suggests transfer limits based on a particular trait of a species.`}
    </p>
    <p>
      <strong>{t`Function`}: </strong>
      {t`Allows for species to be selected to determine transfer limits based on a function that is derived from 
      genetic studies that relates population differences in adaptive traits grown in a common environment to the 
      climates of seed sources. The function approach is available for select species.`}
    </p>
  </>
)

const TransferStep = ({ number, active, objective, method, center, onCenterChange }: TransferStepProps) => {
  if (!active) {
    let label

    if (method === 'seedzone') {
      label = t`Transfer limits based on seed zone, climatic center based on the selected location`

      if (center === 'zone') {
        label = t`Transfer limits and climatic center based on seed zone`
      }
    } else {
      label = t`Custom transfer limits, climatic center based on the selected location`
    }

    return (
      <ConfigurationStep title={t`Select transfer limit method`} number={number} name="transfer" active={false}>
        <div>{label}</div>
      </ConfigurationStep>
    )
  }

  let centerNode = null

  if (method === 'seedzone' && objective === 'sites') {
    centerNode = (
      <div>
        <div className="is-size-7">
          <em>{t`Which should be used as the climatic center?`}</em>
        </div>
        <div className="control">
          <div>
            <label className="radio">
              <input type="radio" checked={center === 'point'} onChange={() => onCenterChange('point')} />
              {t`The value at the selected location`}
            </label>
          </div>
          <div>
            <label className="radio">
              <input type="radio" checked={center === 'zone'} onChange={() => onCenterChange('zone')} />
              {t`The climatic center of the zone`}
            </label>
          </div>
        </div>
        <div>&nbsp;</div>
      </div>
    )
  }

  const hasFunctions = !!config.functions && config.functions.length > 0

  return (
    <ConfigurationStep
      title={t`Select transfer limit method`}
      number={number}
      name="transfer"
      active
      helpTooltip={helpTooltip}
    >
      <div className="tabs is-toggle is-small">
        <ul>
          <MethodButton name="custom">{t`Custom`}</MethodButton>
          <MethodButton name="seedzone">{t`Zone`}</MethodButton>
          {hasFunctions ? <MethodButton name="trait">{t`Trait`}</MethodButton> : null}
          <MethodButton name="function">{t`Function`}</MethodButton>
        </ul>
      </div>
      {centerNode}
      {method === 'seedzone' || method === 'trait' ? <SpeciesChooser generic={method === 'seedzone'} /> : null}
      <div style={{ height: '10px' }} />
      {method === 'seedzone' ? <SeedZoneChooser /> : null}
    </ConfigurationStep>
  )
}

export default connector(TransferStep)
