import { useCallback, useEffect, useState } from 'react'
import Button from '../../../../components/ui/Button.jsx'
import Select from '../../../../components/ui/Select.jsx'
import DeleteFeeDialog from '../components/DeleteFeeDialog.jsx'
import FeeForm from '../components/FeeForm.jsx'
import FeeTable from '../components/FeeTable.jsx'
import { createFee, deleteFeesByType, getFeeTypes, updateFee } from '../services/feeManagementService.js'
import './fee-management.css'

const apartmentLabel = (value) => value === 'all' ? 'Tất cả' : value.join(', ')

export default function FeeManagementPage() {
  const [mode, setMode] = useState('create')
  const [feeTypes, setFeeTypes] = useState([])
  const [typesLoading, setTypesLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState(null)
  const [records, setRecords] = useState([])
  const [deleteTypeId, setDeleteTypeId] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  const loadTypes = useCallback(async () => {
    setTypesLoading(true)
    try { setFeeTypes(await getFeeTypes()); setNotice(null) }
    catch (error) { setNotice({ kind: 'error', text: `Không tải được loại khoản thu: ${error.message}` }) }
    finally { setTypesLoading(false) }
  }, [])
  useEffect(() => {
    getFeeTypes()
      .then((types) => setFeeTypes(types))
      .catch((error) => setNotice({ kind: 'error', text: `Không tải được loại khoản thu: ${error.message}` }))
      .finally(() => setTypesLoading(false))
  }, [])

  const addRecord = (record) => setRecords((current) => [{ id: crypto.randomUUID(), time: new Date().toLocaleTimeString('vi-VN'), ...record }, ...current])

  const submit = async (payload) => {
    setBusy(true); setNotice(null)
    try {
      const feeType = feeTypes.find((item) => String(item.id) === String(payload.feeTypeId))
      if (mode === 'create') {
        await createFee(payload)
        addRecord({ action: 'Tạo', feeType: feeType?.name ?? payload.feeTypeId, apartment: apartmentLabel(payload.apartmentIds), amount: payload.amount })
        setNotice({ kind: 'success', text: 'Đã tạo khoản thu thành công.' })
      } else {
        await updateFee(payload)
        addRecord({ action: 'Sửa', feeType: feeType?.name ?? payload.feeTypeId, apartment: payload.apartmentId, amount: payload.amount })
        setNotice({ kind: 'success', text: 'Đã cập nhật khoản thu thành công.' })
      }
      return true
    } catch (error) { setNotice({ kind: 'error', text: error.message }); return false }
    finally { setBusy(false) }
  }

  const requestDelete = () => {
    const target = feeTypes.find((item) => String(item.id) === deleteTypeId)
    if (!target) return setNotice({ kind: 'error', text: 'Hãy chọn loại khoản thu cần xóa.' })
    setDeleteTarget(target)
  }

  const confirmDelete = async () => {
    setBusy(true); setNotice(null)
    try {
      await deleteFeesByType(deleteTarget.id)
      addRecord({ action: 'Xóa theo loại', feeType: deleteTarget.name, apartment: 'Tất cả', amount: '' })
      setNotice({ kind: 'success', text: `Đã xóa các khoản thu thuộc loại “${deleteTarget.name}”.` })
      setDeleteTarget(null); setDeleteTypeId('')
    } catch (error) { setNotice({ kind: 'error', text: error.message }) }
    finally { setBusy(false) }
  }

  const typeOptions = [{ value: '', label: typesLoading ? 'Đang tải...' : 'Chọn loại khoản thu' }, ...feeTypes.map((type) => ({ value: String(type.id), label: type.name }))]
  return <main className="fee-admin-page">
    <header className="fee-admin-header"><div><p className="fee-admin-eyebrow">Ban quản lý / Tài chính</p><h1>Quản lý khoản thu</h1><p>Tạo khoản thu hàng loạt, cập nhật từng căn hộ hoặc xóa theo loại khoản thu.</p></div><Button variant="outline" onClick={loadTypes} disabled={typesLoading}>Làm mới loại phí</Button></header>
    {notice && <div className={`fee-admin-notice is-${notice.kind}`} role={notice.kind === 'error' ? 'alert' : 'status'}>{notice.text}</div>}
    <div className="fee-admin-grid">
      <section className="fee-admin-card"><div className="fee-admin-tabs" role="tablist" aria-label="Thao tác khoản thu"><button className={mode === 'create' ? 'is-active' : ''} onClick={() => setMode('create')} type="button" role="tab">Tạo khoản thu</button><button className={mode === 'edit' ? 'is-active' : ''} onClick={() => setMode('edit')} type="button" role="tab">Sửa khoản thu</button></div><div className="fee-admin-card__body"><FeeForm key={mode} mode={mode} feeTypes={feeTypes} busy={busy || typesLoading} onSubmit={submit} /></div></section>
      <aside className="fee-admin-card fee-admin-delete-card"><div className="fee-admin-card__heading"><div><p className="fee-admin-eyebrow">Vùng nguy hiểm</p><h2>Xóa khoản thu</h2></div></div><p>API hiện tại xóa tất cả khoản thu có cùng loại, trên toàn bộ căn hộ.</p><Select options={typeOptions} value={deleteTypeId} onChange={(event) => setDeleteTypeId(event.target.value)} /><Button variant="danger" block onClick={requestDelete} disabled={busy || typesLoading}>Xóa theo loại</Button></aside>
    </div>
    <FeeTable records={records} />
    <DeleteFeeDialog feeType={deleteTarget} busy={busy} onClose={() => setDeleteTarget(null)} onConfirm={confirmDelete} />
  </main>
}
