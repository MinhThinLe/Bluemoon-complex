import { useEffect, useMemo, useState } from 'react'
import Button from '../../../../components/ui/Button.jsx'
import Input from '../../../../components/ui/Input.jsx'
import Select from '../../../../components/ui/Select.jsx'
import Table from '../../../../components/ui/Table.jsx'
import Modal from '../../../../components/ui/Modal.jsx'
import Icon from '../../../../components/ui/Icon.jsx'
import { PageHeader, PanelHeader } from '../../../../components/ui/PageHeader.jsx'
import Tabs from '../../../../components/ui/Tabs.jsx'
import { Notice, StateMessage } from '../../../../components/ui/Feedback.jsx'
import { createQueryRequest, getQueryRequests, QUERY_REQUEST_UNAVAILABLE } from '../services/queryRequestService.js'
import { formatDate } from '../../../../utils/formatters.js'
import './query-request.css'

const requestTypes = [
  { value: 'payment_confirmation', label: 'Xác nhận thanh toán' },
  { value: 'fee_information', label: 'Tra cứu thông tin khoản thu' },
  { value: 'amount_dispute', label: 'Kiểm tra số tiền khoản thu' },
  { value: 'other', label: 'Yêu cầu khác' },
]

const relatedFees = [
  { value: '', label: 'Không liên quan khoản thu' },
]

const statusCopy = {
  waiting: { label: 'Chờ tiếp nhận', className: 'waiting', icon: 'clock' },
  processing: { label: 'Đang xử lý', className: 'processing', icon: 'activity' },
  resolved: { label: 'Đã phản hồi', className: 'resolved', icon: 'checkCircle' },
}

const initialForm = { title: '', type: 'fee_information', relatedFee: '', description: '' }

function StatusBadge({ status }) {
  const config = statusCopy[status] || statusCopy.waiting
  return <span className={`bm-request-status bm-request-status--${config.className}`}><Icon name={config.icon} size={12} />{config.label}</span>
}

