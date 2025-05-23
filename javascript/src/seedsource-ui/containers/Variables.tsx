import React from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { t } from 'ttag'
import Variable from './Variable'
import { variables as allVariables } from '../config'
import { addVariable } from '../actions/variables'
import { setError } from '../actions/error'

const connector = connect(
  (state: any) => {
    const { runConfiguration } = state
    const { variables } = runConfiguration
    const names = variables.map((item: any) => item.name)
    const unusedVariables = allVariables.filter(item => !names.includes(item.name))

    return { variables, unusedVariables }
  },
  (dispatch: (action: any) => any) => {
    return {
      onChange: (variable: string, variables: any[]) => {
        if (variables.length >= 6) {
          dispatch(
            setError(
              t`Configuration error`,
              t`You may only add 6 variables to your configuration. 
                Please remove an exiting variable before adding another.`,
            ),
          )

          return
        }

        dispatch(addVariable(variable))
      },
    }
  },
)

type VariablesProps = ConnectedProps<typeof connector> & {
  edit: boolean
}

const Variables = ({ variables, unusedVariables, edit, onChange }: VariablesProps) => {
  let table = null

  if (variables.length > 0) {
    table = (
      <table className="table is-fullwidth">
        <thead className="align-bottom is-size-7 has-text-weight-bold">
          <tr>
            <td />
            <th>
              <div className="modify-status">&nbsp;</div>
              {t`Name`}
            </th>
            <th>{t`Center`}</th>
            <th>{t`Transfer limit (+/-)`}</th>
            <td />
          </tr>
        </thead>
        <tbody>
          {variables.map((item: any, index: number) => (
            <Variable variable={item} index={index} key={item.name} />
          ))}
        </tbody>
      </table>
    )
  }
  return (
    <div className={`variables-list${edit ? ' edit' : ''}`}>
      {table}

      <div className="select is-fullwidth">
        <select
          className={`${edit ? '' : ' is-hidden'}`}
          value=""
          onChange={e => {
            e.preventDefault()
            onChange(e.target.value, variables)
          }}
        >
          <option value="none">{t`Add a variable...`}</option>
          {unusedVariables.map(item => (
            <option value={item.name} key={item.name}>
              {item.name}: {item.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

export default connector(Variables)
