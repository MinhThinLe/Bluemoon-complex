import Icon from './Icon.jsx'

export function Notice({ variant = 'info', children, className = '' }) {
  const icon = variant === 'success' ? 'checkCircle' : variant === 'error' ? 'alert' : 'info'
  return (
    <div className={`bm-notice bm-notice--${variant} ${className}`.trim()} role={variant === 'error' ? 'alert' : 'status'}>
      <Icon name={icon} size={17} />
      <span>{children}</span>
    </div>
  )
}
