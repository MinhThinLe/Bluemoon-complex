import { useMemo, useState } from 'react'
import Button from '../../../../components/ui/Button.jsx'
import Input from '../../../../components/ui/Input.jsx'
import Select from '../../../../components/ui/Select.jsx'

const EMPTY_CREATE = { feeTypeId: '', apartmentScope: 'selected', apartmentIds: '', amount: '', dueOn: '', optional: false }
const EMPTY_EDIT = { feeTypeId: '', apartmentId: '', amount: '', optional: '', paid: '' }

function parseApartmentIds(value) {
  return [...new Set(value.split(',').map((item) => Number(item.trim())).filter(Number.isInteger))]
}

export default function FeeForm({ mode, feeTypes, busy, onSubmit }) {
  const [form, setForm] = useState(mode === 'create' ? EMPTY_CREATE : EMPTY_EDIT)
  const [errors, setErrors] = useState({})
  const typeOptions = useMemo(() => [{ value: '', label: 'Chọn loại khoản thu' }, ...feeTypes.map((type) => ({ value: String(type.id), label: type.name }))], [feeTypes])
  const setField = (name, value) => { setForm((current) => ({ ...current, [name]: value })); setErrors((current) => ({ ...current, [name]: undefined })) }

  const validate = () => {
    const next = {}
    if (!form.feeTypeId) next.feeTypeId = 'Hãy chọn loại khoản thu.'
    if (mode === 'create') {
      if (!Number.isInteger(Number(form.amount)) || Number(form.amount) <= 0) next.amount = 'Số tiền phải là số nguyên dương.'
      if (!form.dueOn) next.dueOn = 'Hãy chọn hạn nộp.'
      if (form.apartmentScope === 'selected' && parseApartmentIds(form.apartmentIds).length === 0) next.apartmentIds = 'Nhập ít nhất một mã căn hộ, ngăn cách bằng dấu phẩy.'
    } else {
      if (!Number.isInteger(Number(form.apartmentId)) || Number(form.apartmentId) <= 0) next.apartmentId = 'Mã căn hộ không hợp lệ.'
      if (form.amount !== '' && (!Number.isInteger(Number(form.amount)) || Number(form.amount) <= 0)) next.amount = 'Số tiền phải là số nguyên dương.'
      if (form.amount === '' && form.optional === '' && form.paid === '') next.form = 'Chọn ít nhất một giá trị cần cập nhật.'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const submit = async (event) => {
    event.preventDefault()
    if (!validate()) return
    const payload = mode === 'create' ? { ...form, apartmentIds: form.apartmentScope === 'all' ? 'all' : parseApartmentIds(form.apartmentIds) } : form
    const succeeded = await onSubmit(payload)
    if (succeeded) setForm(mode === 'create' ? EMPTY_CREATE : EMPTY_EDIT)
  }

  return <form className="fee-admin-form" onSubmit={submit} noValidate>
    <Select label="Loại khoản thu" options={typeOptions} value={form.feeTypeId} error={errors.feeTypeId} onChange={(event) => setField('feeTypeId', event.target.value)} />
    {mode === 'create' ? <>
      <Select label="Phạm vi áp dụng" options={[{ value: 'selected', label: 'Một số căn hộ' }, { value: 'all', label: 'Tất cả căn hộ' }]} value={form.apartmentScope} onChange={(event) => setField('apartmentScope', event.target.value)} />
      {form.apartmentScope === 'selected' && <Input label="Mã căn hộ" placeholder="Ví dụ: 1201, 1202, 1203" value={form.apartmentIds} error={errors.apartmentIds} onChange={(event) => setField('apartmentIds', event.target.value)} />}
      <Input label="Số tiền (VND)" type="number" min="1" step="1" value={form.amount} error={errors.amount} onChange={(event) => setField('amount', event.target.value)} />
      <Input label="Hạn nộp" type="date" value={form.dueOn} error={errors.dueOn} onChange={(event) => setField('dueOn', event.target.value)} />
      <label className="fee-admin-check"><input type="checkbox" checked={form.optional} onChange={(event) => setField('optional', event.target.checked)} /><span>Khoản đóng góp tự nguyện</span></label>
    </> : <>
      <Input label="Mã căn hộ" type="number" min="1" step="1" value={form.apartmentId} error={errors.apartmentId} onChange={(event) => setField('apartmentId', event.target.value)} />
      <Input label="Số tiền mới (không bắt buộc)" type="number" min="1" step="1" value={form.amount} error={errors.amount} onChange={(event) => setField('amount', event.target.value)} />
      <Select label="Trạng thái thanh toán" options={[{ value: '', label: 'Không thay đổi' }, { value: 'true', label: 'Đã thanh toán' }, { value: 'false', label: 'Chưa thanh toán' }]} value={form.paid} onChange={(event) => setField('paid', event.target.value)} />
      <Select label="Tính chất khoản thu" options={[{ value: '', label: 'Không thay đổi' }, { value: 'false', label: 'Bắt buộc' }, { value: 'true', label: 'Tự nguyện' }]} value={form.optional} onChange={(event) => setField('optional', event.target.value)} />
      {errors.form && <p className="fee-admin-inline-error" role="alert">{errors.form}</p>}
    </>}
    <Button type="submit" disabled={busy} block>{busy ? 'Đang xử lý...' : mode === 'create' ? 'Tạo khoản thu' : 'Lưu thay đổi'}</Button>
  </form>
}
