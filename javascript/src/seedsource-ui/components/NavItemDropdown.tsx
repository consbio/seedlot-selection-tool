import React from 'react'

type NavItemDropdownProps = {
  title: string
  right?: boolean
  className?: string
}

type NavItemDropdownState = {
  active: boolean
}

class NavItemDropdown extends React.Component<NavItemDropdownProps, NavItemDropdownState> {
  item?: HTMLElement

  static defaultProps = {
    right: false,
    className: '',
  }

  constructor(props: NavItemDropdownProps) {
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
    if (e.target !== this.item) {
      this.setState({ active: false })
    }
  }

  render() {
    const { active } = this.state
    const isActive = active ? 'is-active ' : ''
    const { title, right, className, children } = this.props

    return (
      <div className={`${isActive} navbar-item has-dropdown ${className}`}>
        <a
          className="navbar-link"
          onClick={() => this.setState({ active: !active })}
          ref={(input: HTMLAnchorElement) => {
            this.item = input
          }}
        >
          {title}
        </a>
        <div className={`${right ? 'is-right ' : ''}navbar-dropdown`}>{children}</div>
      </div>
    )
  }
}

export default NavItemDropdown
