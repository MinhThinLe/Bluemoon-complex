import Button from '../../../../components/ui/Button.jsx'
import Modal from '../../../../components/ui/Modal.jsx'

export default function DeleteFeeDialog({ feeType, busy, onClose, onConfirm }) {
  return <Modal isOpen={Boolean(feeType)} onClose={busy ? undefined : onClose} title="Xóa khoản thu theo loại" description="Thao tác này tác động đến tất cả căn hộ đang có loại khoản thu được chọn." footer={<><Button variant="outline" onClick={onClose} disabled={busy}>Hủy</Button><Button variant="danger" onClick={onConfirm} disabled={busy}>{busy ? 'Đang xóa...' : 'Xác nhận xóa'}</Button></>}>
    <div className="fee-admin-danger-copy"><strong>{feeType?.name}</strong><p>Backend hiện xóa toàn bộ bản ghi Fees có cùng mã loại <b>{feeType?.id}</b>. Dữ liệu đã xóa không thể khôi phục từ giao diện.</p></div>
  </Modal>
}
