import React from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { removeConstraint } from '../actions/constraints'
import { formatClimate } from '../utils'

const connector = connect(
  ({ runConfiguration }: { runConfiguration: any }, { index }: { index: number }) => {
    const { climate, constraints, objective } = runConfiguration
    const { time, model } = objective === 'seedlots' ? climate.seedlot : climate.site
    const constraint = constraints[index]
    const { species, label, isRegion } = constraint.values

    const props = {
      species,
      label,
    } as { species: any; label: string; year?: string | null; model?: string | null }

    if (!isRegion) {
      // Region constrains don't vary by time or model
      props.year = time
      props.model = model
    }

    return props
  },
  (dispatch: (action: any) => any) => {
    return {
      onRemove: (index: number) => {
        dispatch(removeConstraint(index))
      },
    }
  },
)

type SpeciesConstraintProps = ConnectedProps<typeof connector> & {
  index: number
}

const SpeciesConstraint = ({ index, label, model = null, year = null, onRemove }: SpeciesConstraintProps) => {
  return (
    <tr className="constraint">
      <td>
        <a
          className="delete"
          onClick={e => {
            e.stopPropagation()
            onRemove(index)
          }}
        />
      </td>
      <td>
        <strong>{label}</strong>
      </td>
      <td colSpan={2}>{year === null ? null : formatClimate(year, model!)}</td>
    </tr>
  )
}

export default connector(SpeciesConstraint)
