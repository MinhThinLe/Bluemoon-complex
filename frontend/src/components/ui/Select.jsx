import { useId } from 'react'
import Icon from './Icon.jsx'

export default function Select({ label, hint, error, options = [], className = '', id, ...props }) {
  const generatedId = useId()
  const fieldId = id || generatedId
  const messageId = `${fieldId}-message`

  return (
    <div className={`bm-field ${className}`.trim()}>
      {label && <label className="bm-field__label" htmlFor={fieldId}>{label}</label>}
      <div className={`bm-field__control bm-select-wrap ${error ? 'is-error' : ''}`}>
        <select id={fieldId} className="bm-input bm-select" aria-invalid={Boolean(error)} aria-describedby={error || hint ? messageId : undefined} {...props}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        <Icon name="chevron" size={16} className="bm-select__chevron" />
      </div>
      {error ? <span id={messageId} className="bm-field__message bm-field__message--error">{error}</span> : hint ? <span id={messageId} className="bm-field__message">{hint}</span> : null}
    </div>
  )
}
