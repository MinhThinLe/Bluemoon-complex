import Button from '../../../components/ui/Button.jsx'
import Icon from '../../../components/ui/Icon.jsx'
import './welcome.css'

const CAPABILITIES = [
  ['building', 'Cấu hình biểu phí'],
  ['wallet', 'Theo dõi khoản thu'],
  ['activity', 'Báo cáo nội bộ'],
]

export default function WelcomePage({ onStart }) {
  return <main className="bm-welcome-page">
    <div className="bm-welcome-orbit" aria-hidden="true" />
    <header className="bm-welcome-nav">
      <div className="bm-welcome-brand"><Icon name="moon" size={32} /><span><strong>bluemoon</strong><small>Quản lý khoản thu chung cư</small></span></div>
      <Button variant="outline" size="small" onClick={onStart}>Đăng nhập</Button>
    </header>
    <section className="bm-welcome-hero" aria-labelledby="welcome-title">
      <p className="bm-welcome-eyebrow">Cổng quản lý nội bộ</p>
      <h1 id="welcome-title">Quản lý khoản thu chung cư</h1>
      <p>Hỗ trợ ban quản lý theo dõi khoản thu và đối soát công nợ.</p>
      <Button onClick={onStart} iconRight="arrow-right">Vào hệ thống</Button>
    </section>
    <section className="bm-welcome-capabilities" aria-label="Chức năng chính">
      {CAPABILITIES.map(([icon, label]) => <article key={icon}><Icon name={icon} size={20} /><span>{label}</span></article>)}
    </section>
  </main>
}
