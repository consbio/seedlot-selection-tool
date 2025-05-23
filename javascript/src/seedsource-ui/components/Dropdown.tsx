import React, { ReactNode } from 'react'

type DropdownProps = {
  title: string
  up?: boolean
  disabled?: boolean
  className?: string
  children?: ReactNode
}

type DropdownState = {
  active: boolean
}

class Dropdown extends React.Component<DropdownProps, DropdownState> {
  button?: HTMLButtonElement

  static defaultProps = {
    up: false,
    disabled: false,
    className: '',
    children: null,
  }

  constructor(props: any) {
    super(props)
    this.state = { active: false }

    this.handleBodyClick = this.handleBodyClick.bind(this)
  }

  componentDidMount() {
    window.document.body.addEventListener('click', this.handleBodyClick)
  }

  componentWillUnmount() {
    window.document.body.removeEventListener('click', this.handleBodyClick)
  }

  handleBodyClick(e: MouseEvent) {
    if (e.target !== this.button && !this.button?.contains(e.target as Node)) {
      this.setState({ active: false })
    }
  }

  render() {
    const { active } = this.state
    const isActive = active ? 'is-active' : ''
    const { title, up, disabled, className, children } = this.props

    return (
      <div className={`${(up ? 'is-up ' : '') + isActive} dropdown ${className}`}>
        <div className="dropdown-trigger">
          <button
            type="button"
            className="button"
            disabled={disabled}
            ref={input => {
              if (input) {
                this.button = input
              }
            }}
            onClick={() => {
              this.setState({ active: !active })
            }}
          >
            <span>{title}</span>
            <span className="icon is-small">
              <i className={up ? 'icon-chevron-top-12' : 'icon-chevron-bottom-12'} />
            </span>
          </button>
        </div>
        <div className="dropdown-menu">
          <div className="dropdown-content">{children}</div>
        </div>
      </div>
    )
  }
}

export default Dropdown
