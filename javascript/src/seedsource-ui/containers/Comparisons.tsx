import React from 'react'
import { connect, ConnectedProps } from 'react-redux'
import stringify from 'csv-stringify'
import { t, c } from 'ttag'
import parse from 'csv-parse'
import { UserSite } from '../reducers/runConfiguration'
import { addUserSite, addUserSites, removeUserSite, setUserSiteLabel, setActiveUserSite } from '../actions/point'
import { setMapMode } from '../actions/map'
import ModalCard from '../components/ModalCard'
import { variables } from '../config'

type State = {
  runConfiguration: {
    objective: 'seedlots' | 'sites'
    userSites: UserSite[]
  }
  map: {
    mode: string
  }
}

const connector = connect(
  ({ runConfiguration: { objective, userSites }, map: { mode } }: State) => ({
    objective,
    userSites,
    mode,
  }),
  dispatch => ({
    removeSite: (index: number) => dispatch(removeUserSite(index)),
    onAddUserSite: (lat: number, lon: number, label: string) => {
      dispatch(addUserSite({ lat, lon }, label))
      dispatch(setMapMode('normal'))
    },
    onAddUserSites: (sites: { latlon: { lat: number; lon: number }; label: string }[]) => dispatch(addUserSites(sites)),
    onSetUserSiteLabel: (label: string, index: number) => dispatch(setUserSiteLabel(label, index)),
    onMouseOverSite: (index: number | null) => dispatch(setActiveUserSite(index)),
    onSetMapMode: (mode: string) => dispatch(setMapMode(mode)),
  }),
)

type ComparisonsProps = ConnectedProps<typeof connector>

