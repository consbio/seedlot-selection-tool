import React, { ReactNode } from 'react'
import { connect } from 'react-redux'
import { t } from 'ttag'
import UnitButton from './UnitButton'

type RunConfigurationProps = {
  job: any
  children?: ReactNode
}

const RunConfiguration = ({ job, children = null }: RunConfigurationProps) => {
  let overlay = null

  if (job.isRunning) {
    let label = <h4 className="title is-4 is-size-5-mobile is-loading">{t`Calculating scores...`}</h4>

    if (job.queued) {
      label = (
        <div>
          <h4 className="title is-4 is-size-5-mobile is-loading">{t`Waiting for other jobs to finish...`}</h4>
          <div>
            {t`Another job is currently running. Your job is queued and will run as soon as other jobs are finished.`}
          </div>
        </div>
      )
    }

    overlay = (
      <div className="overlay">
        <div className="progress-container">
          {label}
          <progress />
        </div>
      </div>
    )
  }

  return (
    <div>
      {overlay}

      <div className="level mb-0">
        <div className="level-left" />
        <div className="level-right">
          <strong>{t`Units:`} </strong>
          <div className="tabs is-toggle is-inline-block is-small align-middle">
            <ul>
              <UnitButton name="metric">{t`Metric`}</UnitButton>
              <UnitButton name="imperial">{t`Imperial`}</UnitButton>
            </ul>
          </div>
        </div>
      </div>

      {children}
    </div>
  )
}

RunConfiguration.defaultProps = {
  children: null,
}

export default connect((state: any) => {
  const { job } = state

  return {
    job,
  }
})(RunConfiguration)
