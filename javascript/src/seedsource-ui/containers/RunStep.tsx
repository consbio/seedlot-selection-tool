import React, { RefObject } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { t } from 'ttag'
import ConfigurationStep from './ConfigurationStep'
import SaveModal from './SaveModal'
import ModalCard from '../components/ModalCard'
import Dropdown from '../components/Dropdown'
import Map from './Map'
import type { CustomFunction } from '../reducers/customFunctions'
import { setError } from '../actions/error'
import { runJob } from '../actions/job'
import { showSaveModal } from '../actions/saves'
import { createReport, runTIFJob } from '../actions/report'
import { reports } from '../config'

const configurationCanRun = ({
  point,
  variables,
  traits,
  customMode,
  customFunctions,
}: {
  point: any
  variables: any[]
  traits: any[]
  customMode: boolean
  customFunctions: CustomFunction[]
}) => {
  if (point === null || point.x === null || point.y === null) {
    return false
  }

  if (customMode && variables.length > 0 && variables.some(item => item.customCenter === null)) {
    return false
  }

  const variablesComplete =
    variables.length > 0 && variables.every(item => item.value !== null && item.isFetching === false)
  const traitsComplete = traits.length > 0 && traits.every(item => item.value !== null)
  const customFunctionsComplete =
    customFunctions.length > 0 &&
    customFunctions.some(cf => cf.selected) &&
    customFunctions.every(cf => (cf.selected ? cf.value && cf.transfer : true))

  return variablesComplete || traitsComplete || customFunctionsComplete
}

const connector = connect(
  ({
    runConfiguration,
    lastRun,
    job,
    auth,
    reportIsFetching,
  }: {
    runConfiguration: any
    lastRun: any
    job: any
    auth: { isLoggedIn: boolean }
    reportIsFetching: boolean
  }) => {
    const { isLoggedIn } = auth

    return {
      canRun: configurationCanRun(runConfiguration) && !job.isRunning,
      canSave: lastRun !== null,
      configuration: runConfiguration,
      job,
      isLoggedIn,
      reportIsFetching,
    }
  },
  (dispatch: (event: any) => any) => ({
    onRun: (configuration: any) => {
      const { variables, constraints } = configuration

      if (variables.some((item: any) => item.transfer === null)) {
        dispatch(
          setError(
            t`Configuration error`,
            t`Cannot calculate scores: one or more of your variables has no transfer limit, or a limit of 0.`,
          ),
        )
        return
      }

      if (constraints.some((item: any) => Object.keys(item.values).some(key => item.values[key] === null))) {
        dispatch(
          setError(
            t`Configuration error`,
            t`Cannot calculate scores: one or more of your constraints is missing a value.`,
          ),
        )
        return
      }

      dispatch(runJob(configuration))
    },

    onSave: (isLoggedIn: boolean) => {
      if (!isLoggedIn) {
        dispatch(setError(t`Login required`, t`Please login to save your run.`))
        return
      }

      dispatch(showSaveModal())
    },

    onExport: (name: string) => {
      dispatch(createReport(name))
    },

    onExportTIF: () => {
      dispatch(runTIFJob())
    },
  }),
)

type RunStepProps = ConnectedProps<typeof connector> & {
  number: number
}

type RunStepState = {
  previewModal: boolean
  exportType: string | null
  processingCsv: boolean
  csvError: string | null
}

class RunStep extends React.Component<RunStepProps, RunStepState> {
  fileInputRef?: RefObject<HTMLInputElement>

  constructor(props: RunStepProps) {
    super(props)

    this.fileInputRef = React.createRef()

    this.state = {
      previewModal: false,
      exportType: null,
      processingCsv: false,
      csvError: null,
    }
  }

  render() {
    const {
      number,
      configuration,
      canRun,
      canSave,
      isLoggedIn,
      reportIsFetching,
      onRun,
      onSave,
      onExport,
      onExportTIF,
    } = this.props
    const { previewModal, processingCsv, csvError } = this.state

    return (
      <ConfigurationStep title={t`Map your Results`} number={number} name="run" active={false}>
        {(processingCsv || csvError) && (
          <>
            <ModalCard
              title="Uploading CSV"
              active
              footer={
                csvError && (
                  <div style={{ textAlign: 'right', width: '100%' }}>
                    <button
                      type="button"
                      onClick={() => {
                        this.setState({ csvError: null })
                      }}
                      className="button is-primary is-pulled-right"
                    >
                      Done
                    </button>
                  </div>
                )
              }
            >
              {csvError ? (
                <div>{csvError}</div>
              ) : (
                <>
                  <div>Uploading CSV data...</div>
                  <progress />
                </>
              )}
            </ModalCard>
          </>
        )}

        <div>
          <button
            type="button"
            className="button is-primary is-large is-fullwidth"
            disabled={!canRun}
            onClick={() => {
              onRun(configuration)
            }}
          >
            {t`Run Tool`}
          </button>
        </div>
        <div className="margin-top-10">
          <div>
            <button
              type="button"
              className="button is-pulled-left"
              disabled={!canSave}
              onClick={e => {
                e.preventDefault()
                onSave(isLoggedIn)
              }}
            >
              <span className="icon12 icon-save" aria-hidden="true" /> {t`Save Last Run`}
            </button>
            <Dropdown
              className="is-pulled-right is-right is-hidden-mobile"
              up
              title={t`Export As...`}
              disabled={!canSave || reportIsFetching}
            >
              {reports.map(r => (
                <a
                  key={r.name}
                  className="dropdown-item"
                  onClick={e => {
                    e.preventDefault()
                    this.setState({
                      previewModal: true,
                      exportType: r.name,
                    })
                  }}
                >
                  {r.label}
                </a>
              ))}
              <a
                className="dropdown-item"
                onClick={e => {
                  e.preventDefault()
                  onExportTIF()
                }}
              >
                {t`GeoTIFF`}
              </a>
            </Dropdown>
            {previewModal ? (
              <ModalCard
                className="report-preview"
                active
                onHide={() => {
                  this.setState({ previewModal: false })
                }}
                title={t`Position Map`}
                footer={
                  <button
                    type="button"
                    onClick={() => {
                      const { exportType } = this.state

                      this.setState({ previewModal: false })
                      onExport(exportType!)
                    }}
                    className="button is-primary is-large"
                  >
                    Export
                  </button>
                }
              >
                <div className="map preview-map">
                  <div style={{ margin: '10px' }}>
                    {t`Move and zoom the map to set how it will appear in the report.`}
                  </div>
                  <Map simple />
                </div>
              </ModalCard>
            ) : null}
          </div>
          <div className="is-clearfix" />
        </div>
        <SaveModal />
      </ConfigurationStep>
    )
  }
}

export default connector(RunStep)
