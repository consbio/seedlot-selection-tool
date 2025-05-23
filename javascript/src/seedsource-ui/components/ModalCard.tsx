import React, { ReactNode } from 'react'
import { t } from 'ttag'
import Modal from './Modal'

type ModalCardProps = {
  title: string
  footer?: ReactNode
  active?: boolean
  onHide?: () => any
  className?: string
}

class ModalCard extends React.Component<ModalCardProps> {
  modal?: Modal

  static defaultProps = {
    footer: null,
    active: false,
    onHide: null,
    className: '',
  }

  show() {
    this.modal?.show()
  }

  hide() {
    this.modal?.hide()
  }

  render() {
    const { title, children, footer, active, onHide, className } = this.props

    return (
      <Modal
        closeButton={false}
        ref={(input: Modal) => {
          this.modal = input
        }}
        active={active}
        onHide={onHide}
      >
        <div className={`modal-card ${className}`}>
          <header className="modal-card-head">
            <p className="modal-card-title">{title}</p>
            <button type="button" className="delete" aria-label={t`close`} onClick={() => this.modal?.hide()} />
          </header>
          <section className="modal-card-body">
            <div className="content">{children}</div>
          </section>
          <footer className="modal-card-foot">{footer}</footer>
        </div>
      </Modal>
    )
  }
}

export default ModalCard
