import { useState } from 'react'
import ApartmentPicker from '../../../../components/apartment/ApartmentPicker.jsx'
import Button from '../../../../components/ui/Button.jsx'
import DataState from '../../../../components/ui/DataState.jsx'
import Icon from '../../../../components/ui/Icon.jsx'
import { PageHeader, PanelHeader } from '../../../../components/ui/PageHeader.jsx'
import Table from '../../../../components/ui/Table.jsx'
import Tabs from '../../../../components/ui/Tabs.jsx'
import useApartmentFees from '../../../../hooks/useApartmentFees.js'
import { formatCurrency, formatDate } from '../../../../utils/formatters.js'
import './query-request.css'

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
    <PageHeader eyebrow="Hệ thống quản lý căn hộ / Tra cứu khoản thu" title="Chi tiết khoản thu"
      description="Theo dõi trạng thái các khoản thu của từng căn hộ."
      actions={onBackToSelection && <Button variant="outline" icon="arrow-left" onClick={onBackToSelection}>Quay lại bước chọn khoản</Button>} />
    <section className="bm-panel query-request-filter">
      <PanelHeader title="Thông tin căn hộ" description="Chọn tầng và căn hộ để xem các khoản thu." />
      <ApartmentPicker floor={floor} apartmentId={apartmentId} apartments={apartments} loading={loadingApartments}
        onFloorChange={(value) => { chooseFloor(value); setActiveFilter('pending') }}
        onApartmentChange={(value) => { chooseApartment(value); setActiveFilter('pending') }} />
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
