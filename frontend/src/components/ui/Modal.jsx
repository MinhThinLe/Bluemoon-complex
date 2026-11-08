import { useEffect } from 'react'
import Icon from './Icon.jsx'

export default function Modal({ isOpen, onClose, title, description, children, footer, size = 'medium' }) {
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
      <section className={`bm-modal bm-modal--${size}`} role="dialog" aria-modal="true" aria-labelledby="bm-modal-title">
        <header className="bm-modal__header">
          <div>
            <h2 id="bm-modal-title">{title}</h2>
            {description && <p>{description}</p>}
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
