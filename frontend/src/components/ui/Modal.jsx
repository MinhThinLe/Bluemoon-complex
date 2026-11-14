import { useEffect, useId, useRef } from 'react'
import Icon from './Icon.jsx'

export default function Modal({ isOpen, onClose, title, description, children, footer, size = 'medium' }) {
  const titleId = useId()
  const descriptionId = useId()
  const dialogRef = useRef(null)
  useEffect(() => {
    if (!isOpen) return undefined
    const previousFocus = document.activeElement
    const previousOverflow = document.body.style.overflow
    dialogRef.current.showModal()
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
      previousFocus?.focus()
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
      <dialog ref={dialogRef} className={`bm-modal bm-modal--${size}`} aria-labelledby={titleId} aria-describedby={description ? descriptionId : undefined} onCancel={(event) => { event.preventDefault(); onClose?.() }} onClick={(event) => {
        if (event.target !== event.currentTarget) return
        const rect = event.currentTarget.getBoundingClientRect()
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose?.()
      }}>
        <header className="bm-modal__header">
          <div>
            <h2 id={titleId}>{title}</h2>
            {description && <p id={descriptionId}>{description}</p>}
          </div>
          <button className="bm-icon-button bm-modal__close" type="button" onClick={onClose} disabled={!onClose} aria-label="Đóng hộp thoại">
            <Icon name="close" size={19} />
          </button>
        </header>
        <div className="bm-modal__body">{children}</div>
        {footer && <footer className="bm-modal__footer">{footer}</footer>}
      </dialog>
  )
}