const Comparisons = ({
  objective,
  userSites,
  mode,
  removeSite,
  onAddUserSite,
  onAddUserSites,
  onSetUserSiteLabel,
  onMouseOverSite,
  onSetMapMode,
}: ComparisonsProps) => {
  const [expandLevel, setExpandLevel] = React.useState(0)
  const expandClasses = ['', 'preview', 'full-height']
  const expandMessages = [t`Click to show`, t`Click for full height`, t`Click to hide`]
  const [newSite, setNewSite] = React.useState({ lat: '', lon: '', label: '' })
  const [activeEdit, setActiveEdit] = React.useState(null as { lat: number; lon: number; label: string } | null)
  const [processingCSV, setProcessingCSV] = React.useState(false)
  const [csvError, setCSVError] = React.useState(null as string | null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  let siteVariables: string[] = []
  if (userSites.length) {
    siteVariables = Object.keys(userSites[0].deltas || {})
  }

  return (
    <div className={`comparisons ${expandClasses[expandLevel]}`}>
      <input
        type="file"
        className="is-hidden"
        aria-hidden="true"
        ref={fileInputRef}
        onChange={({ target: { files } }) => {
          if (files?.length) {
            setProcessingCSV(true)

            const file = files[0]
            const reader = new FileReader()

            reader.onload = e => {
              if (e.target?.result) {
                parse(e.target.result as string, { columns: true }, (err, rows: [{ [key: string]: string }]) => {
                  if (err) {
                    setCSVError(err.message)
                    setProcessingCSV(false)
                  } else {
                    if (!rows.length) {
                      setCSVError(t`The file is empty.`)
                      setProcessingCSV(false)
                      return
                    }

                    const columns = Object.keys(rows[0])
                    const xCol = columns.find(name =>
                      ['x', 'lon', 'long', 'longitude', 'longitud'].includes(name.toLowerCase().trim()),
                    )
                    const yCol = columns.find(name =>
                      ['y', 'lat', 'latitude', 'latitud'].includes(name.toLowerCase().trim()),
                    )
                    const labelCol = columns.find(name => ['name', 'label'].includes(name.toLowerCase().trim()))

                    if (!(xCol && yCol)) {
                      setCSVError(t`The CSV has no latitude and/or longitude column.`)
                      setProcessingCSV(false)
                      return
                    }

                    const sites = rows.map(row => {
                      const site = {
                        latlon: {
                          lat: Number.parseFloat(row[yCol]),
                          lon: Number.parseFloat(row[xCol]),
                        },
                      } as { latlon: { lat: number; lon: number }; label: string }

                      if (labelCol) {
                        site.label = row[labelCol]
                      }

                      return site
                    })

                    onAddUserSites(sites)
                    setProcessingCSV(false)
                  }
                })
              }
            }

            reader.readAsText(file)
          }
        }}
      />
      <button type="button" className="expand-button" onClick={() => setExpandLevel((expandLevel + 1) % 3)}>
        <div>{objective === 'seedlots' ? t`Compare Seedlots` : t`Compare Planting Sites`}</div>
        <div className="expand-message">{expandMessages[expandLevel]}</div>
        <div className="expand-icons">
          {expandClasses.map((className, idx) => (
            <div
              className={`expand-icon ${className} ${expandLevel === idx ? 'active' : ''}`}
              onClick={e => {
                e.stopPropagation()
                setExpandLevel(idx)
              }}
            />
          ))}
        </div>
      </button>
      <div className="scroll-table">
        <table className="table is-hoverable">
          {userSites.length ? (
            <thead>
              <tr>
                <th> </th>
                <th>{t`Location`}</th>
                <th style={{ minWidth: '200px' }}>{t`Name`}</th>
                <th>{t`Match`}</th>
                {siteVariables.map(variable => (
                  <th>&Delta; {variable}</th>
                ))}
              </tr>
            </thead>
          ) : null}
          <tbody>
            {userSites.map((site, index) => {
              const editRow = activeEdit && activeEdit.lat === site.lat && activeEdit.lon === site.lon
              return (
                <tr
                  key={`${site.lat},${site.lon}`}
                  onFocus={() => onMouseOverSite(index)}
                  onBlur={() => onMouseOverSite(null)}
                  onMouseOver={() => onMouseOverSite(index)}
                  onMouseOut={() => onMouseOverSite(null)}
                >
                  <td>
                    <button
                      type="button"
                      className="delete"
                      onClick={() => removeSite(index)}
                      aria-label={t`Remove site`}
                    />
                  </td>
                  <td>{`${site.lat.toFixed(2)}, ${site.lon.toFixed(2)}`}</td>
                  <td>
                    {editRow && (
                      <form
                        onSubmit={() => {
                          onSetUserSiteLabel(activeEdit!.label, index)
                          setActiveEdit(null)
                          return false
                        }}
                        onKeyDown={e => {
                          if (e.key === 'Escape') {
                            setActiveEdit(null)
                          }
                        }}
                      >
                        {/* eslint-disable jsx-a11y/no-autofocus */}
                        <input
                          autoFocus
                          className="input is-inline is-small"
                          value={activeEdit!.label}
                          onChange={e => setActiveEdit({ ...activeEdit!, label: e.target.value })}
                          onBlur={() => {
                            onSetUserSiteLabel(activeEdit!.label, index)
                            setActiveEdit(null)
                          }}
                        />
                        {/* eslint-enable */}
                      </form>
                    )}
                    {!editRow &&
                      (site.label ? (
                        <button
                          type="button"
                          className="button is-plain"
                          style={{
                            display: 'inline-block',
                            maxWidth: '200px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                          onClick={() => setActiveEdit({ lat: site.lat, lon: site.lon, label: site.label! })}
                        >
                          {site.label}
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="button is-plain is-italic has-text-grey-light"
                          onClick={() => setActiveEdit({ lat: site.lat, lon: site.lon, label: '' })}
                        >
                          {t`click to add`}
                        </button>
                      ))}
                  </td>
                  <td>{site.score !== undefined ? `${site.score}%` : c('Not Applicable').t`N/A`}</td>
                  {siteVariables.map(variable => {
                    if (site.deltas) {
                      let value = site.deltas[variable]
                      const variableConfig = variables.find(v => v.name === variable)
                      if (variableConfig) {
                        value /= variableConfig.multiplier
                      }

                      return <td>{Number(value.toFixed(1))}</td>
                    }

                    return <td>{c('Not Applicable').t`N/A`}</td>
                  })}
                </tr>
              )
            })}
            <tr className="add-site">
              <td colSpan={4 + siteVariables.length}>
                <div className="columns">
                  <div className="column" />
                  <div className="column is-narrow">
                    {mode === 'add_sites' ? (
                      <form
                        onSubmit={e => {
                          e.preventDefault()
                          const { lat, lon, label } = newSite

                          const latF = parseFloat(lat)
                          const lonF = parseFloat(lon)

                          if (latF && lonF) {
                            onSetMapMode('normal')
                            onAddUserSite(latF, lonF, label)
                          }

                          return false
                        }}
                        onKeyDown={e => {
                          if (e.key === 'Escape') {
                            onSetMapMode('normal')
                            setNewSite({ lat: '', lon: '', label: '' })
                          }
                        }}
                      >
                        <div className="columns" style={{ textAlign: 'left', alignItems: 'flex-end' }}>
                          <label className="column">
                            <div>{c("abbreviation of 'Latitude'").t`Lat`}</div>

                            {/* eslint-disable jsx-a11y/no-autofocus */}
                            <input
                              autoFocus
                              className="input is-inline is-small"
                              style={{ width: '80px', textAlign: 'right' }}
                              value={newSite.lat}
                              onChange={e => setNewSite({ ...newSite, lat: e.target.value })}
                            />
                            {/* eslint-enable */}
                          </label>
                          <label className="column">
                            <div>{c("abbreviation of 'Longitud''").t`Lon`}</div>
                            <input
                              className="input is-inline is-small"
                              style={{ width: '80px', textAlign: 'right' }}
                              value={newSite.lon}
                              onChange={e => setNewSite({ ...newSite, lon: e.target.value })}
                            />
                          </label>
                          <label className="column">
                            <div>{t`Name`}</div>
                            <input
                              className="input is-inline is-small"
                              value={newSite.label}
                              onChange={e => setNewSite({ ...newSite, label: e.target.value })}
                            />
                          </label>
                          <div className="column" style={{ whiteSpace: 'nowrap' }}>
                            <button
                              type="button"
                              onClick={() => {
                                onSetMapMode('normal')
                                setNewSite({ lat: '', lon: '', label: '' })
                              }}
                              className="button is-plain is-small"
                              style={{ verticalAlign: 'bottom', marginRight: '10px' }}
                            >
                              {t`cancel`}
                            </button>
                            <button
                              type="submit"
                              className="button is-small is-primary"
                              style={{ verticalAlign: 'bottom' }}
                            >
                              {t`Add`}
                            </button>
                          </div>
                        </div>
                      </form>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="button is-plain"
                          onClick={() => {
                            setNewSite({ lat: '', lon: '', label: '' })
                            onSetMapMode('add_sites')
                          }}
                        >
                          (+) {objective === 'seedlots' ? t`Add Seedlot` : t`Add Planting Site`}
                        </button>
                        <button
                          type="button"
                          className="button is-plain"
                          style={{ marginLeft: '20px' }}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          {t`Upload CSV`}
                        </button>
                        {userSites.length ? (
                          <button
                            type="button"
                            className="button is-plain"
                            style={{ marginLeft: '20px' }}
                            onClick={() => {
                              const deltaKeys = userSites[0].deltas ? Object.keys(userSites[0].deltas) : []
                              const data = [
                                [
                                  t`Latitude`,
                                  t`Longitude`,
                                  t`Label`,
                                  `${t`Climate Match`} %`,
                                  ...deltaKeys.map(k => `(${t`delta`}) ${k}`),
                                ],
                                ...userSites.map(({ lat, lon, label, score, deltas }) => [
                                  lat,
                                  lon,
                                  label,
                                  score,
                                  ...deltaKeys.map(k => {
                                    if (deltas) {
                                      let value = deltas[k]
                                      const variableConfig = variables.find(v => v.name === k)
                                      if (variableConfig) {
                                        value /= variableConfig.multiplier
                                      }

                                      return value
                                    }

                                    return c('Not Applicable').t`N/A`
                                  }),
                                ]),
                              ]

                              stringify(data, (err, output) => {
                                const blob = new Blob([output], { type: 'text/csv' })
                                const supportsDownloadAttr = 'download' in document.createElement('a')
                                if (supportsDownloadAttr) {
                                  const url = window.URL.createObjectURL(blob)
                                  const node = document.createElement('a')

                                  node.href = url
                                  node.download = 'points.csv'

                                  document.body.appendChild(node)
                                  node.dispatchEvent(
                                    new MouseEvent('click', { bubbles: true, cancelable: true, view: window }),
                                  )
                                  document.body.removeChild(node)
                                } else {
                                  window.navigator.msSaveBlob(blob, 'points.csv')
                                }
                              })
                            }}
                          >
                            {t`Download CSV`}
                          </button>
                        ) : null}
                      </>
                    )}
                  </div>
                  <div className="column" />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {(processingCSV || csvError) && (
        <>
          <ModalCard
            title={t`Uploading CSV`}
            active
            footer={
              csvError && (
                <div style={{ textAlign: 'right', width: '100%' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setCSVError(null)
                      setProcessingCSV(false)
                    }}
                    className="button is-primary is-pulled-right"
                  >
                    {t`Done`}
                  </button>
                </div>
              )
            }
          >
            {csvError ? (
              <div>{csvError}</div>
            ) : (
              <>
                <div>{t`Uploading CSV data...`}</div>
                <progress />
              </>
            )}
          </ModalCard>
        </>
      )}
    </div>
  )
}

export default connector(Comparisons)
