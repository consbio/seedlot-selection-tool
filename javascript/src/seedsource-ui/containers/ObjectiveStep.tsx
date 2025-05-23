import React from 'react'
import { t } from 'ttag'
import { connect, ConnectedProps } from 'react-redux'
import ConfigurationStep from './ConfigurationStep'
import ObjectiveButton from './ObjectiveButton'

const connector = connect(({ runConfiguration }: { runConfiguration: any }) => {
  const { objective } = runConfiguration

  return { objective }
})

type ObjectiveStepProps = ConnectedProps<typeof connector> & {
  number: number
  active: boolean
}

const ObjectiveStep = ({ number, active, objective }: ObjectiveStepProps) => {
  if (!active) {
    return (
      <ConfigurationStep title={t`Select objective`} number={number} name="objective" active={false}>
        <div>{objective === 'seedlots' ? t`Find seedlots` : t`Find planting sites`}</div>
      </ConfigurationStep>
    )
  }

  return (
    <ConfigurationStep title={t`Select objective`} number={number} name="objective" active>
      <div className="tabs is-toggle is-small">
        <ul>
          <ObjectiveButton name="seedlots">{t`Find seedlots`}</ObjectiveButton>
          <ObjectiveButton name="sites">{t`Find planting sites`}</ObjectiveButton>
        </ul>
      </div>
    </ConfigurationStep>
  )
}

export default connector(ObjectiveStep)
