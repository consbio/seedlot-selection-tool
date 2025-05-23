import React from 'react'
import { connect } from 'react-redux'
import { t, c } from 'ttag'
import Constraint from './Constraint'
import EditableLabel from '../components/EditableLabel'
import { updateConstraintValues } from '../actions/constraints'

type LatitudeConstraintProps = {
  index: number
  range: string
  value: string
  onRangeChange: (index: number, range: string) => any
}

const LatitudeConstraint = ({ index, value, range, onRangeChange }: LatitudeConstraintProps) => (
  <Constraint index={index} value={value} unit={`&deg;${c("Abbreviation of 'North'").t`N`}`} title={t`Latitude`}>
    <EditableLabel value={range} onChange={newRange => onRangeChange(index, newRange)}>
      <span>&nbsp;&deg;</span>
    </EditableLabel>
  </Constraint>
)

export default connect(
  ({ runConfiguration }: { runConfiguration: any }, { values }: { values: { range: number } }) => {
    const { y } = runConfiguration.point
    const range = values.range.toFixed(2)
    const value = y !== '' ? y.toFixed(2) : '--'

    return { value, range }
  },
  dispatch => {
    return {
      onRangeChange: (index: number, range: string) => {
        const rangeFloat = parseFloat(range)

        if (!Number.isNaN(rangeFloat)) {
          dispatch(updateConstraintValues(index, { range: rangeFloat }))
        }
      },
    }
  },
)(LatitudeConstraint)
