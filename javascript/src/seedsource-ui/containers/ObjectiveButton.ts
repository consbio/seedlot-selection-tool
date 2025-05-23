import { connect } from 'react-redux'
import GroupedButton from '../components/GroupedButton'
import { selectObjective } from '../actions/objectives'

const mapStateToProps = (state: any, { name }: { name: string }) => {
  return {
    active: name === state.runConfiguration.objective,
  }
}

const mapDispatchToProps = (dispatch: (event: any) => any, { name }: { name: string }) => {
  return {
    onClick: () => {
      dispatch(selectObjective(name))
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(GroupedButton)
