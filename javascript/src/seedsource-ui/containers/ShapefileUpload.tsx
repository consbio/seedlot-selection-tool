import React, { ReactChild } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import shp from 'shpjs'
import { t } from 'ttag'

// eslint-disable-next-line import/no-unresolved
import { FeatureCollection, GeoJSON } from 'geojson'

import { updateConstraintValues as updateConstraintValuesConnect } from '../actions/constraints'
import { setError } from '../actions/error'
import { addCustomLayer as addCustomLayerConnect } from '../actions/customLayers'

const connector = connect(null, dispatch => {
  return {
    updateConstraintValues: (index: number, geoJSON: any, filename: string) => {
      dispatch(updateConstraintValuesConnect(index, { geoJSON, filename }))
    },
    addCustomLayer: (geoJSON: GeoJSON, filename: string) => {
      dispatch(addCustomLayerConnect(geoJSON, filename))
    },
    sendError: (title: string, message: string, debugInfo: any = null) => {
      dispatch(setError(title, message, debugInfo))
    },
  }
})

type ShapefileUploadProps = ConnectedProps<typeof connector> & {
  index?: number
  storeTo: 'constraints' | 'customLayers'
  children?: ReactChild
}

type ShapefileUploadState = {
  isLoading: boolean
}

class ShapefileUpload extends React.Component<ShapefileUploadProps, ShapefileUploadState> {
  constructor(props: ShapefileUploadProps) {
    super(props)
    this.handleFileUpload = this.handleFileUpload.bind(this)
    this.state = {
      isLoading: false,
    }
  }

  handleFileUpload(event: any) {
    this.setState({ isLoading: true })
    let files: any[]
    if (event.dataTransfer && event.dataTransfer.files.length) {
      files = Object.values(event.dataTransfer.files)
    } else if (event.target) {
      files = Object.values(event.target.files)
    } else {
      return
    }

    if (files.length === 0) {
      this.setState({ isLoading: false })
    }
    if (
      files.reduce((total: number, file: any) => {
        return total + file.size
      }, 0) > 2100000
    ) {
      const { sendError } = this.props

      this.setState({ isLoading: false })
      sendError(t`Error`, t`Cannot process shapefiles larger than 2MB`)
      return
    }

    const zipFile = files.find(file => file.name.match(/\.zip/i))
    const shpFile = files.find(file => file.name.match(/\.shp/i))
    const prjFile = files.find(file => file.name.match(/\.prj/i))

    if (zipFile) {
      const reader = new FileReader()
      reader.onerror = (e: any) => {
        const { sendError } = this.props
        this.setState({ isLoading: false })
        sendError(t`Error`, t`Could not read the zip file`, e.message)
      }
      reader.onload = (e: any) => {
        shp(e.target.result)
          .then((features: FeatureCollection | FeatureCollection[]) => {
            const { index, storeTo, updateConstraintValues, addCustomLayer } = this.props
            const feature = Array.isArray(features) ? features[0] : features

            this.setState({ isLoading: false })
            if (storeTo === 'constraints') {
              updateConstraintValues(index!, feature, zipFile.name)
            }
            if (storeTo === 'customLayers') {
              addCustomLayer(feature, zipFile.name)
            }
          })
          .catch(error => {
            const { sendError } = this.props

            this.setState({ isLoading: false })
            sendError(t`Error`, t`Could not read the zip file`, error.message)
          })
      }
      reader.readAsArrayBuffer(zipFile)
    } else if (shpFile) {
      const shpPromise = new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onerror = e => {
          reject(e)
        }
        reader.onload = e => {
          resolve({
            shp: e.target?.result,
            name: shpFile.name,
          })
        }
        reader.readAsArrayBuffer(shpFile)
      })
      const prjPromise = new Promise((resolve, reject) => {
        if (prjFile) {
          const reader = new FileReader()
          reader.onerror = e => {
            reject(e)
          }
          reader.onload = e => {
            resolve({ prj: e.target?.result })
          }
          reader.readAsText(prjFile)
        } else {
          resolve({
            prj: null,
            warning: t`No projection file found. Assuming WGS84. 
              If you see the wrong projection, try including the prj file.`,
          })
        }
      })
      Promise.all([shpPromise, prjPromise])
        .then((results: any) => {
          const { index, sendError, storeTo, updateConstraintValues, addCustomLayer } = this.props
          const [shpResult, prjResult] = results
          const parsedShp = shp.parseShp(shpResult.shp, prjResult.prj)
          const geojson = shp.combine([parsedShp, []])
          this.setState({ isLoading: false })
          if (prjResult.warning) {
            sendError(t`Warning`, prjResult.warning)
          }
          if (storeTo === 'constraints') {
            updateConstraintValues(index!, geojson, shpResult.name)
          }
          if (storeTo === 'customLayers') {
            addCustomLayer(geojson, shpResult.name)
          }
        })
        .catch(error => {
          const { sendError } = this.props

          this.setState({ isLoading: false })
          sendError(t`Error`, t`Shapefile not loaded`, error.message)
        })
    } else {
      const { sendError } = this.props

      this.setState({ isLoading: false })
      sendError(t`Error`, t`File not supported`)
    }
  }

  render() {
    const { isLoading } = this.state
    const { children } = this.props

    return (
      <div>
        {children ? <label htmlFor="shapefile-upload">{children}</label> : null}
        <input
          type="file"
          id="shapefile-upload"
          style={{ display: children ? 'none' : 'initial' }}
          onChange={this.handleFileUpload}
          multiple
        />
        {isLoading ? (
          <div className="overlay">
            <div className="progress-container">
              {t`Processing...`}
              <progress />
            </div>
          </div>
        ) : null}
      </div>
    )
  }
}

export default connector(ShapefileUpload)
