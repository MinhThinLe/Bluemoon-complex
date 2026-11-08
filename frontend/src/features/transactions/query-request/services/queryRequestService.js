import { ApiCapabilityError } from '../../../../services/apiClient.js'

export const QUERY_REQUEST_UNAVAILABLE = 'Backend chưa cung cấp API cho yêu cầu tra cứu.'

export async function getQueryRequests() {
  throw new ApiCapabilityError(QUERY_REQUEST_UNAVAILABLE, 'query-requests')
}

export async function createQueryRequest() {
  throw new ApiCapabilityError(QUERY_REQUEST_UNAVAILABLE, 'query-requests')
}
