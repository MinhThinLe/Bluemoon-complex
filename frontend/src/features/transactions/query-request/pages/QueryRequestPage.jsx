import { useEffect, useMemo, useState } from 'react'
import Button from '../../../../components/ui/Button.jsx'
import { Notice } from '../../../../components/ui/Feedback.jsx'
import { PageHeader, PanelHeader } from '../../../../components/ui/PageHeader.jsx'
import Select from '../../../../components/ui/Select.jsx'
import Table from '../../../../components/ui/Table.jsx'
import Tabs from '../../../../components/ui/Tabs.jsx'
import { formatCurrency, formatDate } from '../../../../utils/formatters.js'
import { getTransactionsByApartment } from '../../services/transactionService.js'
import { getApartmentsByFloor } from '../../../fees/payment-selection/services/paymentSelectionService.js'
import './query-request.css'

const FLOOR_OPTIONS = Array.from({ length: 30 }, (_, index) => ({
  value: String(index + 1),
  label: `Tầng ${index + 1}`,
}))

function floorFromApartment(apartmentId) {
  const id = Number(apartmentId)
  if (!Number.isInteger(id) || id <= 0) return '1'
  return String(Math.min(30, Math.max(1, Math.floor(id / 100))))
}

export default function QueryRequestPage({ initialApartmentId = null, initialSelectedFeeIds = [], onBackToSelection }) {
  const [floor, setFloor] = useState(() => floorFromApartment(initialApartmentId))
  const [apartments, setApartments] = useState([])
  const [apartmentId, setApartmentId] = useState(initialApartmentId ? String(initialApartmentId) : '')
  const [fees, setFees] = useState([])
  const selectedFeeIds = initialSelectedFeeIds.map(String)
  const [activeFilter, setActiveFilter] = useState('pending')
  const [loadingApartments, setLoadingApartments] = useState(true)
  const [loadingFees, setLoadingFees] = useState(Boolean(initialApartmentId))
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    getApartmentsByFloor(floor)
      .then((items) => {
        if (!active) return
        setApartments(items)
        setApartmentId((current) => items.some((item) => String(item.id) === current) ? current : '')
        if (initialApartmentId && !items.some((item) => String(item.id) === String(initialApartmentId))) {
          setLoadingFees(false)
        }
      })
      .catch((requestError) => { if (active) { setError(requestError.message); setLoadingFees(false) } })
      .finally(() => { if (active) setLoadingApartments(false) })

    return () => { active = false }
  }, [floor, initialApartmentId])

  useEffect(() => {
    if (!apartmentId) return undefined

    let active = true
    getTransactionsByApartment(apartmentId)
      .then((items) => { if (active) setFees(items) })
      .catch((requestError) => { if (active) { setFees([]); setError(requestError.message) } })
      .finally(() => { if (active) setLoadingFees(false) })

    return () => { active = false }
  }, [apartmentId])

  const pendingFees = useMemo(() => fees.filter((fee) => !fee.paid), [fees])
  const paidFees = useMemo(() => fees.filter((fee) => fee.paid), [fees])
  const visibleFees = activeFilter === 'pending' ? pendingFees
    : activeFilter === 'paid' ? paidFees : fees
  const pendingTotal = pendingFees.reduce((sum, fee) => sum + fee.amount, 0)
  const paidTotal = paidFees.reduce((sum, fee) => sum + fee.amount, 0)
  const selectedCount = fees.filter((fee) => selectedFeeIds.includes(String(fee.id))).length

  const columns = [
    {
      key: 'name',
      title: 'Khoản thu',
      render: (fee) => <div className="query-fee-name">
        <strong>{fee.name}</strong>
        <span>{fee.optional ? 'Tự nguyện' : 'Bắt buộc'} · {fee.period}</span>
        {selectedFeeIds.includes(String(fee.id)) && <em>Đã chọn từ màn hình trước</em>}
      </div>,
    },
    { key: 'createdAt', title: 'Ngày tạo', render: (fee) => formatDate(fee.createdAt) },
    { key: 'dueDate', title: 'Hạn nộp', render: (fee) => formatDate(fee.dueDate) },
    { key: 'amount', title: 'Số tiền', align: 'right', render: (fee) => <strong className="query-fee-amount">{formatCurrency(fee.amount)}</strong> },
    {
      key: 'status',
      title: 'Trạng thái',
      render: (fee) => <span className={`query-fee-status ${fee.paid ? 'is-paid' : 'is-pending'}`}>
        {fee.paid ? 'Đã nộp' : 'Cần nộp'}
      </span>,
    },
  ]

  return <main className="query-request-page">
    <PageHeader
      className="query-request-header"
      eyebrow="Giao dịch / Tra cứu"
      title="Khoản cần nộp và đã nộp"
      description="Tra cứu trạng thái các khoản thu của từng căn hộ theo dữ liệu backend."
      actions={onBackToSelection && <Button variant="outline" onClick={onBackToSelection}>Quay lại chọn khoản</Button>}
    />

    <Notice className="query-request-contract-note">
      Đây là màn hình tra cứu dành cho tài khoản Ban quản lý (Accountant/Admin); theo backend, tài khoản Resident chưa được phép gọi API danh sách căn hộ/khoản thu. Không hiển thị thao tác nộp tiền. Backend hiện chưa có API gửi yêu cầu tra cứu riêng hoặc xử lý thanh toán trực tuyến.
    </Notice>
    {error && <Notice className="query-request-notice" variant="error">{error}</Notice>}

    <section className="bm-panel query-request-filter">
      <PanelHeader eyebrow="Tra cứu theo căn hộ" title="Thông tin căn hộ" description="API hiện tại yêu cầu mã căn hộ để lấy danh sách khoản thu." />
      <div className="query-request-filter__fields">
        <Select
          label="Tầng"
          value={floor}
          onChange={(event) => {
            setFloor(event.target.value)
            setLoadingApartments(true)
            setApartments([])
            setApartmentId('')
            setFees([])
            setLoadingFees(false)
            setError('')
          }}
          options={FLOOR_OPTIONS}
          disabled={loadingApartments}
        />
        <Select
          label="Căn hộ"
          value={apartmentId}
          onChange={(event) => {
            const nextApartmentId = event.target.value
            setApartmentId(nextApartmentId)
            setFees([])
            setLoadingFees(Boolean(nextApartmentId))
            setError('')
          }}
          disabled={loadingApartments || apartments.length === 0}
          options={[
            { value: '', label: loadingApartments ? 'Đang tải căn hộ...' : apartments.length ? 'Chọn căn hộ' : 'Tầng này chưa có dữ liệu căn hộ' },
            ...apartments.map((apartment) => ({
              value: String(apartment.id),
              label: `Căn ${apartment.id} · ${apartment.area} m² · ${apartment.typeName}`,
            })),
          ]}
        />
      </div>
    </section>

    {apartmentId && <section className="query-request-stats" aria-label="Tổng hợp khoản thu">
      <article className="bm-panel query-request-stat">
        <span>Khoản cần nộp</span>
        <strong>{pendingFees.length}</strong>
        <small>{formatCurrency(pendingTotal)}</small>
      </article>
      <article className="bm-panel query-request-stat">
        <span>Khoản đã nộp</span>
        <strong>{paidFees.length}</strong>
        <small>{formatCurrency(paidTotal)}</small>
      </article>
      <article className="bm-panel query-request-stat">
        <span>Tổng khoản thu</span>
        <strong>{fees.length}</strong>
        <small>{formatCurrency(pendingTotal + paidTotal)}</small>
      </article>
    </section>}

    <section className="bm-panel query-request-list">
      <div className="query-request-list__heading">
        <PanelHeader
          eyebrow="Chi tiết khoản thu"
          title={apartmentId ? `Căn hộ ${apartmentId}` : 'Danh sách khoản thu'}
          description={selectedCount ? `Có ${selectedCount} khoản được chọn từ màn hình trước.` : 'Lọc danh sách theo trạng thái nộp tiền.'}
        />
        <Tabs
          className="query-request-tabs"
          ariaLabel="Lọc trạng thái khoản thu"
          value={activeFilter}
          onChange={setActiveFilter}
          items={[
            { id: 'pending', label: 'Cần nộp', count: pendingFees.length },
            { id: 'paid', label: 'Đã nộp', count: paidFees.length },
            { id: 'all', label: 'Tất cả', count: fees.length },
          ]}
        />
      </div>
      {loadingFees ? <div className="query-request-state">Đang tải dữ liệu khoản thu...</div>
        : !apartmentId ? <div className="query-request-state">Vui lòng chọn căn hộ để xem khoản thu.</div>
          : <Table columns={columns} data={visibleFees} emptyMessage={activeFilter === 'pending' ? 'Căn hộ không còn khoản cần nộp.' : activeFilter === 'paid' ? 'Chưa có khoản nào được ghi nhận đã nộp.' : 'Căn hộ chưa có khoản thu.'} />}
    </section>
  </main>
}
