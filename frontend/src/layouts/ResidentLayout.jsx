import { useMemo, useState } from 'react'
import Icon from '../components/ui/Icon.jsx'
import './ResidentLayout.css'

const navigation = [
  { id: 'payments', label: 'Khoản nộp', icon: 'wallet', group: 'DỊCH VỤ CƯ DÂN' },
  { id: 'queries', label: 'Yêu cầu tra cứu', icon: 'message' },
]

const screenCopy = {
  payments: { title: 'Khoản nộp của tôi', crumb: 'Tài chính / Khoản nộp' },
  queries: { title: 'Yêu cầu tra cứu', crumb: 'Hỗ trợ / Yêu cầu tra cứu' },
}

export default function ResidentLayout({ currentPage, onNavigate, children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const current = useMemo(() => screenCopy[currentPage] || screenCopy.payments, [currentPage])
  const formattedToday = new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  }).format(new Date())

  const navigate = (page) => {
    onNavigate(page)
    setMobileMenuOpen(false)
  }

  return (
    <div className="bm-app-shell">
      {mobileMenuOpen && <button className="bm-sidebar-scrim" aria-label="Đóng menu" onClick={() => setMobileMenuOpen(false)} />}
      <aside className={`bm-sidebar ${mobileMenuOpen ? 'is-open' : ''}`}>
        <div className="bm-brand">
          <div className="bm-brand__mark"><Icon name="moon" size={23} strokeWidth={2} /></div>
          <div className="bm-brand__wordmark">blue<span>moon</span><small>RESIDENT PORTAL</small></div>
        </div>

        <div className="bm-sidebar__community">
          <div className="bm-sidebar__community-icon"><Icon name="building" size={18} /></div>
          <div><strong>Chung cư Bluemoon</strong><span>Cổng thông tin cư dân</span></div>
          <Icon name="chevron" size={15} className="bm-sidebar__community-arrow" />
        </div>

        <nav className="bm-navigation" aria-label="Điều hướng chính">
          <p className="bm-navigation__label">TỔNG QUAN</p>
          <button className="bm-nav-item bm-nav-item--disabled" type="button" disabled title="Mục này chưa nằm trong phạm vi hiện tại">
            <Icon name="grid" size={18} /><span>Tổng quan</span><span className="bm-nav-item__soon">Sắp có</span>
          </button>
          <p className="bm-navigation__label bm-navigation__label--spaced">DỊCH VỤ CƯ DÂN</p>
          {navigation.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`bm-nav-item ${currentPage === item.id ? 'is-active' : ''}`}
              onClick={() => navigate(item.id)}
              aria-current={currentPage === item.id ? 'page' : undefined}
            >
              <Icon name={item.icon} size={18} />
              <span>{item.label}</span>
              {item.id === 'queries' && <span className="bm-nav-item__dot" />}
            </button>
          ))}
        </nav>

        <div className="bm-sidebar__bottom">
          <div className="bm-help-card">
            <div className="bm-help-card__icon"><Icon name="sparkle" size={17} /></div>
            <strong>Cần hỗ trợ?</strong>
            <p>Gửi yêu cầu để ban quản lý hỗ trợ bạn nhanh hơn.</p>
            <button type="button" onClick={() => navigate('queries')}>Tạo yêu cầu <Icon name="arrowUpRight" size={13} /></button>
          </div>
          <div className="bm-sidebar__version"><span className="bm-status-dot" /> Phiên bản thử nghiệm <span>v0.1</span></div>
        </div>
      </aside>

      <div className="bm-main-column">
        <header className="bm-topbar">
          <div className="bm-topbar__left">
            <button className="bm-icon-button bm-mobile-menu" type="button" onClick={() => setMobileMenuOpen(true)} aria-label="Mở menu"><Icon name="grid" /></button>
            <div className="bm-breadcrumb">CƯ DÂN <span>/</span> {current.crumb}</div>
          </div>
          <div className="bm-topbar__right">
            <div className="bm-topbar__date"><Icon name="calendar" size={15} /> <span>{formattedToday}</span></div>
            <button className="bm-notification" type="button" aria-label="Thông báo">
              <Icon name="bell" size={19} /><i />
            </button>
            <div className="bm-profile">
              <div className="bm-profile__avatar">BM</div>
              <div className="bm-profile__details"><strong>Tài khoản cư dân</strong><span>Căn hộ BM-1208</span></div>
              <Icon name="chevron" size={15} />
            </div>
          </div>
        </header>

        <main className="bm-content">
          {children}
          <footer className="bm-footer"><span>© {new Date().getFullYear()} Bluemoon Resident Portal</span><span>Không gian sống an tâm, kết nối thuận tiện.</span></footer>
        </main>
      </div>
    </div>
  )
}
