import React from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { t, c, jt } from 'ttag'
import ModalCard from '../components/ModalCard'
import { hideSaveModal, createSave, updateSave } from '../actions/saves'

const months = [
  t`January`,
  t`February`,
  c('month').t`March`,
  c('month').t`April`,
  c('month').t`May`,
  t`June`,
  t`July`,
  t`August`,
  t`September`,
  t`October`,
  t`November`,
  t`December`,
]

const connector = connect(
  ({ saves, runConfiguration }: { saves: any; runConfiguration: any }) => {
    const { showModal, lastSave, isSaving } = saves

    return { showModal, lastSave, isSaving, runConfiguration }
  },
  (dispatch: (event: any) => any) => {
    return {
      onHide: () => {
        dispatch(hideSaveModal())
      },

      onSave: (configuration: any, title: string) => {
        dispatch(createSave(configuration, title))
      },

      onUpdate: (configuration: any, lastSave: any) => {
        dispatch(updateSave(configuration, lastSave))
      },
    }
  },
)

type SaveModalProps = ConnectedProps<typeof connector> & {
  showModal: boolean
}

type SaveModalState = {
  overwrite: boolean
  title: string
}

class SaveModal extends React.Component<SaveModalProps, SaveModalState> {
  titleInput?: HTMLInputElement

  constructor(props: any) {
    super(props)
    this.state = { overwrite: false, title: '' }
  }

  componentDidUpdate(prevProps: SaveModalProps) {
    const { showModal } = this.props

    if (showModal && !prevProps.showModal) {
      const today = new Date()
      const title = `${t`Saved run`} - ${months[today.getMonth()]} ${today.getDate()}, ${today.getFullYear()}`

      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ overwrite: false, title })

      setTimeout(() => {
        this.titleInput?.focus()
        this.titleInput?.select()
      }, 1)
    }
  }

  render() {
    const { showModal, lastSave, runConfiguration, onHide, onSave, onUpdate } = this.props
    const { title, overwrite } = this.state
    let body

    if (lastSave === null || overwrite) {
      body = (
        <form
          onSubmit={e => {
            e.preventDefault()

            if (title) {
              onSave(runConfiguration, title)
            }
          }}
        >
          <label className="control-label">{t`Title`}</label>
          <input
            type="text"
            data-lpignore="true"
            className="input"
            value={title}
            required
            onChange={e => {
              this.setState({ title: e.target.value })
            }}
            ref={input => {
              if (input) {
                this.titleInput = input
              }
            }}
          />
          <div>&nbsp;</div>
          <button className="button is-primary" type="submit">
            {t`Save`}
          </button>
        </form>
      )
    } else {
      const saveTitle = <strong>{lastSave.title}</strong>
      body = (
        <div>
          <div>
            {jt`Do you want to update the current configuration, ${saveTitle}, or save as a new configuration?`}
          </div>
          <div>&nbsp;</div>
          <div>
            <button
              type="button"
              className="button is-pulled-left"
              onClick={() => {
                this.setState({ overwrite: true })
              }}
            >
              {t`Save as new`}
            </button>

            <button
              type="button"
              className="button is-primary is-pulled-right"
              onClick={() => {
                onUpdate(runConfiguration, lastSave)
              }}
            >
              {t`Update current`}
            </button>
          </div>
          <div style={{ clear: 'both' }} />
        </div>
      )
    }

    return (
      <ModalCard title={t`Save Run Configuration`} active={showModal} onHide={() => onHide()}>
        {body}
      </ModalCard>
    )
  }
}

export default connector(SaveModal)
