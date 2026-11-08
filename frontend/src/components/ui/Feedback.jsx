import Icon from './Icon.jsx'

export function StateMessage({ status = 'empty', children, className = '' }) {
  const icon = status === 'loading' ? null : status === 'error' ? 'alert' : 'file'
  return (
    <div className={`bm-state-message bm-state-message--${status} ${className}`.trim()} role={status === 'error' ? 'alert' : 'status'}>
      {status === 'loading' ? <span className="bm-loader" /> : <Icon name={icon} />}
      <span>{children}</span>
    </div>
  )
}

export function Notice({ variant = 'info', children, className = '' }) {
  const icon = variant === 'success' ? 'checkCircle' : variant === 'error' ? 'alert' : 'info'
  return (
    <div className={`bm-notice bm-notice--${variant} ${className}`.trim()} role={variant === 'error' ? 'alert' : 'status'}>
      <Icon name={icon} size={17} />
      <span>{children}</span>
    </div>
  )
}
