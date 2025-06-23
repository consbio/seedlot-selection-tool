import React from 'react'
import { connect } from 'react-redux'
import { t, c } from 'ttag'
import Constraint from './Constraint'
import EditableLabel from '../components/EditableLabel'
import { updateConstraintValues } from '../actions/constraints'

type LongitudeConstraintProps = {
  index: number
  value: string | number
  range: string | number
  onRangeChange: (index: number, range: string) => any
}

const LongitudeConstraint = ({ index, value, range, onRangeChange }: LongitudeConstraintProps) => (
  <Constraint index={index} value={value} unit={`&deg;${c("Abbreviation of 'East'").t`E`}`} title={t`Longitude`}>
    <EditableLabel value={range} onChange={newRange => onRangeChange(index, newRange)}>
      <span>&nbsp;&deg;</span>
    </EditableLabel>
  </Constraint>
)

export default connect(
  ({ runConfiguration }: { runConfiguration: any }, { values }: { values: any }) => {
    const { x } = runConfiguration.point
    let { range } = values

    const value = x !== '' ? x.toFixed(2) : '--'
    range = range.toFixed(2)

    return { value, range }
  },
  dispatch => ({
    onRangeChange: (index: number, range: string) => {
      const rangeFloat = parseFloat(range)

      if (!Number.isNaN(rangeFloat)) {
        dispatch(updateConstraintValues(index, { range: rangeFloat }))
      }
    },
  }),
)(LongitudeConstraint)
