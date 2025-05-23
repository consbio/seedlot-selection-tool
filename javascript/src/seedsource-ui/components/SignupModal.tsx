import React from 'react'
import { t } from 'ttag'
import ModalCard from './ModalCard'
import SocialLogin from './SocialLogin'
import { post } from '../io'

type SignupModalProps = {
  onSignup: (email: string) => any
}

type SignupModalState = {
  emailText: string | null
  passwordText: string | null
  confirmText: string | null
  loading: boolean
  error: string | null
  emailError: boolean
}

class SignupModal extends React.Component<SignupModalProps, SignupModalState> {
  modal?: ModalCard

  emailInput?: HTMLInputElement

  constructor(props: SignupModalProps) {
    super(props)
    this.state = {
      emailText: null,
      passwordText: null,
      confirmText: null,
      loading: false,
      error: null,
      emailError: false,
    }
  }

  show() {
    this.reset()
    this.modal?.show()

    setTimeout(() => {
      this.emailInput?.focus()
    }, 1)
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
      loading: false,
      error: null,
      emailError: false,
    })
  }

  submit() {
    const { emailText, passwordText, confirmText } = this.state
    const { onSignup } = this.props

    if (passwordText !== confirmText) {
      this.setState({ error: t`Passwords don't match` })
      return
    }

    if (emailText && passwordText) {
      this.setState({ loading: true, error: null, emailError: false })

      post('/accounts/create-account/', { email: emailText, password: passwordText })
        .then(response => {
          const { status } = response

          if (status === 400) {
            return response.json()
          }

          if (status < 200 || status >= 300) {
            throw new Error(t`There was an unexpected error while creating your account`)
          }

          onSignup(emailText)
          this.hide()

          return false
        })
        .then(json => {
          if (json) {
            if (json.email) {
              this.setState({ emailError: true })
              throw new Error(json.email)
            }

            throw new Error(t`There was an unexpected error while creating your account`)
          }
        })
        .catch(err => {
          this.setState({ loading: false, error: err.message })
        })
    }
  }

  render() {
    const { emailText, passwordText, confirmText, loading, error, emailError } = this.state

    let errorNode = null
    if (error !== null) {
      errorNode = (
        <article className="message is-danger">
          <div className="message-body">{error}</div>
        </article>
      )
    }

    return (
      <ModalCard
        ref={(input: ModalCard) => {
          this.modal = input
        }}
        title={t`Create Account`}
      >
        {errorNode}
        <form
          onSubmit={e => {
            e.preventDefault()
            this.submit()
          }}
        >
          <div className="field">
            <div className="control">
              <input
                ref={(input: HTMLInputElement) => {
                  this.emailInput = input
                }}
                className={`${emailError ? 'is-danger' : ''} input`}
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
              <input
                className="input"
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
                className={`${loading ? 'is-loading ' : ''}button is-fullwidth is-primary`}
                onClick={() => this.submit()}
                disabled={loading}
              >
                {t`Create Account`}
              </button>
            </div>
          </div>
        </form>
        <hr />
        <SocialLogin />
      </ModalCard>
    )
  }
}

export default SignupModal
