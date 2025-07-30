import React from 'react'
import { render } from 'react-dom'
import { applyMiddleware, createStore } from 'redux'
import { Provider } from 'react-redux'
import thunkMiddleware from 'redux-thunk'
import reducers from './seedsource-ui/reducers'
import App from './seedsource-ui/components/App'
import variables from './seedsource-ui/async/variables'
import zones from './seedsource-ui/async/zones'
import legends from './seedsource-ui/async/legends'
import point from './seedsource-ui/async/point'
import traits from './seedsource-ui/async/traits'
import customFunctions from './seedsource-ui/async/customFunctions'
import Sidebar from './seedsource-ui/containers/Sidebar'
import ObjectiveStep from './seedsource-ui/containers/ObjectiveStep'
import LocationStep from './seedsource-ui/containers/LocationStep'
import RegionStep from './seedsource-ui/containers/RegionStep'
import ClimateStep from './seedsource-ui/containers/ClimateStep'
import TraitStep from './seedsource-ui/components/TraitStep'
import CustomFunctionStep from './seedsource-ui/containers/CustomFunctionStep'
import TransferStep from './seedsource-ui/containers/TransferStep'
import RunConfiguration from './seedsource-ui/containers/RunConfiguration'
import VariableStep from './seedsource-ui/containers/VariableStep'
import ConstraintStep from './seedsource-ui/containers/ConstraintStep'
import RunStep from './seedsource-ui/containers/RunStep'
import About from './components/About'
import Menu from './components/Menu'
import initConfig from './config'

const store = createStore(reducers as any, applyMiddleware(thunkMiddleware))

initConfig()
render(
  <Provider store={store}>
    <App navContent={<Menu />}>
      <Sidebar aboutNode={<About />}>
        <RunConfiguration>
          <ObjectiveStep number={1} active />
          <LocationStep number={2} />
          <RegionStep number={3} />
          <ClimateStep number={4} active />
          <TransferStep number={5} active />
          <VariableStep number={6} active />
          <TraitStep number={6} />
          <CustomFunctionStep number={6} />
          <ConstraintStep number={7} />
          <RunStep number={8} />
        </RunConfiguration>
      </Sidebar>
    </App>
  </Provider>,
  document.getElementById('SeedsourceApp'),
)

variables(store)
zones(store)
legends(store)
point(store)
traits(store)
customFunctions(store)
