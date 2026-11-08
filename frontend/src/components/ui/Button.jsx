import Icon from './Icon.jsx'

export default function Button({
  children,
  variant = 'primary',
  size = 'medium',
  icon,
  iconRight,
  block = false,
  className = '',
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      className={`bm-button bm-button--${variant} bm-button--${size} ${block ? 'bm-button--block' : ''} ${className}`.trim()}
      {...props}
    >
      {icon && <Icon name={icon} size={17} />}
      <span>{children}</span>
      {iconRight && <Icon name={iconRight} size={16} />}
    </button>
  )
}
