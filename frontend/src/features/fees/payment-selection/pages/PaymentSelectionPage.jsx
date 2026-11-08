import { useEffect, useMemo, useState } from 'react'
import Button from '../../../../components/ui/Button.jsx'
import { Notice } from '../../../../components/ui/Feedback.jsx'
import { PageHeader, PanelHeader } from '../../../../components/ui/PageHeader.jsx'
import Select from '../../../../components/ui/Select.jsx'
import Table from '../../../../components/ui/Table.jsx'
import { formatCurrency, formatDate } from '../../../../utils/formatters.js'
import { getTransactionsByApartment } from '../../../transactions/services/transactionService.js'
import { getApartmentsByFloor } from '../services/paymentSelectionService.js'
import './payment-selection.css'

const FLOOR_OPTIONS = Array.from({ length: 20 }, (_, index) => ({
  value: String(index + 1),
  label: `Tầng ${index + 1}`,
}))

export default function PaymentSelectionPage({ onViewQuery }) {
  const [floor, setFloor] = useState('1')
  const [apartments, setApartments] = useState([])
  const [apartmentId, setApartmentId] = useState('')
  const [fees, setFees] = useState([])
  const [selectedFeeIds, setSelectedFeeIds] = useState([])
  const [loadingApartments, setLoadingApartments] = useState(true)
  const [loadingFees, setLoadingFees] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    getApartmentsByFloor(floor)
      .then((items) => { if (active) setApartments(items) })
      .catch((requestError) => { if (active) setError(requestError.message) })
      .finally(() => { if (active) setLoadingApartments(false) })

    return () => { active = false }
  }, [floor])

  useEffect(() => {
    if (!apartmentId) return undefined

    let active = true

    getTransactionsByApartment(apartmentId)
      .then((items) => { if (active) setFees(items) })
      .catch((requestError) => { if (active) { setFees([]); setError(requestError.message) } })
      .finally(() => { if (active) setLoadingFees(false) })

    return () => { active = false }
  }, [apartmentId])

  const unpaidFees = useMemo(() => fees.filter((fee) => !fee.paid), [fees])
  const selectedFees = useMemo(
    () => unpaidFees.filter((fee) => selectedFeeIds.includes(String(fee.id))),
    [unpaidFees, selectedFeeIds],
  )
  const selectedTotal = selectedFees.reduce((sum, fee) => sum + fee.amount, 0)

  const toggleFee = (feeId) => {
    const key = String(feeId)
    setSelectedFeeIds((current) => current.includes(key)
      ? current.filter((item) => item !== key)
      : [...current, key])
  }

  const toggleAll = () => {
    setSelectedFeeIds((current) => current.length === unpaidFees.length
      ? []
      : unpaidFees.map((fee) => String(fee.id)))
  }

  const columns = [
    {
      key: 'select',
      title: <input
        type="checkbox"
        aria-label="Chọn tất cả khoản chưa nộp"
        checked={unpaidFees.length > 0 && selectedFeeIds.length === unpaidFees.length}
        onChange={toggleAll}
        disabled={unpaidFees.length === 0}
      />,
      width: '48px',
      render: (fee) => <input
        type="checkbox"
        aria-label={`Chọn ${fee.name}`}
        checked={selectedFeeIds.includes(String(fee.id))}
        onChange={() => toggleFee(fee.id)}
      />,
    },
    {
      key: 'name',
      title: 'Khoản thu',
      render: (fee) => <div className="fee-selection-name">
        <strong>{fee.name}</strong>
        <span>{fee.optional ? 'Khoản đóng góp tự nguyện' : 'Khoản thu bắt buộc'} · {fee.period}</span>
      </div>,
    },
    { key: 'dueDate', title: 'Hạn nộp', render: (fee) => formatDate(fee.dueDate) },
    { key: 'amount', title: 'Số tiền', align: 'right', render: (fee) => <strong className="fee-selection-amount">{formatCurrency(fee.amount)}</strong> },
  ]

  return <main className="fee-selection-page">
    <PageHeader
      className="fee-selection-header"
      eyebrow="Giao dịch / Chọn khoản nộp"
      title="Chọn khoản cần tra cứu"
      description="Chọn tầng, căn hộ và các khoản chưa nộp để xem lại thông tin trong màn hình tra cứu."
    />

    <Notice className="fee-selection-contract-note">
      Backend hiện chỉ cung cấp API xem căn hộ và khoản thu. Màn hình này hỗ trợ chọn/lọc dữ liệu, chưa thực hiện thanh toán hoặc ghi nhận yêu cầu lên máy chủ.
    </Notice>

    {error && <Notice className="fee-selection-notice" variant="error">{error}</Notice>}

    <section className="bm-panel fee-selection-filter">
      <PanelHeader eyebrow="Bước 1" title="Chọn căn hộ" description="Danh sách căn hộ được tải trực tiếp từ API theo tầng." />
      <div className="fee-selection-filter__fields">
        <Select
          label="Tầng"
          value={floor}
          onChange={(event) => {
            setFloor(event.target.value)
            setLoadingApartments(true)
            setApartments([])
            setApartmentId('')
            setFees([])
            setSelectedFeeIds([])
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
            setSelectedFeeIds([])
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

    <section className="bm-panel fee-selection-list">
      <div className="fee-selection-list__heading">
        <PanelHeader
          eyebrow="Bước 2"
          title="Khoản chưa nộp"
          description={apartmentId ? `Các khoản thu của căn hộ ${apartmentId}. Khoản đã nộp không thể chọn.` : 'Chọn căn hộ để tải danh sách khoản thu.'}
        />
        {apartmentId && <span className="fee-selection-count">{unpaidFees.length} khoản</span>}
      </div>
      {loadingFees ? <div className="fee-selection-state">Đang tải danh sách khoản thu...</div>
        : !apartmentId ? <div className="fee-selection-state">Vui lòng chọn căn hộ ở bước trên.</div>
          : unpaidFees.length === 0 ? <div className="fee-selection-state">Căn hộ này hiện không có khoản cần nộp.</div>
            : <Table columns={columns} data={unpaidFees} emptyMessage="Không có khoản thu." />}

      <div className="fee-selection-summary">
        <div>
          <span>Đã chọn</span>
          <strong>{selectedFees.length} khoản</strong>
        </div>
        <div>
          <span>Tổng số tiền</span>
          <strong>{formatCurrency(selectedTotal)}</strong>
        </div>
        <Button
          onClick={() => onViewQuery?.({ apartmentId: Number(apartmentId), selectedFeeIds })}
          disabled={!apartmentId || selectedFeeIds.length === 0 || loadingFees}
          iconRight="arrowUpRight"
        >
          Xem các khoản đã chọn
        </Button>
      </div>
    </section>
  </main>
}
