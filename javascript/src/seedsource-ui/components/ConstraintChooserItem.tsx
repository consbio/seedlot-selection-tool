import React from 'react'
import { t } from 'ttag'

type ConstraintChooserItemProps = {
  constraints: any[]
  selections: any[]
  onSelect: (selections: any[]) => any
}

const ConstraintChooserItem = ({ constraints, selections, onSelect }: ConstraintChooserItemProps) => {
  const selection = selections[0]
  const nextSelections = selections.slice(1)

  const node = (
    <div className="select is-fullwidth">
      <select
        value={selection || ''}
        onChange={e => {
          const selectionItem = e.target.value || null
          const constraint = constraints.find(item => item.name === selectionItem)

          if (selectionItem === null) {
            onSelect([null])
          } else if (constraint.type === 'category') {
            onSelect([selectionItem, null])
          } else {
            onSelect([selectionItem])
          }
        }}
      >
        <option value="">{t`Select...`}</option>
        {constraints.map(constraint => {
          const { name, label } = constraint
          return (
            <option key={name} value={name}>
              {label}
            </option>
          )
        })}
      </select>
    </div>
  )

  if (nextSelections.length > 0) {
    const constraint = constraints.find(item => item.name === selection)

    return (
      <>
        {node}
        <div className="constraint-arrow" />
        <ConstraintChooserItem
          selections={nextSelections}
          constraints={constraint.items}
          onSelect={subSelections => onSelect([selection, ...subSelections])}
        />
      </>
    )
  }

  return node
}

export default ConstraintChooserItem
