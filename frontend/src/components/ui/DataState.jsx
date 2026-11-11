import Button from './Button.jsx'
import Icon from './Icon.jsx'

export default function DataState({ loading = false, error, onRetry, children }) {
  return <div className="bm-state" role={error ? 'alert' : 'status'} aria-live="polite">
    {loading ? <span className="bm-spinner" aria-hidden="true" /> : <Icon name={error ? 'alert' : 'file'} size={32} />}
    <p>{error ? error.status === 403 ? 'Tài khoản không có quyền thực hiện thao tác này.' : error.status === 0 ? 'Không thể kết nối đến máy chủ. Vui lòng thử lại.' : error.message : children}</p>
    {error && error.status !== 403 && onRetry && <Button variant="outline" onClick={onRetry}>Thử lại</Button>}
  </div>
}
