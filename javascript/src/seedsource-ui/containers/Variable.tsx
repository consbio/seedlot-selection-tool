import React from 'react'
import { connect, ConnectedProps } from 'react-redux'
import ReactTooltip from 'react-tooltip'
import { t } from 'ttag'
import EditableLabel from '../components/EditableLabel'
import { modifyVariable, resetTransfer, removeVariable } from '../actions/variables'
import { toggleLayer } from '../actions/layers'
import { variables as allVariables } from '../config'

const connector = connect(
  (state: any, { variable }: { variable: any }) => {
    const { layers, runConfiguration } = state
    const active = !!layers.find((layer: any) => layer.name === variable.name && layer.displayed === true)
    const { objective, unit, method, center, customMode } = runConfiguration
    const variableConfig = allVariables.find(item => item.name === variable.name)
    let { value, zoneCenter, transfer, avgTransfer, transferIsModified, customCenter } = variable
    const { name } = variable
    const { label, multiplier, units } = variableConfig as any

    transferIsModified = transferIsModified && method === 'seedzone'

    const convert = (number: number) => {
      if (number !== null) {
        let convertedNumber = number / multiplier

        let { precision } = units.metric

        if (unit === 'imperial') {
          precision = units.imperial.precision
          convertedNumber = units.imperial.convert(convertedNumber)
        }

        return convertedNumber.toFixed(precision)
      }

      return number
    }

    const convertTransfer = (number: number) => {
      if (number === null) {
        return '--'
      }

      const convertedNumber = number / multiplier

      let { transferPrecision } = units.metric

      if (unit === 'imperial') {
        const { convertTransfer: subConvertTransfer, convert: subConvert } = units.imperial
        transferPrecision = units.imperial.transferPrecision

        if (subConvertTransfer) {
          return subConvertTransfer(convertedNumber).toFixed(transferPrecision)
        }
        if (subConvert !== null) {
          return subConvert(convertedNumber).toFixed(transferPrecision)
        }
      }

      return convertedNumber.toFixed(transferPrecision)
    }

    transfer = convertTransfer(transfer)
    avgTransfer = convertTransfer(avgTransfer)
    value = convert(value)
    zoneCenter = convert(zoneCenter)
    customCenter = convert(customCenter)

    let centerValue = method === 'seedzone' && center === 'zone' && objective === 'sites' ? zoneCenter : value
    if (customMode) {
      centerValue = customCenter
    }

    return {
      active,
      name,
      label,
      value,
      zoneCenter,
      transfer,
      avgTransfer,
      transferIsModified,
      unit,
      units,
      method,
      centerValue,
      customMode,
    }
  },
  (dispatch: (action: any) => any, { variable, index }: { variable: any; index: number }) => {
    return {
      onTransferChange: (transfer: string, unit: string, units: any) => {
        let value = parseFloat(transfer)

        if (!Number.isNaN(value)) {
          if (unit === 'imperial' && units !== null) {
            if (units.metric.convertTransfer) {
              value = units.metric.convertTransfer(value)
            } else if (units.metric.convert !== null) {
              value = units.metric.convert(value)
            }
          }

          const variableConfig = allVariables.find(item => item.name === variable.name)

          if (variableConfig) {
            dispatch(modifyVariable(variable.name, { transfer: value * variableConfig.multiplier }))
          }
        }
      },

      onResetTransfer: () => {
        dispatch(resetTransfer(variable.name))
      },

      onCenterChange: (center: string, unit: string, units: any) => {
        let value = parseFloat(center)

        if (!Number.isNaN(value)) {
          if (unit === 'imperial' && units !== null) {
            if (units.metric.convert !== null) {
              value = units.metric.convert(value)
            }
          }
          const variableConfig = allVariables.find(item => item.name === variable.name)

          if (variableConfig) {
            dispatch(modifyVariable(variable.name, { customCenter: value * variableConfig.multiplier }))
          }
        }
      },

      onToggle: () => {
        dispatch(toggleLayer(`variable-${variable.name}`))
      },

      onRemove: () => {
        dispatch(removeVariable(variable.name, index))
      },
    }
  },
)

const Variable = (props: ConnectedProps<typeof connector>) => {
  const {
    active,
    name,
    label,
    value,
    zoneCenter,
    transfer,
    avgTransfer,
    transferIsModified,
    unit,
    units,
    method,
    centerValue,
    onTransferChange,
    onResetTransfer,
    onToggle,
    onRemove,
    customMode,
    onCenterChange,
  } = props

  let center
  if (centerValue === null) {
    center = <span className="has-text-grey-light">--</span>
  } else {
    center = (
      <span>
        {centerValue} {units[unit].label}
      </span>
    )
  }

  let climaticCenter = null
  if (zoneCenter !== null) {
    climaticCenter = (
      <div>
        <span className="tooltip-label">{t`Zone climatic center:`}</span>
        <strong>
          {zoneCenter} {units[unit].label}
        </strong>
      </div>
    )
  }

  return (
    <tr className={active ? 'visible' : ''} data-tip data-for={`${name}_Tooltip`}>
      <td>
        <a
          type="button"
          className="delete"
          onClick={e => {
            e.stopPropagation()
            onRemove()
          }}
        />
      </td>
      <td>
        <div className={`modify-status ${transferIsModified ? 'modified' : ''}`}>&nbsp;</div>
        <strong>{name}</strong>
      </td>
      <td>
        {customMode ? (
          <EditableLabel value={centerValue || '--'} onChange={newValue => onCenterChange(newValue, unit, units)}>
            &nbsp;{units[unit].label}
          </EditableLabel>
        ) : (
          center
        )}
      </td>
      <td>
        {transferIsModified && method ? (
          <div className="transfer-reset" onClick={() => onResetTransfer()}>
            reset
          </div>
        ) : null}
        <EditableLabel value={transfer} onChange={newValue => onTransferChange(newValue, unit, units)}>
          &nbsp;{units[unit].label}
        </EditableLabel>
      </td>
      <td>
        <span
          className="visibility-toggle icon-eye-16"
          onClick={e => {
            e.stopPropagation()
            onToggle()
          }}
        />

        <ReactTooltip id={`${name}_Tooltip`} className="variable-tooltip" place="right" effect="solid">
          <h5 className="title is-5 margin-bottom-5">
            {name}: {label}
          </h5>
          <div>
            <span className="tooltip-label">{customMode ? t`Custom value:` : t`Value at point:`}</span>{' '}
            <strong>{value}</strong>
          </div>
          <div>
            <span className="tooltip-label">{t`Transfer limit (+/-):`}</span>
            <strong>
              {transfer} {units[unit].label} {transferIsModified ? `(${t`modified`})` : ''}
            </strong>
          </div>
          <div>
            <span className="tooltip-label">{t`Avg.transfer limit for zone set:`}</span>
            <strong>
              {avgTransfer} {units[unit].label}
            </strong>
          </div>
          {climaticCenter}
        </ReactTooltip>
      </td>
    </tr>
  )
}

export default connector(Variable)
