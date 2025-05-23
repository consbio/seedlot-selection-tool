import { connect } from 'react-redux'
import GroupedButton from '../components/GroupedButton'
import { selectMethod } from '../actions/variables'

const mapStateToProps = (state: any, { name }: { name: string }) => {
  return {
    active: name === state.runConfiguration.method,
  }
}

const mapDispatchToProps = (dispatch: (event: any) => any, { name }: { name: any }) => {
  return {
    onClick: () => {
      dispatch(selectMethod(name))
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(GroupedButton)
