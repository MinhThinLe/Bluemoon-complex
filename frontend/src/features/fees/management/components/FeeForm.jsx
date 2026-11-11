import { useId, useMemo, useState } from 'react'
import Button from '../../../../components/ui/Button.jsx'
import Input from '../../../../components/ui/Input.jsx'
import Select from '../../../../components/ui/Select.jsx'

const EMPTY_CREATE = { feeTypeId: '', apartmentScope: 'selected', apartmentIds: '', amount: '', dueOn: '', optional: false }
const EMPTY_EDIT = { feeTypeId: '', apartmentId: '', amount: '', optional: '', paid: '' }

function parseApartmentIds(value) {
  const parts = value.split(',').map((item) => item.trim())
  if (parts.some((item) => !/^\d+$/.test(item) || Number(item) <= 0)) return []
  return [...new Set(parts.map(Number))]
}

export default function FeeForm({ mode, feeTypes, busy, onSubmit }) {
  const scopeId = useId()
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
    if (busy) return
    if (!validate()) return
    const payload = mode === 'create' ? { ...form, apartmentIds: form.apartmentScope === 'all' ? 'all' : parseApartmentIds(form.apartmentIds) } : form
    const succeeded = await onSubmit(payload)
    if (succeeded) setForm(mode === 'create' ? EMPTY_CREATE : EMPTY_EDIT)
  }

  return <form className="fee-admin-form" onSubmit={submit} noValidate>
    <fieldset disabled={busy}>
    <legend className="bm-sr-only">{mode === 'create' ? 'Tạo khoản thu' : 'Sửa khoản thu'}</legend>
    <Select label="Loại khoản thu" required options={typeOptions} value={form.feeTypeId} error={errors.feeTypeId} onChange={(event) => setField('feeTypeId', event.target.value)} />
    {mode === 'create' ? <>
      <div className="bm-field">
        <span className="bm-field__label" id={scopeId}>Phạm vi áp dụng</span>
        <div className="fee-admin-scope" role="radiogroup" aria-labelledby={scopeId}>
          {[['selected', 'Một số căn hộ'], ['all', 'Tất cả căn hộ']].map(([value, label]) => <label key={value}>
            <input className="bm-sr-only" type="radio" name="apartmentScope" value={value} checked={form.apartmentScope === value} onChange={() => setField('apartmentScope', value)} />
            <span>{label}</span>
          </label>)}
        </div>
      </div>
      {form.apartmentScope === 'selected' && <Input label="Mã căn hộ" required placeholder="Ví dụ: 305, 306" hint="Nhập mã căn hộ, ngăn cách bằng dấu phẩy." value={form.apartmentIds} error={errors.apartmentIds} onChange={(event) => setField('apartmentIds', event.target.value)} />}
      <Input label="Số tiền (VND)" required type="number" min="1" step="1" value={form.amount} error={errors.amount} onChange={(event) => setField('amount', event.target.value)} />
      <Input label="Hạn nộp" required type="date" value={form.dueOn} error={errors.dueOn} onChange={(event) => setField('dueOn', event.target.value)} />
      <label className="fee-admin-check"><input type="checkbox" checked={form.optional} onChange={(event) => setField('optional', event.target.checked)} /><span>Khoản đóng góp tự nguyện</span></label>
    </> : <>
      <Input label="Mã căn hộ" required type="number" min="1" step="1" value={form.apartmentId} error={errors.apartmentId} onChange={(event) => setField('apartmentId', event.target.value)} />
      <Input label="Số tiền mới (không bắt buộc)" type="number" min="1" step="1" value={form.amount} error={errors.amount} onChange={(event) => setField('amount', event.target.value)} />
      <Select label="Trạng thái thanh toán" options={[{ value: '', label: 'Không thay đổi' }, { value: 'true', label: 'Đã thanh toán' }, { value: 'false', label: 'Chưa thanh toán' }]} value={form.paid} onChange={(event) => setField('paid', event.target.value)} />
      <Select label="Tính chất khoản thu" options={[{ value: '', label: 'Không thay đổi' }, { value: 'false', label: 'Bắt buộc' }, { value: 'true', label: 'Tự nguyện' }]} value={form.optional} onChange={(event) => setField('optional', event.target.value)} />
      {errors.form ? <p className="fee-admin-inline-error" role="alert">{errors.form}</p> : <p className="bm-notice fee-admin-edit-hint">Cung cấp ít nhất một giá trị: số tiền mới, trạng thái thanh toán hoặc tính chất khoản thu để lưu thay đổi.</p>}
    </>}
    <div className="fee-admin-form__actions"><Button type="submit" loading={busy} icon={mode === 'create' ? 'create' : undefined}>{busy ? 'Đang xử lý...' : mode === 'create' ? 'Tạo khoản thu' : 'Lưu thay đổi'}</Button></div>
    </fieldset>
  </form>
}
