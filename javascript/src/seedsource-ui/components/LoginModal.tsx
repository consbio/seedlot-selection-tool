import React from 'react'
import { t } from 'ttag'
import ModalCard from './ModalCard'
import SocialLogin from './SocialLogin'
import { post } from '../io'

type LoginModalProps = {
  onLogin: (email: string | null) => any
  onResetPassword: () => any
}

type LoginModalState = {
  emailText: string | null
  passwordText: string | null
  loading: boolean
  error: string | null
}

class LoginModal extends React.Component<LoginModalProps, LoginModalState> {
  modal?: ModalCard | null

  emailInput?: HTMLInputElement | null

  constructor(props: LoginModalProps) {
    super(props)
    this.state = { emailText: null, passwordText: null, loading: false, error: null }
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
    this.setState({ emailText: null, passwordText: null, loading: false, error: null })
  }

  submit() {
    const { emailText, passwordText } = this.state
    const { onLogin } = this.props

    if (emailText && passwordText) {
      this.setState({ loading: true, error: null })

      post('/accounts/login/', { email: emailText, password: passwordText })
        .then(response => {
          const { status } = response

          if (status >= 200 && status < 300) {
            onLogin(emailText)
            this.hide()
          } else {
            throw new Error('Login failed')
          }
        })
        .catch(() => {
          this.setState({ loading: false, error: t`Login failed` })
        })
    }
  }

  render() {
    const { emailText, passwordText, loading, error } = this.state
    const { onResetPassword } = this.props

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
        ref={input => {
          this.modal = input
        }}
        title={t`Sign In`}
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
                ref={input => {
                  this.emailInput = input
                }}
                className="input"
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
            <a className="is-pulled-right is-size-7 is-clearfix" onClick={() => onResetPassword()}>
              {t`Forgot your password?`}
            </a>
            <div className="is-clearfix" />
          </div>
          <div className="field">
            <div className="control">
              <button
                type="button"
                className={`${loading ? 'is-loading ' : ''}button is-fullwidth is-primary`}
                onClick={() => this.submit()}
                disabled={loading}
              >
                {t`Sign In`}
              </button>
            </div>
          </div>
        </form>
      </ModalCard>
    )
  }
}

export default LoginModal
