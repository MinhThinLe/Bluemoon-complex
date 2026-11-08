import { useEffect, useId } from 'react'
import Icon from './Icon.jsx'

export default function Modal({ isOpen, onClose, title, description, children, footer, size = 'medium' }) {
  const titleId = useId()
  const descriptionId = useId()
  useEffect(() => {
    if (!isOpen) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="bm-modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose?.()}>
      <section className={`bm-modal bm-modal--${size}`} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={description ? descriptionId : undefined}>
        <header className="bm-modal__header">
          <div>
            <h2 id={titleId}>{title}</h2>
            {description && <p id={descriptionId}>{description}</p>}
          </div>
          <button className="bm-icon-button bm-modal__close" type="button" onClick={onClose} aria-label="Đóng hộp thoại">
            <Icon name="close" size={19} />
          </button>
        </header>
        <div className="bm-modal__body">{children}</div>
        {footer && <footer className="bm-modal__footer">{footer}</footer>}
      </section>
    </div>
  )
}
