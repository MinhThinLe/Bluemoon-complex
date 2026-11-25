import { useState } from 'react'
import Button from '../../../components/ui/Button.jsx'
import { Notice } from '../../../components/ui/Feedback.jsx'
import Modal from '../../../components/ui/Modal.jsx'
import { logout } from '../services/authService.js'

export default function LogoutControl({ onLogout }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [hasError, setHasError] = useState(false)

  async function confirmLogout() {
    setHasError(false)
    setIsLoggingOut(true)
    try {
      await logout()
      onLogout()
    } catch (error) {
      if (error.status === 401) {
        onLogout()
      } else {
        setHasError(true)
      }
    } finally {
      setIsLoggingOut(false)
    }
  }

  return <>
    <Button variant="outline" size="small" icon="logOut" onClick={() => {
      setHasError(false)
      setIsOpen(true)
    }}>Đăng xuất</Button>
    <Modal
      isOpen={isOpen}
      onClose={isLoggingOut ? undefined : () => setIsOpen(false)}
      title="Đăng xuất khỏi BlueMoon?"
      description="Bạn sẽ cần đăng nhập lại để tiếp tục."
      footer={<>
        <Button variant="outline" disabled={isLoggingOut} onClick={() => setIsOpen(false)}>Ở lại</Button>
        <Button variant="danger" icon="logOut" loading={isLoggingOut} onClick={confirmLogout}>
          {isLoggingOut ? 'Đang đăng xuất…' : 'Đăng xuất'}
        </Button>
      </>}
    >
      {hasError && <Notice variant="error">Chưa thể xác nhận đã đăng xuất. Vui lòng thử lại.</Notice>}
    </Modal>
  </>
}
