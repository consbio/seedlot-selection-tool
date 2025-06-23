import React from 'react'
import ReactDOM from 'react-dom'

type EditableLabelProps = {
  children?: React.ReactNode | null
  value: string | number
  onChange: (value: string) => any
}

type EditableLabelState = {
  editValue: string | null
  edit: boolean
}

class EditableLabel extends React.Component<EditableLabelProps, EditableLabelState> {
  valueInput?: HTMLInputElement

  static defaultProps = {
    children: null,
  }

  constructor(props: any) {
    super(props)
    this.state = { editValue: null, edit: false }
  }

  componentDidUpdate() {
    const inputNode = ReactDOM.findDOMNode(this.valueInput)
    const { edit } = this.state

    if (inputNode && edit && inputNode !== document.activeElement) {
      ;(inputNode as HTMLInputElement).select()
    }
  }

  render() {
    const { editValue, edit } = this.state
    const { children, value, onChange } = this.props

    if (!edit) {
      return (
        <span className="editable-label" onClick={() => this.setState({ edit: true })}>
          {value}
          {children}
        </span>
      )
    }

    return (
      <div className="editable-label edit">
        <input
          ref={input => {
            if (input) {
              this.valueInput = input
            }
          }}
          type="text"
          data-lpignore="true"
          className="input is-small is-inline"
          style={{ width: '75px' }}
          value={editValue === null ? value : editValue}
          onChange={e => {
            this.setState({ editValue: e.target.value })
          }}
          onBlur={e => {
            if (parseFloat(e.target.value) !== parseFloat(value as any)) {
              onChange(e.target.value)
            }
            this.setState({ editValue: null, edit: false })
          }}
          onKeyUp={e => {
            if (e.key === 'Enter') {
              ;(e.target as HTMLInputElement).blur()
            }
            if (e.key === 'Escape') {
              this.setState({ editValue: null, edit: false })
            }
          }}
        />
        {children}
      </div>
    )
  }
}

export default EditableLabel
