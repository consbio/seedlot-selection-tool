import React from 'react'
import { connect, ConnectedProps } from 'react-redux'
import ReactTooltip from 'react-tooltip'
import { t } from 'ttag'
import EditableLabel from '../components/EditableLabel'
import { setFunctionTransfer, toggleFunction } from '../actions/customFunctions'

const connector = connect(null, (dispatch: (action: any) => any) => {
  return {
    onTransferChange: (id: string, transfer: number | null) => dispatch(setFunctionTransfer(id, transfer)),
    onToggleFunction: (id: string) => dispatch(toggleFunction(id)),
  }
})

type FunctionProps = ConnectedProps<typeof connector> & {
  customFunction: any
  activateModal: () => void
}

const Function = ({ customFunction, activateModal, onTransferChange, onToggleFunction }: FunctionProps) => {
  const { name, func, value, transfer, id } = customFunction

  return (
    <tr data-tip data-for={`${name}_Tooltip`}>
      <td>
        <a type="button" className="delete" onClick={() => onToggleFunction(id)} />
      </td>
      <td className="trait-label">
        <strong>{name}</strong>
      </td>
      <td>{value ? parseFloat(value).toFixed(2) : ''}</td>
      <td>
        <EditableLabel
          value={transfer || '--'}
          onChange={(newValue) => {
            const trnsfr = parseFloat(newValue)
            if (Number.isNaN(trnsfr)) {
              return onTransferChange(id, null)
            }
            onTransferChange(id, trnsfr)
          }}
        />
      </td>
      <td>
        <a
          type="button"
          className="icon-pencil-18"
          style={{ marginTop: '3px' }}
          onClick={e => {
            e.stopPropagation()
            activateModal()
          }}
        />
        <ReactTooltip id={`${name}_Tooltip`} className="variable-tooltip" place="right" effect="solid">
          <h5 className="title is-5 margin-bottom-5">{name}</h5>
          {func !== null ? <div className="is-size-7 has-text-grey-lighter">{func}</div> : null}
          <div>
            <span className="tooltip-label">{t`Value:`}</span>
            <strong>{value ? parseFloat(value).toFixed(2) : '--'}</strong>
          </div>
          <div>
            <span className="tooltip-label">{t`Transfer limit (+/-):`}</span>
            <strong>{transfer}</strong>
          </div>
        </ReactTooltip>
      </td>
    </tr>
  )
}

export default connector(Function)
