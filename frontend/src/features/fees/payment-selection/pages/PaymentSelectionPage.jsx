import { useState } from 'react'
import ApartmentPicker from '../../../../components/apartment/ApartmentPicker.jsx'
import Button from '../../../../components/ui/Button.jsx'
import DataState from '../../../../components/ui/DataState.jsx'
import { PageHeader, PanelHeader } from '../../../../components/ui/PageHeader.jsx'
import Table from '../../../../components/ui/Table.jsx'
import useApartmentFees from '../../../../hooks/useApartmentFees.js'
import { formatCurrency, formatDate } from '../../../../utils/formatters.js'
import './payment-selection.css'

export default function PaymentSelectionPage({ initialApartmentId = null, initialSelectedFeeIds = [], onViewQuery }) {
  const { floor, apartmentId, apartments, fees, loadingApartments, loadingFees, error, chooseFloor, chooseApartment, retry } = useApartmentFees({ initialApartmentId })
  const [selectedFeeIds, setSelectedFeeIds] = useState(() => initialSelectedFeeIds.map(String))
  const unpaidFees = fees.filter((fee) => !fee.paid)
  const selectedFees = unpaidFees.filter((fee) => selectedFeeIds.includes(String(fee.id)))
  const selectedTotal = selectedFees.reduce((sum, fee) => sum + fee.amount, 0)
  const busy = loadingApartments || loadingFees
  const toggleFee = (id) => {
    const key = String(id)
    setSelectedFeeIds((current) => current.includes(key) ? current.filter((item) => item !== key) : [...current, key])
  }
  const toggleAll = () => setSelectedFeeIds(selectedFees.length === unpaidFees.length ? [] : unpaidFees.map((fee) => String(fee.id)))
  const columns = [
    {
      key: 'select', width: '48px',
      title: <input type="checkbox" aria-label="Chọn tất cả khoản chưa nộp"
        checked={unpaidFees.length > 0 && selectedFees.length === unpaidFees.length}
        ref={(input) => { if (input) input.indeterminate = selectedFees.length > 0 && selectedFees.length < unpaidFees.length }}
        onChange={toggleAll} disabled={!unpaidFees.length || busy || Boolean(error)} />,
      render: (fee) => <input type="checkbox" aria-label={`Chọn ${fee.name}`} checked={selectedFeeIds.includes(String(fee.id))} onChange={() => toggleFee(fee.id)} />,
    },
    {
      key: 'name', title: 'Khoản thu',
      render: (fee) => <div className="fee-selection-name"><strong>{fee.name}</strong><span>{fee.optional ? 'Tự nguyện' : 'Bắt buộc'} · {fee.period}</span></div>,
    },
    { key: 'dueDate', title: 'Hạn nộp', render: (fee) => formatDate(fee.dueDate) },
    { key: 'amount', title: 'Số tiền', align: 'right', render: (fee) => <strong className="fee-selection-amount">{formatCurrency(fee.amount)}</strong> },
  ]

  return <main className="fee-selection-page">
    <PageHeader eyebrow="Hệ thống quản lý căn hộ / Tra cứu khoản thu" title="Chọn khoản cần tra cứu" description="Chọn các khoản chưa nộp để xem chi tiết." />
    <section className="bm-panel fee-selection-filter">
      <PanelHeader title="Bước 1 · Chọn căn hộ" description="Chọn tầng, sau đó chọn căn hộ cần tra cứu." />
      <ApartmentPicker floor={floor} apartmentId={apartmentId} apartments={apartments} loading={loadingApartments}
        onFloorChange={(value) => { chooseFloor(value); setSelectedFeeIds([]) }}
        onApartmentChange={(value) => { chooseApartment(value); setSelectedFeeIds([]) }} />
    </section>
    <section className="bm-panel fee-selection-list" aria-busy={busy}>
      <div className="fee-selection-list__heading">
        <PanelHeader title="Bước 2 · Khoản chưa nộp" />
        {apartmentId && !busy && !error && <span className="fee-selection-count">{unpaidFees.length} khoản</span>}
      </div>
      {busy ? <DataState loading>Đang tải {loadingApartments ? 'danh sách căn hộ' : 'danh sách khoản thu'}...</DataState>
        : error ? <DataState error={error} onRetry={retry} />
          : !apartmentId ? <DataState>Vui lòng chọn căn hộ ở bước trên.</DataState>
            : !unpaidFees.length ? <DataState>Căn hộ này hiện không có khoản cần nộp.</DataState>
              : <Table columns={columns} data={unpaidFees} rowClassName={(fee) => selectedFeeIds.includes(String(fee.id)) ? 'is-selected' : ''} />}
      <div className="fee-selection-summary">
        <div><span>Đã chọn</span><strong>{selectedFees.length} khoản</strong></div>
        <div><span>Tổng số tiền:</span><strong>{formatCurrency(selectedTotal)}</strong></div>
        <Button onClick={() => onViewQuery?.({ apartmentId: Number(apartmentId), selectedFeeIds: selectedFees.map((fee) => String(fee.id)) })}
          disabled={!apartmentId || !selectedFees.length || busy || Boolean(error)} iconRight="arrow-right">Xem các khoản đã chọn</Button>
      </div>
    </section>
  </main>
}
