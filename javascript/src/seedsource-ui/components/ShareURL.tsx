import { t } from 'ttag'
import React, { useState } from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { useDispatch } from 'react-redux'
import ModalCard from './ModalCard'
import config from '../config'
import { dumpConfiguration } from '../actions/saves'
import { post } from '../io'
import { setError } from '../actions/error'
import LinkIcon from '../../images/icon-link.svg'
import ClipboardIcon from '../../images/icon-clipboard.svg'

type ShareURLProps = {
  configuration: any
  version: number
}

const ShareURL = ({ configuration, version }: ShareURLProps) => {
  const dispatch = useDispatch()
  const [url, setUrl] = useState('')
  const [fetchingUrl, setFetchingUrl] = useState(false)
  const [urlCopied, setUrlCopied] = useState(false)

  const resetState = () => {
    setUrl('')
    setFetchingUrl(false)
    setUrlCopied(false)
  }

  const onFetchURL = () => {
    resetState()
    setFetchingUrl(true)
    const shareUrl = `${config.apiRoot}share-urls/`
    const data = {
      configuration: JSON.stringify(dumpConfiguration(configuration)),
      version,
    }
    post(shareUrl, data)
      .then(response => {
        const { status } = response
        if (status < 200 || status >= 300) {
          throw new Error(`There was an unexpected error creating the share URL. Status: ${status}`)
        } else {
          return response.json()
        }
      })
      .then(shareURL => {
        const { hash } = shareURL
        const { protocol, host, pathname } = window.location
        setUrl(`${protocol}//${host + pathname}?s=${hash}`)
      })
      .catch(e => {
        dispatch(setError('Error', 'There was a problem creating your URL.', e.message))
      })
      .finally(() => {
        setFetchingUrl(false)
      })
  }

  return (
    <>
      <ModalCard
        onHide={() => !fetchingUrl && resetState()}
        title="Share URL"
        active={fetchingUrl || !!url}
        footer={(
          <div style={{ textAlign: 'right', width: '100%' }}>
            <button
              type="button"
              onClick={resetState}
              className="button is-primary is-pulled-right"
              disabled={fetchingUrl}
            >
              {t`Done`}
            </button>
          </div>
        )}
      >
        <p>
          {t`Share your saved run with others by sending them this link (your saved run will load when anyone visits 
          this link). Click the clipboard to copy the link.`}
        </p>
        <div className="share-container">
          <span className="share-input-container">
            <img src={LinkIcon} alt={t`Link icon`} className="link-icon" />
            <input className="input share-input" value={url || t`Loading Url...`} readOnly />
          </span>
          <CopyToClipboard text={url} onCopy={() => url && setUrlCopied(true)}>
            <img
              src={ClipboardIcon}
              alt={t`Clipboard icon`}
              className="clipboard-icon"
              style={{ opacity: url ? 1 : 0.5, cursor: url ? 'pointer' : 'not-allowed' }}
            />
          </CopyToClipboard>
        </div>
        <div className="clipboard-text">{urlCopied && <p>{t`Copied to clipboard`}</p>}</div>
      </ModalCard>
      <button type="button" onClick={onFetchURL} className="button is-dark">
        <span className="icon-share-12" aria-hidden="true" /> &nbsp;{t`Get URL`}
      </button>
    </>
  )
}

export default ShareURL
