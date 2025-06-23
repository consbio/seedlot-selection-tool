import React from 'react'
import ConstraintChooserItem from './ConstraintChooserItem'
import config from '../config'

type ConstraintChooserProps = {
  onAdd: (selection: any) => any
}

type ConstraintChooserState = {
  selections: any[]
}

class ConstraintChooser extends React.Component<ConstraintChooserProps, ConstraintChooserState> {
  constructor(props: any) {
    super(props)
    this.state = { selections: [null] }
  }

  render() {
    const { constraints } = config
    const { selections } = this.state
    const { onAdd } = this.props

    return (
      <div>
        <ConstraintChooserItem
          constraints={constraints.categories}
          selections={selections}
          onSelect={chosenSelections => {
            const selection = chosenSelections[chosenSelections.length - 1]
            if (selection !== null) {
              onAdd(selection)
              return this.setState({ selections: [null] })
            }
            return this.setState({ selections: chosenSelections })
          }}
        />
      </div>
    )
  }
}

export default ConstraintChooser
