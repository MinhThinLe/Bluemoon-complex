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
  const [showPassword, setShowPassword] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    if (!username.trim() || !password) {
      setError('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.')
      event.currentTarget.querySelector(!username.trim() ? 'input[autocomplete="username"]' : 'input[autocomplete="current-password"]').focus()
      return
    }

    setSubmitting(true)
    setError('')
    try {
      await authenticate(username.trim(), password)
      onAuthenticated()
    } catch (requestError) {
      setError(requestError.status === 403 ? 'Tên đăng nhập hoặc mật khẩu không đúng.' : requestError.status === 0 ? 'Không thể kết nối đến máy chủ. Vui lòng thử lại.' : requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="bm-login-page">
      <section className="bm-login-panel" aria-labelledby="login-title">
        <div className="bm-login-brand">
          <div className="bm-login-brand__wordmark"><Icon name="moon" size={28} /><strong>bluemoon</strong></div>
          <small>CỔNG QUẢN LÝ</small>
        </div>
        <div className="bm-login-copy">
          <p className="bm-eyebrow">Xác thực tài khoản</p>
          <h1 id="login-title">Đăng nhập</h1>
          <p>Sử dụng tài khoản được cấp để truy cập hệ thống.</p>
        </div>
        <div className="bm-login-notice">{error && <Notice variant="error">{error}</Notice>}</div>
        <form className="bm-login-form" onSubmit={submit} noValidate>
          <Input label="Tên đăng nhập" required autoComplete="username" placeholder="Nhập tên đăng nhập" value={username} disabled={submitting} onChange={(event) => setUsername(event.target.value)} />
          <Input label="Mật khẩu" required type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} disabled={submitting} onChange={(event) => setPassword(event.target.value)} action={<button type="button" className="bm-field__action" aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} aria-pressed={showPassword} disabled={submitting} onClick={() => setShowPassword((current) => !current)}><Icon name="eye-off" size={16} /></button>} />
          <Button type="submit" block loading={submitting} icon="shield">{submitting ? 'Đang xác thực...' : 'Đăng nhập'}</Button>
        </form>
      </section>
    </main>
  )
}
