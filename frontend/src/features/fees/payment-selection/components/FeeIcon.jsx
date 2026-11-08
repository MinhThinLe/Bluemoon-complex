import Icon from '../../../../components/ui/Icon.jsx'

const iconByCategory = {
  management: 'building',
  service: 'sparkle',
  parking: 'car',
  water: 'droplet',
  environment: 'leaf',
}

export default function FeeIcon({ category }) {
  return (
    <div className={`bm-fee-icon bm-fee-icon--${category || 'service'}`}>
      <Icon name={iconByCategory[category] || 'receipt'} size={19} />
    </div>
  )
}
