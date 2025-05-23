import React from 'react'
import { connect } from 'react-redux'
import { removeConstraint } from '../actions/constraints'

type ConstraintProps = {
  children?: React.ReactNode | null
  className?: string
  index: number
  title: string
  value: number | string
  unit?: string
  onRemove: (index: number) => any
}

const Constraint = ({ children, className, index, title, value, unit, onRemove }: ConstraintProps) => {
  return (
    <tr className={`constraint ${className}`}>
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
        <strong>{title}</strong>
      </td>
      <td>
        {value}
        {Number.isNaN(value as any) ? '' : unit}
      </td>
      <td>{children}</td>
    </tr>
  )
}

Constraint.defaultProps = {
  children: null,
  className: '',
  unit: ''
}

export default connect(null, (dispatch: (event: any) => any) => ({
  onRemove: (index: number) => dispatch(removeConstraint(index)),
}))(Constraint)
