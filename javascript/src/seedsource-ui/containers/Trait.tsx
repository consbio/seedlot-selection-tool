import React from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { Tooltip } from 'react-tooltip'
import { t } from 'ttag'
import EditableLabel from '../components/EditableLabel'
import config from '../config'
import { removeTrait, setTraitTransfer } from '../actions/traits'

const connector = connect(
  (_: any, { trait }: { trait: any }) => {
    const traitConfig = config.functions.find(item => item.name === trait.name)
    return { trait, traitConfig }
  },
  (dispatch: (action: any) => any) => {
    return {
      onRemove: (index: number) => dispatch(removeTrait(index)),
      onTransferChange: (index: number, transfer: string) => dispatch(setTraitTransfer(index, parseFloat(transfer))),
    }
  },
)

type TraitProps = ConnectedProps<typeof connector> & {
  index: number
}

const Trait = ({ index, trait, traitConfig, onRemove, onTransferChange }: TraitProps) => {
  const { name, value } = trait
  const { customTransfer, label, units = null, description = null } = traitConfig
  const transfer = trait.transfer === null ? traitConfig.transfer : trait.transfer

  return (
    <tr id={`${name}-tooltip`}>
      <td>
        <a
          type="button"
          className="delete"
          onClick={e => {
            e.stopPropagation()
            onRemove(index)
          }}
        />
      </td>
      <td className="trait-label">
        <strong>{label}</strong>
      </td>
      <td>
        {value !== null ? value.toFixed(2) : '--'} {units}
      </td>
      <td>
        {customTransfer ? (
          <EditableLabel value={transfer} onChange={(newValue: string) => onTransferChange(index, newValue)} />
        ) : (
          transfer
        )}
        {units}
        <Tooltip anchorSelect={`#${name}-tooltip`} className="variable-tooltip" place="right" data-tooltip-float>
          <h5 className="title is-5 margin-bottom-5">{label}</h5>
          {description !== null ? <div className="is-size-7 has-text-grey-lighter">{description}</div> : null}
          <div>
            <span className="tooltip-label">{t`Value at point:`}</span>
            <strong>
              {value !== null ? value.toFixed(2) : '--'} {units}
            </strong>
          </div>
          <div>
            <span className="tooltip-label">{t`Transfer limit (+/-):`}</span>
            <strong>
              {transfer} {units}
            </strong>
          </div>
        </Tooltip>
      </td>
    </tr>
  )
}

export default connector(Trait)
