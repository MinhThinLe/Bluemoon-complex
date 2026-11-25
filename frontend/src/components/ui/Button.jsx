import Icon from './Icon.jsx'

export default function Button({
  children,
  variant = 'primary',
  size = 'medium',
  icon,
  iconRight,
  block = false,
  loading = false,
  disabled = false,
  className = '',
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={loading || disabled}
      aria-busy={loading || undefined}
      className={`bm-button bm-button--${variant} bm-button--${size} ${block ? 'bm-button--block' : ''} ${className}`.trim()}
      {...props}
    >
      {loading ? <span className="bm-spinner" aria-hidden="true" /> : icon && <Icon name={icon} size={17} />}
      <span>{children}</span>
      {iconRight && <Icon name={iconRight} size={16} />}
    </button>
  )
}