export default function QueryRequestPage() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [capabilityUnavailable, setCapabilityUnavailable] = useState(false)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [detailRequest, setDetailRequest] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [toast, setToast] = useState('')

  useEffect(() => {
    let isMounted = true
    getQueryRequests()
      .then((data) => { if (isMounted) setRequests(data) })
      .catch((error) => {
        if (!isMounted) return
        if (error.code === 'API_CAPABILITY_UNAVAILABLE') setCapabilityUnavailable(true)
        else setLoadError(error.message || 'Không thể tải lịch sử yêu cầu.')
      })
      .finally(() => { if (isMounted) setLoading(false) })
    return () => { isMounted = false }
  }, [])

  const counts = useMemo(() => ({
    total: requests.length,
    waiting: requests.filter((item) => item.status === 'waiting').length,
    processing: requests.filter((item) => item.status === 'processing').length,
    resolved: requests.filter((item) => item.status === 'resolved').length,
  }), [requests])

  const filteredRequests = useMemo(() => requests.filter((item) => {
    const matchesFilter = filter === 'all' || item.status === filter
    const text = `${item.id} ${item.title} ${item.typeLabel}`.toLocaleLowerCase('vi-VN')
    return matchesFilter && text.includes(search.trim().toLocaleLowerCase('vi-VN'))
  }), [requests, filter, search])

  const validate = () => {
    const nextErrors = {}
    if (!form.title.trim()) nextErrors.title = 'Vui lòng nhập tiêu đề yêu cầu.'
    if (form.title.trim().length > 100) nextErrors.title = 'Tiêu đề không được vượt quá 100 ký tự.'
    if (!form.description.trim()) nextErrors.description = 'Vui lòng mô tả nội dung cần tra cứu.'
    else if (form.description.trim().length < 15) nextErrors.description = 'Nội dung cần có ít nhất 15 ký tự để ban quản lý hiểu yêu cầu.'
    setFormErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitError('')
    if (!validate()) return
    setSubmitting(true)
    try {
      const typeLabel = requestTypes.find((item) => item.value === form.type)?.label || 'Yêu cầu khác'
      const created = await createQueryRequest({
        title: form.title.trim(),
        type: form.type,
        typeLabel,
        relatedFee: form.relatedFee || 'Không liên quan khoản thu',
        description: form.description.trim(),
      })
      setRequests((current) => [created, ...current])
      setCreateOpen(false)
      setForm(initialForm)
      setFormErrors({})
      setToast('Yêu cầu tra cứu đã được gửi thành công.')
      window.setTimeout(() => setToast(''), 4200)
    } catch (error) {
      setSubmitError(error.message || 'Không thể gửi yêu cầu. Vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  const columns = [
    {
      key: 'request', title: 'Mã yêu cầu', width: '130px',
      render: (item) => <div className="bm-request-code"><span>{item.id}</span><small>{formatDate(item.createdAt)}</small></div>,
    },
    {
      key: 'title', title: 'Nội dung yêu cầu',
      render: (item) => <div className="bm-request-title"><strong>{item.title}</strong><small>{item.relatedFee}</small></div>,
    },
    { key: 'typeLabel', title: 'Loại yêu cầu', width: '165px', render: (item) => <span className="bm-request-type">{item.typeLabel}</span> },
    { key: 'status', title: 'Trạng thái', width: '140px', render: (item) => <StatusBadge status={item.status} /> },
    { key: 'action', title: '', width: '76px', align: 'right', render: (item) => <Button size="small" variant="ghost" iconRight="arrowUpRight" onClick={() => setDetailRequest(item)}>Chi tiết</Button> },
  ]

  return (
    <div className="bm-page bm-queries-page">
      <PageHeader
        className="bm-query-heading"
        eyebrow="Trung tâm hỗ trợ"
        title="Yêu cầu tra cứu"
        description="Gửi thắc mắc về khoản thu và theo dõi phản hồi từ ban quản lý."
        actions={<Button icon="plus" size="large" disabled={capabilityUnavailable} onClick={() => { setForm(initialForm); setFormErrors({}); setSubmitError(''); setCreateOpen(true) }}>Tạo yêu cầu mới</Button>}
      />

      {capabilityUnavailable && <Notice className="bm-query-capability-notice">{QUERY_REQUEST_UNAVAILABLE} Màn hình được giữ để sẵn sàng tích hợp khi contract được bổ sung.</Notice>}

      <section className="bm-query-welcome">
        <div className="bm-query-welcome__copy"><span className="bm-query-welcome__eyebrow">BLUEMOON SUPPORT</span><h2>Chúng tôi luôn sẵn sàng lắng nghe.</h2><p>Mô tả vấn đề bạn gặp phải. Ban quản lý sẽ tiếp nhận và phản hồi ngay trên hệ thống.</p><button type="button" disabled={capabilityUnavailable} onClick={() => setCreateOpen(true)}>Gửi yêu cầu tra cứu <Icon name="arrowUpRight" size={14} /></button></div>
        <div className="bm-query-illustration" aria-hidden="true"><div className="bm-query-illustration__halo" /><div className="bm-query-illustration__bubble bm-query-illustration__bubble--one"><Icon name="message" size={22} /></div><div className="bm-query-illustration__bubble bm-query-illustration__bubble--two"><Icon name="checkCircle" size={19} /></div><div className="bm-query-illustration__building"><div /><div /><div /><div /><div /><div /><div /><div /><div /><div /><div /><div /></div></div>
      </section>

      <section className="bm-query-stats" aria-label="Thống kê yêu cầu tra cứu">
        <article className="bm-query-stat"><span className="bm-query-stat__icon"><Icon name="file" size={17} /></span><div><small>Tổng yêu cầu</small><strong>{counts.total}</strong></div></article>
        <article className="bm-query-stat"><span className="bm-query-stat__icon bm-query-stat__icon--amber"><Icon name="clock" size={17} /></span><div><small>Chờ tiếp nhận</small><strong>{counts.waiting}</strong></div></article>
        <article className="bm-query-stat"><span className="bm-query-stat__icon bm-query-stat__icon--blue"><Icon name="activity" size={17} /></span><div><small>Đang xử lý</small><strong>{counts.processing}</strong></div></article>
        <article className="bm-query-stat"><span className="bm-query-stat__icon bm-query-stat__icon--green"><Icon name="checkCircle" size={17} /></span><div><small>Đã phản hồi</small><strong>{counts.resolved}</strong></div></article>
      </section>

      <section className="bm-panel bm-request-panel">
        <PanelHeader
          className="bm-request-panel__heading"
          title="Lịch sử yêu cầu"
          description="Thông tin các yêu cầu bạn đã gửi đến ban quản lý."
          actions={<div className="bm-request-search"><Input value={search} onChange={(event) => setSearch(event.target.value)} icon="search" placeholder="Tìm theo mã hoặc nội dung..." aria-label="Tìm yêu cầu" /></div>}
        />
        <Tabs
          className="bm-request-filters"
          ariaLabel="Lọc trạng thái yêu cầu"
          value={filter}
          onChange={setFilter}
          items={[{ id: 'all', label: 'Tất cả', count: counts.total }, { id: 'waiting', label: 'Chờ tiếp nhận', count: counts.waiting }, { id: 'processing', label: 'Đang xử lý', count: counts.processing }, { id: 'resolved', label: 'Đã phản hồi', count: counts.resolved }]}
        />
        {loading ? <StateMessage status="loading">Đang tải lịch sử yêu cầu...</StateMessage> : loadError ? <StateMessage status="error">{loadError}</StateMessage> : (
          <Table columns={columns} data={filteredRequests} rowKey="id" emptyMessage="Không có yêu cầu nào phù hợp với bộ lọc." className="bm-request-table" />
        )}
        <div className="bm-request-panel__foot"><span>Hiển thị {filteredRequests.length} / {requests.length} yêu cầu</span><span><Icon name="info" size={13} /> Trạng thái được cập nhật bởi ban quản lý.</span></div>
      </section>

      {toast && <div className="bm-toast" role="status"><Icon name="checkCircle" size={17} />{toast}<button type="button" onClick={() => setToast('')} aria-label="Đóng thông báo"><Icon name="close" size={14} /></button></div>}

      <Modal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Tạo yêu cầu tra cứu"
        description="Cung cấp thông tin cụ thể để ban quản lý hỗ trợ chính xác hơn."
        size="large"
        footer={<><Button variant="outline" onClick={() => setCreateOpen(false)}>Hủy</Button><Button type="submit" form="query-request-form" icon="send" disabled={submitting}>{submitting ? 'Đang gửi...' : 'Gửi yêu cầu'}</Button></>}
      >
        <form id="query-request-form" className="bm-query-form" onSubmit={handleSubmit} noValidate>
          <Input label="Tiêu đề yêu cầu *" placeholder="Ví dụ: Kiểm tra khoản phí tháng 11" value={form.title} maxLength={100} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} error={formErrors.title} />
          <div className="bm-query-form__grid">
            <Select label="Loại yêu cầu *" value={form.type} onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))} options={requestTypes} />
            <Select label="Khoản thu liên quan" value={form.relatedFee} onChange={(event) => setForm((current) => ({ ...current, relatedFee: event.target.value }))} options={relatedFees} />
          </div>
          <Input as="textarea" label="Nội dung cần tra cứu *" placeholder="Mô tả chi tiết vấn đề, thời gian phát sinh hoặc thông tin bạn muốn được giải đáp..." rows={5} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} error={formErrors.description} hint="Không nhập mật khẩu hoặc thông tin thanh toán nhạy cảm vào nội dung yêu cầu." />
          {submitError && <p className="bm-form-error"><Icon name="alert" size={15} />{submitError}</p>}
          <div className="bm-query-form__privacy"><Icon name="shield" size={15} /><span>Thông tin sẽ được gửi đến bộ phận quản lý để tiếp nhận và xử lý qua API khi backend hỗ trợ capability này.</span></div>
        </form>
      </Modal>

      <Modal
        isOpen={Boolean(detailRequest)}
        onClose={() => setDetailRequest(null)}
        title="Chi tiết yêu cầu"
        description={detailRequest?.id}
        footer={<Button variant="outline" onClick={() => setDetailRequest(null)}>Đóng</Button>}
      >
        {detailRequest && <div className="bm-request-detail">
          <div className="bm-request-detail__top"><StatusBadge status={detailRequest.status} /><span>Ngày gửi: {formatDate(detailRequest.createdAt)}</span></div>
          <h3>{detailRequest.title}</h3>
          <div className="bm-request-detail__meta"><div><small>LOẠI YÊU CẦU</small><strong>{detailRequest.typeLabel}</strong></div><div><small>KHOẢN THU LIÊN QUAN</small><strong>{detailRequest.relatedFee}</strong></div></div>
          <div className="bm-request-detail__section"><strong>Nội dung đã gửi</strong><p>{detailRequest.description}</p></div>
          <div className="bm-request-detail__response"><span><Icon name="message" size={15} />Phản hồi từ ban quản lý</span><p>{detailRequest.response || 'Yêu cầu đang được tiếp nhận. Phản hồi sẽ hiển thị tại đây khi ban quản lý cập nhật.'}</p></div>
        </div>}
      </Modal>
    </div>
  )
}
