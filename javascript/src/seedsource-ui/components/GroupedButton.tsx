import React, { ReactNode } from 'react'

type GroupedButtonProps = {
  active: boolean
  onClick: () => any
  children: ReactNode
}

const GroupedButton = ({ active, children, onClick }: GroupedButtonProps) => (
  <li className={active ? 'is-active' : ''}>
    <a
      href="#"
      onClick={e => {
        e.preventDefault()
        onClick()
      }}
    >
      {children}
    </a>
  </li>
)

export default GroupedButton
