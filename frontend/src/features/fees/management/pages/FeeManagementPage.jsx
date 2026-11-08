import { useCallback, useEffect, useState } from 'react'
import Button from '../../../../components/ui/Button.jsx'
import Select from '../../../../components/ui/Select.jsx'
import { Notice } from '../../../../components/ui/Feedback.jsx'
import { PageHeader, PanelHeader } from '../../../../components/ui/PageHeader.jsx'
import Tabs from '../../../../components/ui/Tabs.jsx'
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
    let active = true
    getFeeTypes()
      .then((types) => { if (active) setFeeTypes(types) })
      .catch((error) => { if (active) setNotice({ kind: 'error', text: `Không tải được loại khoản thu: ${error.message}` }) })
      .finally(() => { if (active) setTypesLoading(false) })
    return () => { active = false }
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
    <PageHeader className="fee-admin-header" eyebrow="Ban quản lý / Tài chính" title="Quản lý khoản thu" description="Tạo khoản thu hàng loạt, cập nhật từng căn hộ hoặc xóa theo loại khoản thu." actions={<Button variant="outline" onClick={loadTypes} disabled={typesLoading}>Làm mới loại phí</Button>} />
    {notice && <Notice className="fee-admin-notice" variant={notice.kind}>{notice.text}</Notice>}
    <div className="fee-admin-grid">
      <section className="bm-panel fee-admin-card"><Tabs className="fee-admin-tabs" ariaLabel="Thao tác khoản thu" value={mode} onChange={setMode} items={[{ id: 'create', label: 'Tạo khoản thu' }, { id: 'edit', label: 'Sửa khoản thu' }]} /><div className="fee-admin-card__body"><FeeForm key={mode} mode={mode} feeTypes={feeTypes} busy={busy || typesLoading} onSubmit={submit} /></div></section>
      <aside className="bm-panel fee-admin-card fee-admin-delete-card"><PanelHeader className="fee-admin-card__heading" eyebrow="Vùng nguy hiểm" title="Xóa khoản thu" /><p>API hiện tại xóa tất cả khoản thu có cùng loại, trên toàn bộ căn hộ.</p><Select options={typeOptions} value={deleteTypeId} onChange={(event) => setDeleteTypeId(event.target.value)} /><Button variant="danger" block onClick={requestDelete} disabled={busy || typesLoading}>Xóa theo loại</Button></aside>
    </div>
    <FeeTable records={records} />
    <DeleteFeeDialog feeType={deleteTarget} busy={busy} onClose={() => setDeleteTarget(null)} onConfirm={confirmDelete} />
  </main>
}
