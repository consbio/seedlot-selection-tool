import React from 'react'
import { t } from 'ttag'
import ModalCard from './ModalCard'

type AnnouncementModalProps = {
  announcementID: string
  title: string
  onClose: () => void
}

class AnnouncementModal extends React.Component<AnnouncementModalProps> {
  modal?: ModalCard | null
  noShowCheckbox?: HTMLInputElement | null

  show() {
    if (!localStorage.getItem(this.props.announcementID)) {
      this.modal?.show()
    }

    setTimeout(() => {
      this.noShowCheckbox?.focus()
    }, 1)
  }

  hide() {
    this.modal?.hide()
  }

  accept = () => {
    if (this.noShowCheckbox?.checked) {
      localStorage.setItem(this.props.announcementID, 'true')
    }
    this.props.onClose()
    this.modal?.hide()
  }

  render() {
    const { title, children } = this.props
    return (
      <ModalCard
        ref={input => {
          this.modal = input
        }}
        title={title}
        footer={
          <div className="announcement-modal-footer">
            <button type="button" className="button is-primary" onClick={this.accept}>
              {t`Ok`}
            </button>
          </div>
        }
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
