import React from 'react'
import { connect } from 'react-redux'
import { t, c } from 'ttag'
import ConstraintChooser from '../components/ConstraintChooser'
import ConfigurationStep from './ConfigurationStep'
import config from '../config'
import { addConstraint } from '../actions/constraints'

type ConstraintStepProps = {
  number: number
  constraints: any[]
  onChange: (selection: any) => any
}

const ConstraintStep = ({ number, constraints, onChange }: ConstraintStepProps) => {
  const { constraints: constraintsConfig } = config
  let table = null

  if (constraints.length) {
    table = (
      <table className="table is-fullwidth">
        <thead className="is-size-7">
          <tr>
            <td />
            <th>{t`Name`}</th>
            <th>{t`Value`}</th>
            <th>{c('i.e., Range of values (e.g., from 5 to 10)').t`Range (+/-)`}</th>
          </tr>
        </thead>
        <tbody>
          {constraints.map(({ type, name, values }, i) => {
            const ConstraintTag = constraintsConfig.objects[name].component
            return <ConstraintTag index={i} values={values} key={`${type}_${name}`} />
          })}
        </tbody>
      </table>
    )
  }

  return (
    <ConfigurationStep
      title={t`Apply constraints`}
      number={number}
      name="constraints"
      active
      className="constraint-step"
    >
      {table}
      <ConstraintChooser onAdd={onChange} />
    </ConfigurationStep>
  )
}

export default connect(
  ({ runConfiguration }: { runConfiguration: any }) => {
    const { constraints } = runConfiguration
    return { constraints }
  },
  (dispatch: (event: any) => any) => ({
    onChange: (constraint: any) => dispatch(addConstraint(constraint)),
  }),
)(ConstraintStep)
