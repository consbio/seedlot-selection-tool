import React from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { t, c } from 'ttag'
import ConfigurationStep from './ConfigurationStep'
import UnitButton from './UnitButton'
import Variables from './Variables'
import config from '../config'
import { addVariables, setCustomMode, setDefaultVariables } from '../actions/variables'

const connector = connect(
  ({ runConfiguration }: { runConfiguration: any }) => {
    const { variables, method, customMode } = runConfiguration

    return { variables, method, customMode }
  },
  dispatch => ({
    setDefaultVariables: () => {
      const { defaultVariables } = config

      dispatch(addVariables(defaultVariables.map(({ variable }) => variable)))
      dispatch(setDefaultVariables(true))
    },
    onCustomModeChange: (customMode: boolean) => {
      dispatch(setCustomMode(customMode))
    },
  }),
)

type VariableStepProps = ConnectedProps<typeof connector> & {
  number: number
  active: boolean
}

const VariableStep = ({
  number,
  active,
  variables,
  method,
  customMode,
  onCustomModeChange,
  setDefaultVariables,
}: VariableStepProps) => {
  if (method !== 'seedzone' && method !== 'custom') {
    return null
  }

  const { defaultVariables } = config
  const flag = (window as any).waffle.flag_is_active('default-vars')

  if (!active) {
    let content = (
      <div>
        <em>{t`Click to add variables`}</em>
      </div>
    )

    if (variables.length > 0) {
      content = <Variables edit={false} />
    }

    return (
      <ConfigurationStep title={t`Select climate variables`} number={number} name="variables" active={false}>
        {content}
      </ConfigurationStep>
    )
  }

  return (
    <ConfigurationStep title={t`Select climate variables`} number={number} name="variables" active>
      <div className="margin-bottom-10">
        <input
          className="is-checkradio is-info"
          id="customMode"
          type="checkbox"
          name="customMode"
          checked={customMode}
          onChange={() => onCustomModeChange(!customMode)}
        />
        <label htmlFor="customMode">
          <strong>{t`Custom climate values`} </strong>(advanced users)<strong>:</strong>
        </label>
      </div>

      <Variables edit />

      {flag && defaultVariables && !variables.length && (
        <>
          <div className="hr-label" style={{ margin: '10px 0', textTransform: 'uppercase' }}>
            {t`or`}
          </div>
          <button
            type="button"
            className="button is-info is-fullwidth"
            style={{ marginBottom: '10px' }}
            onClick={() => setDefaultVariables()}
          >
            {t`Choose automatically`}
          </button>
        </>
      )}
    </ConfigurationStep>
  )
}

export default connector(VariableStep)
