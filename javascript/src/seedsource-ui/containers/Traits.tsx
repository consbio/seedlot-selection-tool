import React from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { t } from 'ttag'
import config from '../config'
import Trait from './Trait'
import { addTrait } from '../actions/traits'
import { selectSpecies } from '../actions/species'

const connector = connect(
  ({ runConfiguration }: { runConfiguration: { traits: any[]; species: any } }) => {
    const { traits, species } = runConfiguration
    const names = traits.map(item => item.name)
    const unusedTraits = config.functions
      .filter(item => item.species.includes(species))
      .filter(item => !names.includes(item.name))

    return { traits, unusedTraits, species }
  },
  (dispatch: (action: any) => any) => {
    return {
      onChange: (trait: any) => dispatch(addTrait(trait)),
      onSpeciesChange: (species: any) => dispatch(selectSpecies(species)),
    }
  },
)

class Traits extends React.Component<ConnectedProps<typeof connector>> {
  componentDidMount() {
    const { species, onSpeciesChange } = this.props
    onSpeciesChange(species)
  }

  render() {
    const { traits, unusedTraits, onChange } = this.props
    return (
      <>
        <table className="table is-fullwidth">
          <thead className="align-bottom is-size-7 has-text-weight-bold">
            <tr>
              <td />
              <th>{t`Name`}</th>
              <th>{t`Value`}</th>
              <th>{t`Transfer Limit (+/-)`}</th>
            </tr>
          </thead>
          <tbody>
            {traits.map((trait, index: number) => (
              <Trait key={trait.name} index={index} trait={trait} />
            ))}
          </tbody>
        </table>
        <div className="select is-fullwidth">
          <select
            value=""
            onChange={e => {
              e.preventDefault()
              onChange(e.target.value)
            }}
          >
            <option value="none">{t`Add a trait...`}</option>
            {unusedTraits.map(item => (
              <option value={item.name} key={item.name}>
                {item.name}: {item.label}
              </option>
            ))}
          </select>
        </div>
      </>
    )
  }
}

export default connector(Traits)
