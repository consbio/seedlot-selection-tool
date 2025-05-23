import React from 'react'
import { connect, ConnectedProps } from 'react-redux'
import ShapefileUpload from './ShapefileUpload'
import { removeConstraint } from '../actions/constraints'

const mapDispatchToProps = (dispatch: (event: any) => any) => {
  return {
    onRemove: (index: number) => {
      dispatch(removeConstraint(index))
    },
  }
}

const connector = connect(null, mapDispatchToProps)

type ShapefileConstraintProps = ConnectedProps<typeof connector> & {
  index: number
}

const ShapefileConstraint = ({ index, onRemove }: ShapefileConstraintProps) => {
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
        {/* Do not localize */}
        <strong>Shapefile</strong>
      </td>
      <td colSpan={2}>
        <ShapefileUpload index={index} storeTo="constraints" />
      </td>
    </tr>
  )
}

export default connector(ShapefileConstraint)
