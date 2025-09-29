import React, { type ReactNode } from 'react'
import { t } from 'ttag'
import ModalCard from './ModalCard'

type AnnouncementModalProps = {
  announcementID: string
  title: string
  onClose: () => void
  children: ReactNode
}

class AnnouncementModal extends React.Component<AnnouncementModalProps> {
  modal?: ModalCard | null

  noShowCheckbox?: HTMLInputElement | null

  accept = () => {
    if (this.noShowCheckbox?.checked) {
      const { announcementID } = this.props
      localStorage.setItem(announcementID, 'true')
    }
    this.props.onClose()
    this.modal?.hide()
    window.dispatchEvent(new CustomEvent('announcement-dismissed'))
  }

  show() {
    const { announcementID } = this.props

    if (!localStorage.getItem(announcementID)) {
      this.modal?.show()
      setTimeout(() => {
        this.noShowCheckbox?.focus()
      }, 1)
    }
  }

  hide() {
    this.modal?.hide()
    window.dispatchEvent(new CustomEvent('announcement-dismissed'))
  }

  render() {
    const { title, children } = this.props

    const footer = (
      <div className="announcement-modal-footer">
        <button type="button" className="button is-primary" onClick={this.accept}>
          {t`Ok`}
        </button>
      </div>
    )

    return (
      <ModalCard
        ref={input => {
          this.modal = input
        }}
        title={title}
        footer={footer}
      >
        {children}
        <input
          type="checkbox"
          id="dontshow"
          className="is-checkradio is-info"
          ref={input => {
            this.noShowCheckbox = input
          }}
        />
        <label htmlFor="dontshow">{t`Don't show again`}</label>
      </ModalCard>
    )
  }
}

export default AnnouncementModal
