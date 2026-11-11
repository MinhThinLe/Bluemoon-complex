import Table from '../../../../components/ui/Table.jsx'
import { PanelHeader } from '../../../../components/ui/PageHeader.jsx'
import { formatCurrency } from '../../../../utils/formatters.js'

export default function FeeTable({ records }) {
  const columns = [
    { key: 'time', title: 'Thời điểm' }, { key: 'action', title: 'Thao tác' }, { key: 'feeType', title: 'Loại khoản thu' }, { key: 'apartment', title: 'Căn hộ' },
    { key: 'amount', title: 'Số tiền', align: 'right', render: (row) => row.amount ? formatCurrency(row.amount) : '—' },
    { key: 'status', title: 'Kết quả', render: () => <span className="fee-admin-status">Thành công</span> },
  ]
  return <section className="bm-panel fee-admin-history"><PanelHeader title="Thao tác trong phiên này" /><Table columns={columns} data={records} emptyMessage="Chưa có thao tác thành công trong phiên này." /><p className="fee-admin-history__note">Lịch sử thao tác chỉ lưu trong phiên làm việc hiện tại của trình duyệt.</p></section>
}
