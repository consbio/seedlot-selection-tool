import { combineReducers } from 'redux'
import auth from './auth'
import runConfiguration, { lastRun, activeStep, reportIsFetching } from './runConfiguration'
import report from './report'
import tabs from './tabs'
import map from './map'
import job from './job'
import saves from './saves'
import legends from './legends'
import error from './error'
import popup from './popup'
import layers from './layers'
import customLayers from './customLayers'

export default combineReducers({
  auth,
  activeTab: tabs,
  activeStep,
  runConfiguration,
  lastRun,
  map,
  job,
  saves,
  legends,
  reportIsFetching,
  report,
  error,
  popup,
  layers,
  customLayers
})
