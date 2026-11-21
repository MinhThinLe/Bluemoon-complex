import { useEffect, useId, useMemo, useState } from 'react'
import Button from '../../../../components/ui/Button.jsx'
import Input from '../../../../components/ui/Input.jsx'
import Select from '../../../../components/ui/Select.jsx'
import { getApartmentsByFloor } from '../../payment-selection/services/paymentSelectionService.js'

const EMPTY_CREATE = { feeTypeMode: 'existing', feeTypeId: '', newFeeTypeName: '', apartmentScope: 'selected', apartmentIds: [], amount: '', dueOn: '', optional: false }
const EMPTY_EDIT = { feeTypeId: '', apartmentId: '', amount: '', optional: '', paid: '' }
const FLOOR_OPTIONS = Array.from({ length: 30 }, (_, index) => ({ value: String(index + 1), label: `Tầng ${index + 1}` }))

export default function FeeForm({ mode, feeTypes, busy, onSubmit }) {
  const scopeId = useId()
  const [form, setForm] = useState(mode === 'create' ? EMPTY_CREATE : EMPTY_EDIT)
  const [errors, setErrors] = useState({})
  const [floor, setFloor] = useState('1')
  const [apartments, setApartments] = useState([])
  const [apartmentsLoading, setApartmentsLoading] = useState(mode === 'create')
  const [apartmentsError, setApartmentsError] = useState('')
  const typeOptions = useMemo(() => [{ value: '', label: 'Chọn loại khoản thu' }, ...feeTypes.map((type) => ({ value: String(type.id), label: type.name }))], [feeTypes])
  const setField = (name, value) => { setForm((current) => ({ ...current, [name]: value })); setErrors((current) => ({ ...current, [name]: undefined })) }
  const chooseFloor = (value) => { setFloor(value); setApartmentsLoading(true); setApartmentsError('') }
  const chooseApartmentScope = (value) => {
    setField('apartmentScope', value)
    if (value === 'selected') { setApartmentsLoading(true); setApartmentsError('') }
  }

  useEffect(() => {
    if (mode !== 'create' || form.apartmentScope !== 'selected') return undefined
    let active = true
    getApartmentsByFloor(floor)
      .then((items) => { if (active) { setApartments(items); setForm((current) => ({ ...current, apartmentIds: current.apartmentIds.filter((id) => items.some((item) => item.id === id)) })) } })
      .catch((error) => { if (active) { setApartments([]); setApartmentsError(error.message) } })
      .finally(() => { if (active) setApartmentsLoading(false) })
    return () => { active = false }
  }, [floor, form.apartmentScope, mode])

  const toggleApartment = (id) => setField('apartmentIds', form.apartmentIds.includes(id) ? form.apartmentIds.filter((item) => item !== id) : [...form.apartmentIds, id])

  const validate = () => {
    const next = {}
    if (mode === 'edit' || form.feeTypeMode === 'existing') {
      if (!form.feeTypeId) next.feeTypeId = 'Hãy chọn loại khoản thu.'
    } else if (!form.newFeeTypeName.trim()) {
      next.newFeeTypeName = 'Hãy nhập tên loại khoản thu mới.'
    } else if (form.newFeeTypeName.trim().length > 100) {
      next.newFeeTypeName = 'Tên loại khoản thu không được vượt quá 100 ký tự.'
    }
    if (mode === 'create') {
      if (!Number.isInteger(Number(form.amount)) || Number(form.amount) <= 0) next.amount = 'Số tiền phải là số nguyên dương.'
      if (!form.dueOn) next.dueOn = 'Hãy chọn hạn nộp.'
      if (form.apartmentScope === 'selected' && form.apartmentIds.length === 0) next.apartmentIds = 'Hãy chọn ít nhất một căn hộ từ dữ liệu hệ thống.'
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
    const payload = mode === 'create' ? { ...form, apartmentIds: form.apartmentScope === 'all' ? 'all' : form.apartmentIds } : form
    const succeeded = await onSubmit(payload)
    if (succeeded) setForm(mode === 'create' ? EMPTY_CREATE : EMPTY_EDIT)
  }

  return <form className="fee-admin-form" onSubmit={submit} noValidate>
    <fieldset disabled={busy}>
    <legend className="bm-sr-only">{mode === 'create' ? 'Tạo khoản thu' : 'Sửa khoản thu'}</legend>
    {mode === 'create' ? <>
      <div className="bm-field fee-admin-type-mode">
        <span className="bm-field__label" id={`${scopeId}-type`}>Loại khoản thu</span>
        <div className="fee-admin-scope" role="radiogroup" aria-labelledby={`${scopeId}-type`}>
          {[['existing', 'Loại có sẵn'], ['new', 'Tạo loại mới']].map(([value, label]) => <label key={value}>
            <input className="bm-sr-only" type="radio" name="feeTypeMode" value={value} checked={form.feeTypeMode === value} onChange={() => setField('feeTypeMode', value)} />
            <span>{label}</span>
          </label>)}
        </div>
      </div>
      {form.feeTypeMode === 'existing'
        ? <Select label="Tên loại khoản thu" required options={typeOptions} value={form.feeTypeId} error={errors.feeTypeId} onChange={(event) => setField('feeTypeId', event.target.value)} />
        : <Input label="Tên loại khoản thu mới" required maxLength="100" placeholder="Ví dụ: Phí vệ sinh năm 2027" hint="Loại mới sẽ được tạo trước khi tạo khoản thu." value={form.newFeeTypeName} error={errors.newFeeTypeName} onChange={(event) => setField('newFeeTypeName', event.target.value)} />}
      <div className="bm-field">
        <span className="bm-field__label" id={scopeId}>Phạm vi áp dụng</span>
        <div className="fee-admin-scope" role="radiogroup" aria-labelledby={scopeId}>
          {[['selected', 'Một số căn hộ'], ['all', 'Tất cả căn hộ']].map(([value, label]) => <label key={value}>
            <input className="bm-sr-only" type="radio" name="apartmentScope" value={value} checked={form.apartmentScope === value} onChange={() => chooseApartmentScope(value)} />
            <span>{label}</span>
          </label>)}
        </div>
      </div>
      {form.apartmentScope === 'selected' && <div className="fee-admin-apartments">
        <Select label="Tầng" options={FLOOR_OPTIONS} value={floor} disabled={apartmentsLoading} onChange={(event) => chooseFloor(event.target.value)} />
        <div className="fee-admin-apartments__label"><span>Căn hộ áp dụng *</span><small>{apartmentsLoading ? 'Đang tải...' : `${form.apartmentIds.length} căn đã chọn`}</small></div>
        {apartmentsError ? <p className="fee-admin-inline-error">{apartmentsError}</p>
          : apartmentsLoading ? <div className="fee-admin-apartments__state"><span className="bm-spinner" />Đang tải căn hộ...</div>
            : !apartments.length ? <div className="fee-admin-apartments__state">Tầng {floor} chưa có dữ liệu căn hộ. Cần bổ sung dữ liệu trước khi tạo khoản thu.</div>
              : <div className="fee-admin-apartments__grid" role="group" aria-label={`Chọn căn hộ tầng ${floor}`}>
                {apartments.map((apartment) => <button key={apartment.id} type="button" className={form.apartmentIds.includes(apartment.id) ? 'is-selected' : ''} aria-pressed={form.apartmentIds.includes(apartment.id)} onClick={() => toggleApartment(apartment.id)}>
                  <strong>Căn {apartment.id}</strong><small>{apartment.area} m² · {apartment.typeName}</small>
                </button>)}
              </div>}
        {errors.apartmentIds && <span className="bm-field__message bm-field__message--error">{errors.apartmentIds}</span>}
      </div>}
      <Input label="Số tiền (VND)" required type="number" min="1" step="1" value={form.amount} error={errors.amount} onChange={(event) => setField('amount', event.target.value)} />
      <Input label="Hạn nộp" required type="date" value={form.dueOn} error={errors.dueOn} onChange={(event) => setField('dueOn', event.target.value)} />
      <label className="fee-admin-check"><input type="checkbox" checked={form.optional} onChange={(event) => setField('optional', event.target.checked)} /><span>Khoản đóng góp tự nguyện</span></label>
    </> : <>
      <Select label="Loại khoản thu" required options={typeOptions} value={form.feeTypeId} error={errors.feeTypeId} onChange={(event) => setField('feeTypeId', event.target.value)} />
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
