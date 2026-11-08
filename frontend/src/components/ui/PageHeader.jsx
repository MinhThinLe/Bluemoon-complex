export function PageHeader({ eyebrow, title, description, actions, className = '' }) {
  return (
    <header className={`bm-page-heading ${className}`.trim()}>
      <div className="bm-page-heading__copy">
        {eyebrow && <p className="bm-eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p className="bm-page-heading__description">{description}</p>}
      </div>
      {actions && <div className="bm-page-heading__actions">{actions}</div>}
    </header>
  )
}

export function PanelHeader({ eyebrow, title, description, actions, className = '' }) {
  return (
    <div className={`bm-panel__heading ${className}`.trim()}>
      <div>
        {eyebrow && <p className="bm-eyebrow">{eyebrow}</p>}
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="bm-panel__actions">{actions}</div>}
    </div>
  )
}
