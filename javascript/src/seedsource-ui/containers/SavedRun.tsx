import React, { useState } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { t, c } from 'ttag'
import { loadConfiguration, resetConfiguration, deleteSave } from '../actions/saves'
import { migrateConfiguration } from '../utils'
import ShareURL from '../components/ShareURL'
import ModalCard from '../components/ModalCard'

const connector = connect(null, (dispatch: (event: any) => any, { onClick }: { onClick: () => any }) => {
  return {
    onClick: () => {
      onClick()
    },

    onLoad: (migratedConfiguration: any, save: any) => {
      dispatch(resetConfiguration())
      /* In some cases where the loaded configuration is similar to the previous one, certain events aren't
       * fired if the event is dispatched in the same event cycle as the reset event
       */
      setTimeout(() => dispatch(loadConfiguration(migratedConfiguration, save)), 0)
    },

    onDelete: (saveId: string) => {
      dispatch(deleteSave(saveId))
    },
  }
})

type SavedRunProps = ConnectedProps<typeof connector> & {
  active: boolean
  save: any
}

const SavedRun = ({ active, save, onClick, onLoad, onDelete }: SavedRunProps) => {
  let className = 'configuration-item'
  let modal = null
  const { modified, title } = save
  const [modalToShow, setModalToShow] = useState<string>('')
  const [messages, setMessages] = useState<string[]>([])
  const [migratedConfiguration, setMigratedConfiguration] = useState<any>({})

  if (active) {
    className += ' focused'
  }

  if (modalToShow === 'confirm') {
    const footer = (
      <div style={{ width: '100%' }}>
        <button type="button" className="button" onClick={() => setModalToShow('')}>
          {t`Cancel`}
        </button>
        <button
          type="button"
          className="button is-primary is-pulled-right"
          onClick={() => {
            const migration = migrateConfiguration(save.configuration, save.version)
            setMessages(migration.messages)
            setMigratedConfiguration(migration.migratedConfiguration)
            setModalToShow('messages')
          }}
        >
          {t`Confirm`}
        </button>
      </div>
    )
    modal = (
      <ModalCard
        title={t`Load configuration?`}
        active={modalToShow === 'confirm'}
        onHide={() => setModalToShow('')}
        footer={footer}
      >
        {t`Loading this configuration will replace your current settings.`}
      </ModalCard>
    )
  }

  if (modalToShow === 'messages') {
    const text = messages.map(message => <li>{message}</li>)
    const onHide = () => {
      onLoad(migratedConfiguration, save)
      setModalToShow('')
    }
    const footer = (
      <div style={{ width: '100%' }}>
        <button type="button" onClick={onHide} className="button is-primary is-pulled-right">{t`OK`}</button>
      </div>
    )
    modal = (
      <ModalCard title={t`Notification`} active={modalToShow === 'messages'} onHide={onHide} footer={footer}>
        <div>{t`The following issue(s) were encountered while loading your saved run.`}</div>
        <ul>{text}</ul>
      </ModalCard>
    )
  }

  return (
    <div>
      {modal}
      <div
        className={className}
        onClick={() => {
          onClick()
        }}
      >
        <div className="save-title">{title}</div>
        <div className="save-date">
          {t`Last modified:`} {modified.getMonth() + 1}/{modified.getDate()}/{modified.getYear()}
        </div>
        <div className="buttons">
          <ShareURL configuration={save.configuration} version={save.version} />

          <div>
            <button type="button" onClick={() => setModalToShow('confirm')} className="button is-primary">
              <span className="icon-load-12" aria-hidden="true" /> &nbsp;{c('e.g., Load file').t`Load`}
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm(t`Delete this saved configuration?`)) {
                  onDelete(save.uuid)
                }
              }}
              className="button is-danger"
            >
              <span className="icon-trash-12" aria-hidden="true" /> &nbsp;{t`Delete`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default connector(SavedRun)
