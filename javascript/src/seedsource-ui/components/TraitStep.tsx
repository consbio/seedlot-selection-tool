import React from 'react'
import { t } from 'ttag'
import { connect, ConnectedProps } from 'react-redux'
import ConfigurationStep from '../containers/ConfigurationStep'
import Traits from '../containers/Traits'

const connector = connect(({ runConfiguration }: { runConfiguration: any }) => {
  const { method } = runConfiguration

  return { method }
})

type TraitStepProps = ConnectedProps<typeof connector> & {
  number: number
}

const TraitStep = ({ number, method }: TraitStepProps) => {
  if (method !== 'trait') {
    return null
  }

  return (
    <ConfigurationStep title={t`Select traits`} number={number} name="traits" active>
      <Traits />
    </ConfigurationStep>
  )
}

export default connector(TraitStep)
