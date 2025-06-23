import React from 'react'
import { t } from 'ttag'
import { connect, ConnectedProps } from 'react-redux'
import ConfigurationStep from './ConfigurationStep'
import CustomFunctions from './CustomFunctions'

const connector = connect(({ runConfiguration }: { runConfiguration: any }) => {
  const { method } = runConfiguration

  return { method }
})

type CustomFunctionProps = ConnectedProps<typeof connector> & {
  number: number
}

const CustomFunctionStep = ({ number, method }: CustomFunctionProps) => {
  if (method !== 'function') {
    return null
  }

  return (
    <ConfigurationStep title={t`Select functions`} number={number} name="functions" active>
      <CustomFunctions />
    </ConfigurationStep>
  )
}

CustomFunctionStep.shouldRender = ({ runConfiguration }: { runConfiguration: any }) =>
  runConfiguration.method === 'function'

export default connector(CustomFunctionStep)
