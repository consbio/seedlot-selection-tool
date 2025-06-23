import React from 'react'
import { connect } from 'react-redux'
import { t, c } from 'ttag'
import Constraint from './Constraint'
import EditableLabel from '../components/EditableLabel'
import { updateConstraintValues } from '../actions/constraints'

type ElevationConstraintProps = {
  index: number
  range: number
  value: number | string
  unit: string
  onRangeChange: (index: number, range: string, unit: string) => any
}

const ElevationConstraint = ({ index, value, range, unit, onRangeChange }: ElevationConstraintProps) => {
  const unitLabel =
    unit === 'metric' ? c("Abbreviation of 'meters'").t`m` : c("Abbreviation of 'feet' (measurement)").t`ft`

  return (
    <Constraint index={index} value={value} unit={unitLabel} title={t`Elevation`}>
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
    let { range } = values
    let value = point.elevation

    if (value === null) {
      value = '--'
    } else {
      if (unit === 'imperial') {
        value /= 0.3048
        range /= 0.3048
      }

      value = Math.round(value)
      range = Math.round(range)
    }

    return { unit, value, range }
  },
  (dispatch: (action: any) => any) => {
    return {
      onRangeChange: (index: number, range: string, unit: string) => {
        let rangeFloat = parseFloat(range)

        if (!Number.isNaN(rangeFloat)) {
          if (unit === 'imperial') {
            rangeFloat *= 0.3048
          }

          dispatch(updateConstraintValues(index, { range: rangeFloat }))
        }
      },
    }
  },
)(ElevationConstraint)
