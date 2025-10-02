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

const helpTooltip = (
  <>
    <p>
      <strong>{t`Find seedlots:`}</strong>&nbsp;
      {t`Select this option if you are looking for where you want to source your seedlots
      from to plant at a particular location. The objective of finding seedlots for a planting site is to indicate where
      one would locate seedlots that would be adapted to a past, current, or future climate at a planting site. Running
      the tool will generate a heat map of potential seedlots that are suitable to plant at your selected location.`}
    </p>
    <br />
    <p>
      <strong>{t`Find planting sites:`}</strong>&nbsp;
      {t`Select this option if you want to find planting sites for seedlots that you
      already have. The objective of finding planting sites for a seedlot is to indicate where the current or future
      climate matches the conditions to which the seedlot is suited. This is the inverse of the first option.`}
    </p>
  </>
)

const ObjectiveStep = ({ number, active, objective }: ObjectiveStepProps) => {
  if (!active) {
    return (
      <ConfigurationStep title={t`Select objective`} number={number} name="objective" active={false}>
        <div>{objective === 'seedlots' ? t`Find seedlots` : t`Find planting sites`}</div>
      </ConfigurationStep>
    )
  }

  return (
    <ConfigurationStep title={t`Select objective`} number={number} name="objective" active helpTooltip={helpTooltip}>
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
