import React from 'react'
import { c, t } from 'ttag'
import ModalCard from './ModalCard'
import { post } from '../io'

type ResetPasswordModalState = {
  emailText: string | null
  submitted: boolean
  loading: boolean
  error: string | null
}

class ResetPasswordModal extends React.Component<{}, ResetPasswordModalState> {
  modal?: ModalCard | null

  emailInput?: HTMLInputElement | null

  constructor(props: any) {
    super(props)
    this.state = { emailText: null, submitted: false, loading: false, error: null }
  }

  show() {
    this.reset()
    this.modal?.show()

    setTimeout(() => this.emailInput?.focus(), 1)
  }

  hide() {
    this.modal?.hide()
    this.reset()
  }

  reset() {
    this.setState({ emailText: null, submitted: false, loading: false, error: null })
  }

  submit() {
    const { emailText } = this.state

    if ((emailText || '').trim()) {
      post('/accounts/lost-password/', { email: emailText })
        .then(response => {
          const { status } = response

          if (status === 400) {
            return response.json()
          }

          if (status < 200 || status >= 300) {
            throw new Error(t`Sorry, there was an error resetting your password`)
          }

          this.setState({ submitted: true, loading: false })

          return null
        })
        .then(json => {
          if (json) {
            const { email } = json

            if (email) {
              throw new Error(email)
            }
          }
        })
        .catch(err => {
          this.setState({ loading: false, error: err.message })
        })
    }
  }

  render() {
    const { emailText, submitted, loading, error } = this.state
    let content

    if (submitted) {
      content = (
        <article className="message is-success">
          <div className="message-body">
            {t`An email has been sent with a link to reset your password. 
            If you don't receive this email, please check your Spam folder.`}
          </div>
        </article>
      )
    } else {
      let errorNode = null
      if (error !== null) {
        errorNode = (
          <article className="message is-danger">
            <div className="message-body">{error}</div>
          </article>
        )
      }

      content = (
        <form
          onSubmit={e => {
            e.preventDefault()
            this.submit()
          }}
        >
          <article className="message is-dark">
            <div className="message-body">
              {t`Enter your email address to receive an email with a link to reset your password.`}
            </div>
          </article>
          {errorNode}
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
              <button
                type="button"
                className={`${loading ? 'is-loading ' : ''}button is-fullwidth is-primary`}
                onClick={() => this.submit()}
                disabled={loading || !(emailText || '').trim()}
              >
                {c('i.e., hyperlink').t`Send link`}
              </button>
            </div>
          </div>
        </form>
      )
    }

    return (
      <ModalCard
        ref={input => {
          this.modal = input
        }}
        title={t`Reset Password`}
      >
        {content}
      </ModalCard>
    )
  }
}

export default ResetPasswordModal
