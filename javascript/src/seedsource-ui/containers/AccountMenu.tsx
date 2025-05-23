import React from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { t } from 'ttag'
import NavItemDropdown from '../components/NavItemDropdown'
import SignupModal from '../components/SignupModal'
import LoginModal from '../components/LoginModal'
import ResetPasswordModal from '../components/ResetPasswordModal'
import AccountSettingsModal from '../components/AccountSettingsModal'
import { login, logout } from '../actions/auth'
import { get } from '../io'

const connector = connect(
  ({ auth }: any) => auth,
  dispatch => ({
    onLogin: (email: string) => {
      dispatch(login(email))
    },

    onLogout: () => {
      get('/accounts/logout/').then(() => {
        dispatch(logout())
      })
    },

    checkLogin: () => {
      get('/accounts/user-info/')
        .then(response => {
          if (response.status < 200 || response.status >= 300) {
            throw new Error()
          }

          return response.json()
        })
        .then(json => dispatch(login(json.email)))
        .catch(() => dispatch(logout()))
    },
  }),
)

class AccountMenu extends React.Component<ConnectedProps<typeof connector>> {
  accountModal?: SignupModal | null

  loginModal?: LoginModal | null

  passwordModal?: ResetPasswordModal | null

  settingsModal?: AccountSettingsModal | null

  componentDidMount() {
    const { checkLogin } = this.props
    checkLogin()
  }

  render() {
    const { isLoggedIn, email, onLogin, onLogout } = this.props

    let dropdown = [
      <a className="navbar-item" onClick={() => this.accountModal?.show()} key="signup">
        {t`Create Account`}
      </a>,
      <a className="navbar-item" onClick={() => this.loginModal?.show()} key="signin">
        {t`Sign In`}
      </a>,
    ]

    if (isLoggedIn) {
      dropdown = [
        <div className="navbar-item is-size-7 has-text-grey" key="email">
          {email}
        </div>,
        <a className="navbar-item" onClick={() => this.settingsModal?.show()} key="settings">
          {t`Account Settings`}
        </a>,
        <a className="navbar-item" onClick={() => onLogout()} key="signout">
          {t`Sign Out`}
        </a>,
      ]
    }

    return [
      <div className="has-text-dark is-size-6" key="modals">
        <SignupModal
          ref={input => {
            this.accountModal = input
          }}
          onSignup={signupEmail => onLogin(signupEmail)}
        />
        <LoginModal
          ref={input => {
            this.loginModal = input
          }}
          onLogin={loginEmail => onLogin(loginEmail)}
          onResetPassword={() => {
            this.loginModal?.hide()
            this.passwordModal?.show()
          }}
        />
        <ResetPasswordModal
          ref={input => {
            this.passwordModal = input
          }}
        />
        <AccountSettingsModal
          ref={input => {
            this.settingsModal = input
          }}
          onChangeEmail={loginEmail => onLogin(loginEmail)}
        />
      </div>,
      <NavItemDropdown title={t`Account`} right key="menu">
        {dropdown}
      </NavItemDropdown>,
    ]
  }
}

export default connector(AccountMenu)
