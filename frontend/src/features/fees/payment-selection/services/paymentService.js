import { runtimeConfig } from '../../../../config/runtime.js'
import { getTransactionsByApartment } from '../../../transactions/services/transactionService.js'

export function getResidentFees(apartmentId = runtimeConfig.residentApartmentId) {
  return getTransactionsByApartment(apartmentId)
}
