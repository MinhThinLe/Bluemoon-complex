import { useId } from 'react'
import Icon from './Icon.jsx'

export default function Input({
  label,
  hint,
  error,
  icon,
  as = 'input',
  className = '',
  id,
  ...props
}) {
  const generatedId = useId()
  const fieldId = id || generatedId
  const messageId = `${fieldId}-message`
  const Field = as === 'textarea' ? 'textarea' : 'input'

  return (
    <div className={`bm-field ${className}`.trim()}>
      {label && <label className="bm-field__label" htmlFor={fieldId}>{label}</label>}
      <div className={`bm-field__control ${icon ? 'has-icon' : ''} ${error ? 'is-error' : ''}`}>
        {icon && <Icon name={icon} size={17} className="bm-field__icon" />}
        <Field id={fieldId} className="bm-input" aria-invalid={Boolean(error)} aria-describedby={error || hint ? messageId : undefined} {...props} />
      </div>
      {error ? <span id={messageId} className="bm-field__message bm-field__message--error">{error}</span> : hint ? <span id={messageId} className="bm-field__message">{hint}</span> : null}
    </div>
  )
}
