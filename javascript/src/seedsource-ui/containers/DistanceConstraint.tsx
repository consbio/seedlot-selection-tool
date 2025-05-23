import React from 'react'
import { connect } from 'react-redux'
import { t, c } from 'ttag'
import Constraint from './Constraint'
import EditableLabel from '../components/EditableLabel'
import { updateConstraintValues } from '../actions/constraints'

type DistanceConstraintProps = {
  index: number
  value: number | string
  range: number | string
  unit: string
  onRangeChange: (index: number, range: number | string, unit: string) => any
}

const DistanceConstraint = ({ index, value, range, unit, onRangeChange }: DistanceConstraintProps) => {
  const unitLabel = unit === 'metric' ? c("Abbreviation of 'kilometer'").t`km` : c("Abbreviation of 'mile'").t`mi`

  return (
    <Constraint index={index} value={value} title={t`Distance`}>
      <EditableLabel value={range} onChange={newRange => onRangeChange(index, newRange, unit)}>
        &nbsp;
        {unitLabel}
      </EditableLabel>
    </Constraint>
  )
}

export default connect(
  ({ runConfiguration }: { runConfiguration: any }, { values }: { values: any }) => {
    const { unit, point } = runConfiguration
    const { x, y } = point
    let { range } = values

    if (unit === 'imperial') {
      range /= 1.60934
    }

    const value = x === '' || y === '' ? '--' : `${y.toFixed(1)}, ${x.toFixed(1)}`
    range = Math.round(range)

    return { unit, value, range }
  },
  (dispatch: (event: any) => any) => ({
    onRangeChange: (index: number, range: number | string, unit: string) => {
      let rangeFloat = parseFloat(range as any)

      if (!Number.isNaN(rangeFloat)) {
        if (unit === 'imperial') {
          rangeFloat *= 1.60934
        }

        dispatch(updateConstraintValues(index, { range: rangeFloat }))
      }
    },
  }),
)(DistanceConstraint)
