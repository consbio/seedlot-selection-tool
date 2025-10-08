import React from 'react'
import { connect } from 'react-redux'
import { t } from 'ttag'
import ModalCard from '../components/ModalCard'
import { clearError } from '../actions/error'

type ErrorModalProps = {
  show: boolean
  title: string
  message: string
  debugInfo?: string | null
  onHide: () => any
}

function ErrorModal({ show, title, message, debugInfo, onHide }: ErrorModalProps) {
  if (!show) {
    return null
  }

  const handleReportError = () => {
    window.dispatchEvent(
      new CustomEvent('reportError', {
        detail: { title, message, debugInfo },
      }),
    )
  }

  let debug = null

  if (debugInfo !== null) {
    const reportSection = (
      <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
        <div className="field is-grouped">
          <div className="control">
            <button type="button" className="button is-primary" onClick={handleReportError}>
              {t`Report This Error`}
            </button>
          </div>
          <div className="control">
            <button type="button" className="button" onClick={onHide}>
              {t`Close`}
            </button>
          </div>
        </div>
      </div>
    )

    debug = (
      <div>
        <div className="content">
          <p>{message}</p>
          <details>
            <summary>{t`Technical Details`}</summary>
            <pre className="error-debug-info" style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
              {debugInfo}
            </pre>
          </details>
        </div>
        {reportSection}
      </div>
    )
  } else {
    debug = (
      <div>
        <div className="content">
          <p>{message}</p>
        </div>
        <div className="field is-grouped is-grouped-right" style={{ marginTop: '1rem' }}>
          <div className="control">
            <button type="button" className="button" onClick={onHide}>
              {t`Close`}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ModalCard title={title} onHide={() => onHide()} active>
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
