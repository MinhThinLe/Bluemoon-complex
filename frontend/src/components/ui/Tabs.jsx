export default function Tabs({ items, value, onChange, ariaLabel, disabled = false, className = '' }) {
  return (
    <div className={`bm-tabs ${className}`.trim()} role="tablist" aria-label={ariaLabel}>
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          role="tab"
          aria-selected={value === item.id}
          tabIndex={value === item.id ? 0 : -1}
          disabled={disabled}
          onKeyDown={(event) => {
            if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
            event.preventDefault()
            const current = items.findIndex((entry) => entry.id === value)
            const index = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : (current + (event.key === 'ArrowRight' ? 1 : -1) + items.length) % items.length
            onChange(items[index].id)
            event.currentTarget.parentElement.querySelectorAll('[role="tab"]')[index].focus()
          }}
          className={value === item.id ? 'is-active' : ''}
          onClick={() => onChange(item.id)}
        >
          {item.label}
          {item.count !== undefined && <span className="bm-tabs__count">{item.count}</span>}
        </button>
      ))}
    </div>
  )
}
