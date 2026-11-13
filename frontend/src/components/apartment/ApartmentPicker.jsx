import Icon from '../ui/Icon.jsx'
import './apartment-picker.css'

export default function ApartmentPicker({
  floor,
  apartmentId,
  apartments,
  maxFloor = 30,
  loading = false,
  onFloorChange,
  onApartmentChange,
}) {
  const floors = Array.from({ length: maxFloor }, (_, index) => String(index + 1))

  return (
    <div className="apartment-picker">
      <div className="apartment-picker__floors">
        <div className="apartment-picker__label">
          <span>Chọn tầng</span>
          <small>{maxFloor} tầng</small>
        </div>
        <div className="apartment-picker__floor-grid" role="group" aria-label="Chọn tầng">
          {floors.map((item) => (
            <button
              key={item}
              type="button"
              className={floor === item ? 'is-active' : ''}
              aria-pressed={floor === item}
              disabled={loading}
              onClick={() => onFloorChange(item)}
            >
              <span className="bm-sr-only">Tầng </span>{item}
            </button>
          ))}
        </div>
      </div>

      <div className="apartment-picker__apartments">
        <div className="apartment-picker__label">
          <span>Chọn căn hộ</span>
          {!loading && apartments.length > 0 && <small>{apartments.length} căn tại tầng {floor}</small>}
        </div>
        {loading ? (
          <div className="apartment-picker__state" role="status">
            <span className="bm-spinner" /> Đang tải căn hộ tầng {floor}...
          </div>
        ) : apartments.length ? (
          <div className="apartment-picker__apartment-grid" role="radiogroup" aria-label={`Căn hộ tầng ${floor}`}>
            {apartments.map((apartment) => {
              const value = String(apartment.id)
              const selected = apartmentId === value
              return (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  className={selected ? 'is-selected' : ''}
                  onClick={() => onApartmentChange(value)}
                >
                  <span className="apartment-picker__building"><Icon name="building" size={18} /></span>
                  <span className="apartment-picker__apartment-copy">
                    <strong>Căn {apartment.id}</strong>
                    <small>{apartment.area} m² · {apartment.typeName}</small>
                  </span>
                  <span className="apartment-picker__check"><Icon name="check" size={14} /></span>
                </button>
              )
            })}
          </div>
        ) : (
          <div className="apartment-picker__state">Tầng {floor} chưa có dữ liệu căn hộ.</div>
        )}
      </div>
    </div>
  )
}
