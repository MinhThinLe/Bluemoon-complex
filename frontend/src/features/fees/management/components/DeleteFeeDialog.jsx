import Button from '../../../../components/ui/Button.jsx'
import Modal from '../../../../components/ui/Modal.jsx'

export default function DeleteFeeDialog({ feeType, busy, onClose, onConfirm }) {
  return <Modal isOpen={Boolean(feeType)} onClose={busy ? undefined : onClose} title="Xác nhận xóa khoản thu theo loại" footer={<><Button variant="outline" onClick={onClose} disabled={busy}>Hủy</Button><Button variant="danger" icon="delete" onClick={onConfirm} loading={busy}>{busy ? 'Đang xóa...' : 'Xác nhận xóa'}</Button></>}>
    <div className="fee-admin-danger-copy">Hành động này sẽ xóa tất cả khoản thu thuộc loại <strong>{feeType?.name}</strong> trên toàn bộ căn hộ trong hệ thống.<p>Dữ liệu đã xóa không thể khôi phục từ giao diện.</p></div>
  </Modal>
}
