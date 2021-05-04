import React from 'react'
import { render } from 'react-dom'
import { applyMiddleware, createStore } from 'redux'
import { Provider } from 'react-redux'
import thunkMiddleware from 'redux-thunk'
import reducers from 'seedsource-ui/lib/reducers'
import App from 'seedsource-ui/lib/components/App'
import variables from 'seedsource-ui/lib/async/variables'
import zones from 'seedsource-ui/lib/async/zones'
import legends from 'seedsource-ui/lib/async/legends'
import point from 'seedsource-ui/lib/async/point'
import popup from 'seedsource-ui/lib/async/popup'
import traits from 'seedsource-ui/lib/async/traits'
import Sidebar from 'seedsource-ui/lib/containers/Sidebar'
import ObjectiveStep from 'seedsource-ui/lib/containers/ObjectiveStep'
import LocationStep from 'seedsource-ui/lib/containers/LocationStep'
import RegionStep from 'seedsource-ui/lib/containers/RegionStep'
import ClimateStep from 'seedsource-ui/lib/containers/ClimateStep'
import TraitStep from 'seedsource-ui/lib/components/TraitStep'
import TransferStep from 'seedsource-ui/lib/containers/TransferStep'
import RunConfiguration from 'seedsource-ui/lib/containers/RunConfiguration'
import VariableStep from 'seedsource-ui/lib/containers/VariableStep'
import ConstraintStep from 'seedsource-ui/lib/containers/ConstraintStep'
import RunStep from 'seedsource-ui/lib/containers/RunStep'
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
popup(store)
traits(store)
