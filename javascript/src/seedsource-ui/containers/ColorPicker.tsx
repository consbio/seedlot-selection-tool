import React from 'react'
import { t } from 'ttag'

interface ColorPickerProps {
  colors: string[]
  onPick: (color: string) => void
}

export default ({ colors, onPick }: ColorPickerProps) => {
  return (
    <div className="color-picker">
      {colors.map(color => {
        return (
          <div
            key={color}
            tabIndex={0}
            role="button"
            aria-label={t`Button to select color ${color}.`}
            className="is-clickable color"
            style={{ background: color }}
            onClick={() => onPick(color)}
            onKeyPress={event => {
              if (event.key === 'Enter') onPick(color)
            }}
          />
        )
      })}
    </div>
  )
}
