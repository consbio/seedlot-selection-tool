import React from 'react'
import { connect } from 'react-redux'
import { selectStep } from '../actions/step'
import { collapsibleSteps } from '../config'
import MoreIcon from '../../images/icon-more.svg'

type ExtraStepOption = {
  label: string
  callback: () => any
}

type ConfigurationStepProps = {
  active: boolean
  number: number
  title: string
  extraOptions?: ExtraStepOption[]
  className?: string
  children: any
  onClick: () => any
}

type ConfigurationStepState = {
  optionsMenuActive: boolean
}

class ConfigurationStep extends React.Component<ConfigurationStepProps, ConfigurationStepState> {
  static defaultProps = {
    extraOptions: [],
    className: '',
  }

  optionsRef: React.RefObject<HTMLDivElement>

  constructor(props: ConfigurationStepProps) {
    super(props)

    this.optionsRef = React.createRef()
    this.state = { optionsMenuActive: false }
  }

  toggleOptions = () => {
    const { optionsMenuActive } = this.state
    if (optionsMenuActive) {
      this.hideOptions()
    } else {
      this.showOptions()
    }
  }

  showOptions = () => {
    this.setState({ optionsMenuActive: true })
    window.document.body.addEventListener('click', this.handleBodyClick)
  }

  hideOptions = () => {
    this.setState({ optionsMenuActive: false })
    window.document.body.removeEventListener('click', this.handleBodyClick)
  }

  handleBodyClick = (e: MouseEvent) => {
    const { optionsMenuActive } = this.state
    if (
      !optionsMenuActive ||
      e.target === this.optionsRef?.current ||
      this.optionsRef?.current?.contains(e.target as Node)
    ) {
      return
    }

    this.hideOptions()
  }

  render() {
    const { number, title, children, active, extraOptions, className, onClick } = this.props
    const { optionsMenuActive } = this.state

    if (collapsibleSteps) {
      return (
        <div
          className={`configuration-step ${className}${active ? ' active' : ''}`}
          onClick={e => {
            e.stopPropagation()
            onClick()
          }}
        >
          <div className="gradient-top" />
          <h4>
            <div className="badge">{number}</div>
            <div>{title}</div>
          </h4>
          {children}
          <div className="gradient-bottom" />
        </div>
      )
    }

    return (
      <div className={`configuration-step no-collapse ${className}`}>
        <h4>
          <div className="badge">{number}</div>
          <div>{title}</div>
          <div className="spacer" />
          {extraOptions && extraOptions.length > 0 && (
            <div className={`options dropdown is-right ${optionsMenuActive ? 'is-active' : ''}`} ref={this.optionsRef}>
              <button
                type="button"
                onClick={this.toggleOptions}
                className={`dropdown-trigger ${optionsMenuActive ? 'active' : ''}`}
              >
                <img src={MoreIcon} alt="Extra options" />
              </button>
              <div className="dropdown-menu">
                <div className="dropdown-content">
                  {extraOptions.map(option => (
                    <a tabIndex={0} role="button" className="dropdown-item" onClick={() => option.callback()}>
                      {option.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}
        </h4>
        <div className="step-content">{children}</div>
      </div>
    )
  }
}

export default connect(null, (dispatch, { name }: { name: string }) => {
  return {
    onClick: () => {
      dispatch(selectStep(name))
    },
  }
})(ConfigurationStep)
