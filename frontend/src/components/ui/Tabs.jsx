export default function Tabs({ items, value, onChange, ariaLabel, className = '' }) {
  return (
    <div className={`bm-tabs ${className}`.trim()} role="tablist" aria-label={ariaLabel}>
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          role="tab"
          aria-selected={value === item.id}
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
