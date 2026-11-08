import Button from '../../../../components/ui/Button.jsx'
import Table from '../../../../components/ui/Table.jsx'
import { formatCurrency } from '../../../../utils/formatters.js'

export default function FeeTable({ records }) {
  const columns = [
    { key: 'time', title: 'Thời điểm' }, { key: 'action', title: 'Thao tác' }, { key: 'feeType', title: 'Loại khoản thu' }, { key: 'apartment', title: 'Căn hộ' },
    { key: 'amount', title: 'Số tiền', align: 'right', render: (row) => row.amount ? formatCurrency(row.amount) : '—' },
    { key: 'status', title: 'Kết quả', render: () => <span className="fee-admin-status">Thành công</span> },
  ]
  return <section className="fee-admin-card fee-admin-history"><div className="fee-admin-card__heading"><div><p className="fee-admin-eyebrow">Phiên hiện tại</p><h2>Lịch sử thao tác</h2></div><Button variant="ghost" size="small" disabled>Chưa có API danh sách</Button></div><Table columns={columns} data={records} emptyMessage="Chưa có thao tác thành công trong phiên này." /></section>
}
