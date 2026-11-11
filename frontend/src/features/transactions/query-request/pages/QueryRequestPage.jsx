import { useState } from 'react'
import Button from '../../../../components/ui/Button.jsx'
import DataState from '../../../../components/ui/DataState.jsx'
import Icon from '../../../../components/ui/Icon.jsx'
import { PageHeader, PanelHeader } from '../../../../components/ui/PageHeader.jsx'
import Select from '../../../../components/ui/Select.jsx'
import Table from '../../../../components/ui/Table.jsx'
import Tabs from '../../../../components/ui/Tabs.jsx'
import useApartmentFees from '../../../../hooks/useApartmentFees.js'
import { formatCurrency, formatDate } from '../../../../utils/formatters.js'
import './query-request.css'

const FLOOR_OPTIONS = Array.from({ length: 30 }, (_, i) => ({ value: String(i + 1), label: `Tầng ${i + 1}` }))

export default function QueryRequestPage({ initialApartmentId = null, initialSelectedFeeIds = [], onBackToSelection }) {
  const { floor, apartmentId, apartments, fees, loadingApartments, loadingFees, error, chooseFloor, chooseApartment, retry } = useApartmentFees({ initialApartmentId })
  const [activeFilter, setActiveFilter] = useState('pending')
  const selectedFeeIds = Number(apartmentId) === Number(initialApartmentId) ? initialSelectedFeeIds.map(String) : []
  const busy = loadingApartments || loadingFees
  const pendingFees = fees.filter((fee) => !fee.paid)
  const paidFees = fees.filter((fee) => fee.paid)
  const visibleFees = activeFilter === 'pending' ? pendingFees : activeFilter === 'paid' ? paidFees : fees
  const total = (items) => items.reduce((sum, fee) => sum + fee.amount, 0)
  const ready = Boolean(apartmentId) && !busy && !error
  const columns = [
    {
      key: 'name', title: 'Khoản thu',
      render: (fee) => <div className="query-fee-name">
        <div className="query-fee-name__title"><strong>{fee.name}</strong>
          {selectedFeeIds.includes(String(fee.id)) && <em><Icon name="checkCircle" size={12} />Đã chọn từ màn hình trước</em>}
        </div>
        <span>{fee.optional ? 'Tự nguyện' : 'Bắt buộc'} · {fee.period}</span>
      </div>,
    },
    { key: 'createdAt', title: 'Ngày tạo', render: (fee) => formatDate(fee.createdAt) },
    { key: 'dueDate', title: 'Hạn nộp', render: (fee) => formatDate(fee.dueDate) },
    { key: 'amount', title: 'Số tiền', align: 'right', render: (fee) => <strong className="query-fee-amount">{formatCurrency(fee.amount)}</strong> },
    { key: 'status', title: 'Trạng thái', render: (fee) => <span className={`query-fee-status ${fee.paid ? 'is-paid' : 'is-pending'}`}>{fee.paid ? 'Đã nộp' : 'Cần nộp'}</span> },
  ]
  const emptyMessage = !fees.length ? 'Căn hộ chưa có khoản thu.' : activeFilter === 'pending' ? 'Căn hộ không còn khoản cần nộp.' : 'Chưa có khoản nào được ghi nhận đã nộp.'

  return <main className="query-request-page">
    <PageHeader eyebrow="Hệ thống quản lý căn hộ / Tra cứu khoản thu" title="Khoản cần nộp và đã nộp"
      description="Theo dõi trạng thái các khoản thu của từng căn hộ."
      actions={onBackToSelection && <Button variant="outline" icon="arrow-left" onClick={onBackToSelection}>Quay lại chọn khoản</Button>} />
    <section className="bm-panel query-request-filter">
      <PanelHeader title="Thông tin căn hộ" />
      <div className="query-request-filter__fields">
        <Select label="Tầng" value={floor} options={FLOOR_OPTIONS} disabled={loadingApartments}
          onChange={(event) => { chooseFloor(event.target.value); setActiveFilter('pending') }} />
        <Select label="Căn hộ" value={apartmentId} disabled={loadingApartments || !apartments.length}
          onChange={(event) => { chooseApartment(event.target.value); setActiveFilter('pending') }}
          options={[{ value: '', label: loadingApartments ? 'Đang tải căn hộ...' : apartments.length ? 'Chọn căn hộ' : 'Tầng này chưa có dữ liệu căn hộ' },
            ...apartments.map((a) => ({ value: String(a.id), label: `Căn ${a.id} · ${a.area} m² · ${a.typeName}` }))]} />
      </div>
    </section>
    {ready && <section className="query-request-stats" aria-label="Tổng hợp khoản thu">
      {[['Khoản cần nộp', pendingFees, 'is-pending'], ['Khoản đã nộp', paidFees, 'is-paid'], ['Tổng khoản thu', fees, '']].map(([label, items, status]) =>
        <article key={label} className={`query-request-stat ${status}`}><span>{label}</span><div><small>{items.length} khoản</small><strong>{formatCurrency(total(items))}</strong></div></article>)}
    </section>}
    <section className="bm-panel query-request-list" aria-busy={busy}>
      <div className="query-request-list__heading">
        <PanelHeader title={apartmentId ? `Chi tiết khoản thu — Căn hộ ${apartmentId}` : 'Danh sách khoản thu'} />
        {ready && <Tabs className="query-request-tabs" ariaLabel="Lọc trạng thái khoản thu" value={activeFilter} onChange={setActiveFilter}
          items={[{ id: 'pending', label: 'Cần nộp', count: pendingFees.length }, { id: 'paid', label: 'Đã nộp', count: paidFees.length }, { id: 'all', label: 'Tất cả', count: fees.length }]} />}
      </div>
      {busy ? <DataState loading>Đang tải {loadingApartments ? 'danh sách căn hộ' : 'dữ liệu khoản thu'}...</DataState>
        : error ? <DataState error={error} onRetry={retry} />
          : !apartmentId ? <DataState>Vui lòng chọn căn hộ để xem khoản thu.</DataState>
            : !visibleFees.length ? <DataState>{emptyMessage}</DataState>
              : <Table columns={columns} data={visibleFees} />}
      {ready && <div className="query-request-list__footer"><span>Danh sách khoản thu của căn hộ đã chọn.</span><span>Tổng số bản ghi: {visibleFees.length}</span></div>}
    </section>
  </main>
}
