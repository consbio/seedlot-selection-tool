import React, { ReactNode } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { t } from 'ttag'
import SavedRuns from './SavedRuns'
import Layers from './Layers'
import { selectTab } from '../actions/tabs'

const connector = connect(
  ({ activeTab }: { activeTab: string }) => {
    return { activeTab }
  },
  (dispatch: (action: any) => any) => {
    return {
      onSelect: (tab: string) => {
        dispatch(selectTab(tab))
      },
    }
  },
)

type SidebarProps = ConnectedProps<typeof connector> & {
  aboutNode: ReactNode
  children: ReactNode
}

const Sidebar = ({ activeTab, aboutNode, children, onSelect }: SidebarProps) => (
  <div className="sidebar-inner">
    <div className="tabs is-boxed is-fullwidth">
      <ul>
        <li className={activeTab === 'about' ? 'is-active' : ''}>
          <a onClick={() => onSelect('about')}>{t`About`}</a>
        </li>
        <li
          className={`${activeTab === 'tool' ? 'is-active' : ''} ${
            activeTab !== 'tool' && activeTab === 'map' ? 'is-active-tablet' : ''
          }`}
        >
          <a onClick={() => onSelect('tool')}>{t`Tool`}</a>
        </li>
        <li className={activeTab === 'layers' ? 'is-active' : ''}>
          <a onClick={() => onSelect('layers')}>{t`Layers`}</a>
        </li>
        <li className={activeTab === 'saves' ? 'is-active' : ''}>
          <a onClick={() => onSelect('saves')}>{t`Saved Runs`}</a>
        </li>
        <li className={`${activeTab === 'map' ? 'is-active' : ''} is-hidden-tablet`}>
          <a onClick={() => onSelect('map')}>{t`Map`}</a>
        </li>
      </ul>
    </div>
    <div className={`tab-content ${activeTab !== 'about' ? 'is-hidden' : ''}`}>{aboutNode}</div>
    <div
      className={`tab-content ${activeTab === 'map' ? 'is-hidden-mobile' : ''} ${
        activeTab !== 'map' && activeTab !== 'tool' ? 'is-hidden' : ''
      }`}
    >
      {children}
    </div>
    <div className={`tab-content ${activeTab !== 'layers' ? 'is-hidden' : ''}`}>
      <Layers />
    </div>
    <div className={`tab-content ${activeTab !== 'saves' ? 'is-hidden' : ''}`}>
      <SavedRuns />
    </div>
  </div>
)

export default connector(Sidebar)
