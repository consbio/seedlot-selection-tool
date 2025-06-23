import React from 'react'
import { connect } from 'react-redux'
import { t, c, jt } from 'ttag'
import ModalCard from '../components/ModalCard'
import { clearError } from '../actions/error'

type ErrorModalProps = {
  show: boolean
  title: string
  message: string
  debugInfo?: string | null
  onHide: () => any
}

const ErrorModal = ({ show, title, message, debugInfo, onHide }: ErrorModalProps) => {
  if (!show) {
    return null
  }

  let debug = null

  if (debugInfo !== null) {
    const reportAnIssue = (
      <a href="https://github.com/consbio/seedlot-selection-tool/issues" target="_blank" rel="noreferrer">
        {c("This is the value of 'reportAnIssue'").t`report an issue`}
      </a>
    )

    debug = (
      <div>
        <p>{jt`If the problem persists, please ${reportAnIssue} and include the following information:`}</p>
        <pre className="error-debug-info">{debugInfo}</pre>
      </div>
    )
  }

  return (
    <ModalCard title={title} onHide={() => onHide()} active>
      <p>{message}</p>
      {debug}
    </ModalCard>
  )
}

ErrorModal.defaultProps = {
  debugInfo: null,
}

export default connect(
  ({ error }: { error?: { title: string; message: string; debugInfo?: string } }) => {
    if (!error) {
      return { show: false, title: '', message: '', debugInfo: null }
    }

    const { title, message, debugInfo = null } = error

    return {
      show: true,
      title,
      message,
      debugInfo,
    }
  },
  dispatch => {
    return {
      onHide: () => dispatch(clearError()),
    }
  },
)(ErrorModal)
