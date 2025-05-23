import { connect } from 'react-redux'
import GroupedButton from '../components/GroupedButton'
import { selectRegionMethod } from '../actions/region'

export default connect(
  (state: any, { name }: { name: string }) => {
    return {
      active: name === state.runConfiguration.regionMethod,
    }
  },
  (dispatch: (event: any) => any, { name }: { name: string }) => {
    return {
      onClick: () => {
        dispatch(selectRegionMethod(name))
      },
    }
  },
)(GroupedButton)
