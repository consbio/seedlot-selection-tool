import { connect } from 'react-redux'
import GroupedButton from '../components/GroupedButton'
import { selectUnit } from '../actions/variables'

export default connect(
  (state: any, { name }: { name: string }) => {
    return {
      active: name === state.runConfiguration.unit,
    }
  },
  (dispatch: (action: any) => any, { name }: { name: string }) => {
    return {
      onClick: () => {
        dispatch(selectUnit(name))
      },
    }
  },
)(GroupedButton)
