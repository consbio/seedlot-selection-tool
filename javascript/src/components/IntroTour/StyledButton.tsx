import React from 'react'

// MIGHT NOT BE NEEDED

interface StyledButtonProps {
  color: 'primary' | 'neutral'
  label: string
  onClick: () => void
  classes?: string
  disabled?: boolean
}

function StyledButton({ color, label, onClick, classes, disabled }: StyledButtonProps) {
  const colorClass = color === 'primary' ? 'is-primary' : ''
  const className = `button ${colorClass} ${classes}`.trim()

  return (
    <button type="button" className={className} onClick={onClick} disabled={disabled}>
      {label}
    </button>
  )
}

StyledButton.defaultProps = {
  classes: '',
  disabled: false,
} as Partial<StyledButtonProps>

export default StyledButton
