import React from 'react'
import { t } from 'ttag'
import ModalCard from './ModalCard'
import { put } from '../io'

type AccountSettingsModalProps = {
  onChangeEmail: (email: string | null) => any
}

type AccountSettingsModalState = {
  emailText: string | null
  passwordText: string | null
  confirmText: string | null
  emailError: string | null
  passwordError: string | null
  loading: boolean
}

class AccountSettingsModal extends React.Component<AccountSettingsModalProps, AccountSettingsModalState> {
  modal?: ModalCard | null

  constructor(props: any) {
    super(props)
    this.state = {
      emailText: null,
      passwordText: null,
      confirmText: null,
      emailError: null,
      passwordError: null,
      loading: false,
    }
  }

  show() {
    this.reset()
    this.modal?.show()
  }

  hide() {
    this.modal?.hide()
    this.reset()
  }

  reset() {
    this.setState({
      emailText: null,
      passwordText: null,
      confirmText: null,
      emailError: null,
      passwordError: null,
      loading: false,
    })
  }

  submitEmail() {
    const { emailText } = this.state
    const { onChangeEmail } = this.props

    if ((emailText || '').trim()) {
      put('/accounts/change-email/', { email: emailText })
        .then(response => {
          const { status } = response

          if (status === 400) {
            return response.json()
          }

          if (status < 200 || status >= 300) {
            throw new Error(t`Sorry, there was an unexpected error changing your email address`)
          }

          onChangeEmail(emailText)
          this.hide()

          return null
        })
        .then(json => {
          if (json) {
            if (json.email) {
              throw new Error(json.email)
            }

            throw new Error(t`Sorry, there was an unexpected error changing your email address`)
          }
        })
        .catch(err => {
          this.setState({ loading: false, emailError: err.message })
        })
    }
  }

  submitPassword() {
    const { passwordText, confirmText } = this.state

    if (passwordText !== confirmText) {
      this.setState({ passwordError: t`Passwords don't match` })
      return
    }

    if (passwordText) {
      put('/accounts/change-password/', { password: passwordText })
        .then(response => {
          const { status } = response

          if (status === 400) {
            return response.json()
          }

          if (status < 200 || status >= 300) {
            throw new Error(t`Sorry, there was an unexpected error changing your email address`)
          }

          this.hide()

          return null
        })
        .then(json => {
          if (json) {
            if (json.password) {
              throw new Error(json.password)
            }

            throw new Error(t`Sorry, there was an unexpected error changing your email address`)
          }
        })
        .catch(err => {
          this.setState({ loading: false, passwordError: err.message })
        })
    }
  }

  render() {
    const { emailText, passwordText, confirmText, emailError, passwordError, loading } = this.state

    let emailErrorNode = null
    if (emailError !== null) {
      emailErrorNode = (
        <article className="message is-danger">
          <div className="message-body">{emailError}</div>
        </article>
      )
    }

    let passwordErrorNode = null
    if (passwordError !== null) {
      passwordErrorNode = (
        <article className="message is-danger">
          <div className="message-body">{passwordError}</div>
        </article>
      )
    }

    return (
      <ModalCard
        ref={input => {
          this.modal = input
        }}
        title={t`Account Settings`}
      >
        <form
          onSubmit={e => {
            e.preventDefault()
            this.submitEmail()
          }}
        >
          {emailErrorNode}
          <div className="field">
            <label className="label">{t`Email address`}</label>
            <div className="control">
              <input
                className={`${emailError !== null ? 'is-danger' : ''} input`}
                type="text"
                placeholder={t`Email address`}
                name="username"
                value={emailText || ''}
                onChange={e => {
                  this.setState({ emailText: e.target.value })
                }}
                disabled={loading}
              />
            </div>
          </div>
          <div className="field">
            <div className="control">
              <button
                type="button"
                className={`${loading ? 'is-loading ' : ''}button is-primary`}
                onClick={() => this.submitEmail()}
                disabled={loading || !emailText}
              >
                {t`Change email`}
              </button>
            </div>
          </div>
        </form>
        <div>&nbsp;</div>
        <form
          onSubmit={e => {
            e.preventDefault()
            this.submitPassword()
          }}
        >
          {passwordErrorNode}
          <div className="field">
            <label className="label">{t`Password`}</label>
            <div className="control">
              <input
                className={`${passwordError !== null ? 'is-danger' : ''} input`}
                type="password"
                placeholder={t`Password`}
                name="password"
                value={passwordText || ''}
                onChange={e => {
                  this.setState({ passwordText: e.target.value })
                }}
                disabled={loading}
              />
            </div>
          </div>
          <div className="field">
            <div className="control">
              <input
                className="input"
                type="password"
                placeholder={t`Confirm password`}
                name="password"
                value={confirmText || ''}
                onChange={e => {
                  this.setState({ confirmText: e.target.value })
                }}
                disabled={loading}
              />
            </div>
          </div>
          <div className="field">
            <div className="control">
              <button
                type="button"
                className={`${loading ? 'is-loading ' : ''}button is-primary`}
                onClick={() => this.submitPassword()}
                disabled={loading || !passwordText || !confirmText}
              >
                {t`Change password`}
              </button>
            </div>
          </div>
        </form>
      </ModalCard>
    )
  }
}

export default AccountSettingsModal
