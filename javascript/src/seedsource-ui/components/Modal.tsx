import React from 'react'
import ReactDOM from 'react-dom'
import { t } from 'ttag'

type ModalProps = {
  active?: boolean
  closeButton?: boolean
  onHide?: () => any
}

type ModalState = {
  isActive: boolean
}

class Modal extends React.Component<ModalProps, ModalState> {
  static defaultProps = {
    active: false,
    closeButton: true,
    onHide: null,
  }

  constructor(props: ModalProps) {
    super(props)
    this.state = { isActive: false }
  }

  show() {
    this.setState({ isActive: true })
  }

  hide() {
    this.setState({ isActive: false })

    const { onHide = null } = this.props
    if (onHide !== null) {
      onHide()
    }
  }

  render() {
    const { children, closeButton, active } = this.props
    const { isActive } = this.state

    const activeClass = isActive || active ? 'is-active' : ''

    let closeButtonNode = null
    if (closeButton) {
      closeButtonNode = (
        <button type="button" className="modal-close is-large" aria-label={t`close`} onClick={this.hide.bind(this)} />
      )
    }

    const portalNode = document.getElementById('modal-portal')

    if (portalNode) {
      return ReactDOM.createPortal(
        <div className={`${activeClass} modal`}>
          <div className="modal-background" onClick={this.hide.bind(this)} />
          {children}
          {closeButtonNode}
        </div>,
        portalNode,
      )
    }
    return null
  }
}

export default Modal
