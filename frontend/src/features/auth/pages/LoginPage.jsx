import { useState } from 'react'
import Button from '../../../components/ui/Button.jsx'
import Icon from '../../../components/ui/Icon.jsx'
import Input from '../../../components/ui/Input.jsx'
import { Notice } from '../../../components/ui/Feedback.jsx'
import { authenticate } from '../services/authService.js'
import './login.css'

export default function LoginPage({ onAuthenticated }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const submit = async (event) => {
    event.preventDefault()
    if (!username.trim() || !password) {
      setError('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.')
      return
    }

    setSubmitting(true)
    setError('')
    try {
      await authenticate(username.trim(), password)
      onAuthenticated()
    } catch (requestError) {
      setError(requestError.status === 403 ? 'Tên đăng nhập hoặc mật khẩu không đúng.' : requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="bm-login-page">
      <section className="bm-login-panel" aria-labelledby="login-title">
        <div className="bm-login-brand">
          <span><Icon name="moon" size={24} /></span>
          <div><strong>bluemoon</strong><small>RESIDENT PORTAL</small></div>
        </div>
        <div className="bm-login-copy">
          <p className="bm-eyebrow">Xác thực tài khoản</p>
          <h1 id="login-title">Đăng nhập</h1>
          <p>Sử dụng tài khoản được cấp để truy cập dữ liệu và thao tác với hệ thống.</p>
        </div>
        {error && <Notice variant="error">{error}</Notice>}
        <form className="bm-login-form" onSubmit={submit} noValidate>
          <Input label="Tên đăng nhập" autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} />
          <Input label="Mật khẩu" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} />
          <Button type="submit" size="large" block disabled={submitting} icon="shield">{submitting ? 'Đang xác thực...' : 'Đăng nhập'}</Button>
        </form>
      </section>
    </main>
  )
}
