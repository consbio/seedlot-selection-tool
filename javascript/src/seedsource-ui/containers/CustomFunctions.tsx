import React, { useState } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { t } from 'ttag'
import CustomFunction from './CustomFunction'
import { toggleFunction } from '../actions/customFunctions'
import CustomFunctionModal from './CustomFunctionModal'

const connector = connect(
  ({ runConfiguration }: { runConfiguration: { customFunctions: any[] } }) => {
    const { customFunctions } = runConfiguration
    return { customFunctions }
  },
  (dispatch: (action: any) => any) => {
    return { onToggleFunction: (value: string) => dispatch(toggleFunction(value)) }
  },
)

const CustomFunctions = (props: ConnectedProps<typeof connector>) => {
  const { customFunctions, onToggleFunction } = props
  const [modalActive, setModalActive] = useState(false)
  const [modalId, setModalId] = React.useState('newFunction')
  const onChange = (value: string) => {
    if (value === 'newFunction') {
      setModalId('newFunction')
      setModalActive(true)
      return
    }
    onToggleFunction(value)
  }

  return (
    <>
      {modalActive && (
        <CustomFunctionModal
          customFunction={customFunctions.find(cf => cf.id === modalId)}
          deactivateModal={() => setModalActive(false)}
        />
      )}
      <table className="table is-fullwidth">
        <thead className="align-bottom is-size-7 has-text-weight-bold">
          <tr>
            <td />
            <th>{t`Name`}</th>
            <th>{t`Value`}</th>
            <th>{t`Transfer Limit (+/-)`}</th>
            <td />
          </tr>
        </thead>
        <tbody>
          {customFunctions
            .filter(cf => cf.selected)
            .map(cf => (
              <CustomFunction
                key={cf.id}
                customFunction={cf}
                activateModal={() => {
                  setModalId(cf.id)
                  setModalActive(true)
                }}
              />
            ))}
        </tbody>
      </table>
      <div className="select is-fullwidth">
        <select
          value=""
          onChange={e => {
            e.preventDefault()
            onChange(e.target.value)
          }}
        >
          <option>{t`Select`}...</option>
          {customFunctions
            .filter(cf => !cf.selected)
            .map(cf => (
              <option value={cf.id} key={cf.id}>
                {cf.name}
              </option>
            ))}
          <option value="newFunction">{t`Add a custom function...`}</option>
        </select>
      </div>
    </>
  )
}

export default connector(CustomFunctions)
