import React from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { t } from 'ttag'
import SavedRun from './SavedRun'
import { fetchSaves } from '../actions/saves'

const connector = connect(
  ({ saves, auth }: any) => {
    const { isLoggedIn } = auth

    return { saves: saves.saves, isLoggedIn }
  },
  (dispatch: (event: any) => any) => {
    return {
      onLoad: () => {
        dispatch(fetchSaves())
      },
    }
  },
)

type SavedRunsProps = ConnectedProps<typeof connector>

type SavedRunsState = {
  activeSave: any
}

class SavedRuns extends React.Component<SavedRunsProps, SavedRunsState> {
  constructor(props: SavedRunsProps) {
    super(props)
    this.state = { activeSave: null }
  }

  componentDidMount() {
    const { onLoad } = this.props
    onLoad()
  }

  componentDidUpdate({ isLoggedIn: prevIsLoggedIn }: SavedRunsProps) {
    const { isLoggedIn, onLoad } = this.props

    if (prevIsLoggedIn !== isLoggedIn) {
      onLoad()
    }
  }

  render() {
    const { saves, isLoggedIn } = this.props
    const { activeSave } = this.state

    if (!isLoggedIn) {
      return (
        <article className="message is-dark">
          <div className="message-body">
            {t`You may create an account to save and retrieve your runs. 
              Click on the "Account" tab in the upper right to login or create an account..`}
          </div>
        </article>
      )
    }

    if (saves.length === 0) {
      return <div>{t`You currently have no saved runs.`}</div>
    }

    return (
      <div className="configuration-list">
        {saves.map((item: any) => {
          return (
            <SavedRun
              key={item.uuid}
              save={item}
              active={activeSave === item.uuid}
              onClick={() => {
                this.setState({ activeSave: item.uuid })
              }}
            />
          )
        })}
      </div>
    )
  }
}

export default connector(SavedRuns)
