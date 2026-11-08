import { useEffect, useMemo, useState } from 'react'
import Button from '../../../../components/ui/Button.jsx'
import Input from '../../../../components/ui/Input.jsx'
import Select from '../../../../components/ui/Select.jsx'
import Modal from '../../../../components/ui/Modal.jsx'
import Icon from '../../../../components/ui/Icon.jsx'
import { PageHeader, PanelHeader } from '../../../../components/ui/PageHeader.jsx'
import Tabs from '../../../../components/ui/Tabs.jsx'
import { Notice, StateMessage } from '../../../../components/ui/Feedback.jsx'
import FeeIcon from '../components/FeeIcon.jsx'
import { getResidentFees } from '../services/paymentService.js'
import { runtimeConfig } from '../../../../config/runtime.js'
import { formatCurrency, formatDate } from '../../../../utils/formatters.js'
import './payment-selection.css'

const filters = [
  { id: 'all', label: 'Tất cả' },
  { id: 'unpaid', label: 'Chưa thanh toán' },
  { id: 'paid', label: 'Đã thanh toán' },
]

export default function PaymentSelectionPage({ onNavigate }) {
  const [fees, setFees] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState([])
  const [paymentMethod, setPaymentMethod] = useState('bank')
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    let isMounted = true
    getResidentFees()
      .then((data) => { if (isMounted) setFees(data) })
      .catch((error) => { if (isMounted) setLoadError(error.message || 'Không thể tải danh sách khoản nộp.') })
      .finally(() => { if (isMounted) setLoading(false) })
    return () => { isMounted = false }
  }, [])

  const outstandingFees = useMemo(() => fees.filter((fee) => !fee.paid), [fees])
  const selectedFees = useMemo(() => fees.filter((fee) => selectedIds.includes(fee.id) && !fee.paid), [fees, selectedIds])
  const selectedTotal = selectedFees.reduce((sum, fee) => sum + fee.amount, 0)
  const outstandingTotal = outstandingFees.reduce((sum, fee) => sum + fee.amount, 0)
  const paidTotal = fees.filter((fee) => fee.paid).reduce((sum, fee) => sum + fee.amount, 0)

  const filteredFees = useMemo(() => fees.filter((fee) => {
    const matchesFilter = filter === 'all' || (filter === 'paid' ? fee.paid : !fee.paid)
    const searchText = `${fee.name} ${fee.period} ${fee.id}`.toLocaleLowerCase('vi-VN')
    return matchesFilter && searchText.includes(search.trim().toLocaleLowerCase('vi-VN'))
  }), [fees, filter, search])

  const toggleFee = (fee) => {
    if (fee.paid) return
    setSelectedIds((current) => current.includes(fee.id) ? current.filter((id) => id !== fee.id) : [...current, fee.id])
  }

  const selectAllOutstanding = () => {
    const visibleIds = filteredFees.filter((fee) => !fee.paid).map((fee) => fee.id)
    const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id))
    setSelectedIds((current) => allSelected
      ? current.filter((id) => !visibleIds.includes(id))
      : [...new Set([...current, ...visibleIds])])
  }

  const allVisibleSelected = filteredFees.filter((fee) => !fee.paid).length > 0
    && filteredFees.filter((fee) => !fee.paid).every((fee) => selectedIds.includes(fee.id))

  return (
    <div className="bm-page bm-payments-page">
      <PageHeader
        eyebrow="Tài chính căn hộ"
        title="Khoản nộp của tôi"
        description="Theo dõi các khoản phí và chuẩn bị thanh toán cho căn hộ của bạn."
        actions={<div className="bm-heading-apartment"><span><Icon name="home" size={16} /></span><div><small>CĂN HỘ ĐANG XEM</small><strong>BM-{runtimeConfig.residentApartmentId}</strong></div></div>}
      />

      <section className="bm-payment-stats" aria-label="Tổng quan khoản nộp">
        <article className="bm-stat-card bm-stat-card--blue">
          <div className="bm-stat-card__top"><span>Chưa thanh toán</span><span className="bm-stat-icon"><Icon name="wallet" size={17} /></span></div>
          <strong>{formatCurrency(outstandingTotal)}</strong>
          <div className="bm-stat-card__foot"><span className="bm-stat-dot bm-stat-dot--blue" />{outstandingFees.length} khoản đang chờ thanh toán</div>
        </article>
        <article className="bm-stat-card">
          <div className="bm-stat-card__top"><span>Đã thanh toán</span><span className="bm-stat-icon bm-stat-icon--green"><Icon name="checkCircle" size={17} /></span></div>
          <strong>{formatCurrency(paidTotal)}</strong>
          <div className="bm-stat-card__foot"><span className="bm-stat-dot bm-stat-dot--green" />{fees.filter((fee) => fee.paid).length} khoản đã hoàn tất</div>
        </article>
        <article className="bm-stat-card">
          <div className="bm-stat-card__top"><span>Được chọn</span><span className="bm-stat-icon bm-stat-icon--violet"><Icon name="receipt" size={17} /></span></div>
          <strong>{formatCurrency(selectedTotal)}</strong>
          <div className="bm-stat-card__foot"><span className="bm-stat-dot bm-stat-dot--violet" />{selectedFees.length} khoản trong phiếu thanh toán</div>
        </article>
      </section>

      <div className="bm-payment-layout">
        <section className="bm-panel bm-fee-panel">
          <PanelHeader
            title="Danh sách khoản nộp"
            description="Chọn một hoặc nhiều khoản cần thanh toán."
            actions={<span className="bm-count-pill">{fees.length} khoản</span>}
          />

          <div className="bm-fee-toolbar">
            <Tabs items={filters} value={filter} onChange={setFilter} ariaLabel="Lọc khoản nộp" />
            <div className="bm-fee-search"><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm khoản nộp..." icon="search" aria-label="Tìm khoản nộp" /></div>
          </div>

          <div className="bm-select-all-row">
            <label className="bm-check-label"><input type="checkbox" checked={allVisibleSelected} onChange={selectAllOutstanding} /><span>Chọn tất cả khoản chưa thanh toán đang hiển thị</span></label>
            <span>{selectedFees.length} đã chọn</span>
          </div>

          <div className="bm-fee-list" aria-live="polite">
            {loading ? <StateMessage status="loading">Đang tải khoản nộp...</StateMessage> : null}
            {!loading && loadError ? <StateMessage status="error">{loadError}</StateMessage> : null}
            {!loading && !loadError && filteredFees.length === 0 ? <StateMessage>Không tìm thấy khoản nộp phù hợp.</StateMessage> : null}
            {!loading && !loadError && filteredFees.map((fee) => {
              const selected = selectedIds.includes(fee.id)
              return (
                <article key={fee.id} className={`bm-fee-item ${selected ? 'is-selected' : ''} ${fee.paid ? 'is-paid' : ''}`}>
                  <label className="bm-fee-item__check" aria-label={`Chọn ${fee.name}`}>
                    <input type="checkbox" checked={selected} disabled={fee.paid} onChange={() => toggleFee(fee)} />
                  </label>
                  <FeeIcon category={fee.category} />
                  <div className="bm-fee-item__main">
                    <div className="bm-fee-item__title-line"><h3>{fee.name}</h3>{fee.paid ? <span className="bm-status-badge bm-status-badge--paid">Đã thanh toán</span> : <span className="bm-status-badge bm-status-badge--pending">Chưa thanh toán</span>}</div>
                    <p>{fee.description}</p>
                    <div className="bm-fee-meta"><span><Icon name="calendar" size={13} />{fee.period}</span><span><Icon name="clock" size={13} />Hạn {formatDate(fee.dueDate)}</span></div>
                  </div>
                  <div className="bm-fee-item__amount"><strong>{formatCurrency(fee.amount)}</strong><small>{fee.paid ? 'Đã ghi nhận' : 'Số tiền cần nộp'}</small></div>
                </article>
              )
            })}
          </div>
          <div className="bm-fee-panel__note"><Icon name="info" size={15} /><span>Dữ liệu khoản thu được tải trực tiếp từ API của căn hộ đang xem.</span></div>
        </section>

        <aside className="bm-payment-summary">
          <div className="bm-summary-card">
            <div className="bm-summary-card__header"><div><span className="bm-summary-icon"><Icon name="receipt" size={18} /></span><h2>Phiếu thanh toán</h2></div><span className="bm-summary-step">01 / 02</span></div>
            <p className="bm-summary-caption">Các khoản bạn đã chọn sẽ được tổng hợp tại đây.</p>
            <div className="bm-summary-selected">
              {selectedFees.length > 0 ? selectedFees.map((fee) => (
                <div className="bm-summary-line" key={fee.id}><div><strong>{fee.name}</strong><small>{fee.period}</small></div><span>{formatCurrency(fee.amount)}</span></div>
              )) : <div className="bm-summary-empty"><span><Icon name="wallet" size={20} /></span><p>Chưa có khoản nộp nào được chọn.</p><small>Chọn khoản nộp ở danh sách bên trái để tiếp tục.</small></div>}
            </div>
            <div className="bm-summary-total"><span>Tổng thanh toán</span><strong>{formatCurrency(selectedTotal)}</strong></div>
            <div className="bm-summary-method">
              <div className="bm-summary-method__title"><strong>Phương thức dự kiến</strong><span>Chưa phát sinh giao dịch</span></div>
              <Select
                aria-label="Phương thức thanh toán"
                value={paymentMethod}
                onChange={(event) => setPaymentMethod(event.target.value)}
                options={[
                  { value: 'bank', label: 'Chuyển khoản ngân hàng' },
                  { value: 'counter', label: 'Thanh toán tại quầy' },
                ]}
              />
            </div>
            <Button block size="large" disabled={selectedFees.length === 0 || loading} icon="receipt" onClick={() => setModalOpen(true)}>Xem phiếu thanh toán</Button>
            <div className="bm-summary-security"><Icon name="info" size={14} /><span>Backend hiện chỉ hỗ trợ đọc khoản thu; chưa có API tạo giao dịch thanh toán.</span></div>
          </div>
          <div className="bm-payment-help"><span><Icon name="message" size={16} /></span><div><strong>Cần kiểm tra khoản thu?</strong><p>Gửi yêu cầu tra cứu cho ban quản lý.</p><button type="button" onClick={() => onNavigate?.('queries')}>Tạo yêu cầu <Icon name="arrowUpRight" size={13} /></button></div></div>
        </aside>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Phiếu thanh toán"
        description="Kiểm tra các khoản đã chọn và phương thức dự kiến."
        footer={<><Button variant="outline" onClick={() => setModalOpen(false)}>Đóng</Button><Button disabled title="Backend chưa có API tạo giao dịch thanh toán">Chưa thể gửi thanh toán</Button></>}
      >
        <div className="bm-confirm-content">
          <div className="bm-confirm-list">{selectedFees.map((fee) => <div key={fee.id}><span>{fee.name}<small>{fee.period}</small></span><strong>{formatCurrency(fee.amount)}</strong></div>)}</div>
          <div className="bm-confirm-total"><span>Tổng cộng</span><strong>{formatCurrency(selectedTotal)}</strong></div>
          <div className="bm-confirm-method"><span>Phương thức đã chọn</span><strong>{paymentMethod === 'bank' ? 'Chuyển khoản ngân hàng' : 'Thanh toán tại quầy'}</strong></div>
          <Notice>Không có request thanh toán nào được gửi vì backend chưa định nghĩa endpoint cho thao tác này.</Notice>
        </div>
      </Modal>
    </div>
  )
}
