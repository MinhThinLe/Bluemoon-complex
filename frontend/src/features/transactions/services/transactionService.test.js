import assert from 'node:assert/strict'
import test from 'node:test'
import { normalizeApartmentFee } from './transactionService.js'

test('normalizes the backend apartment-fee response', () => {
  const fee = normalizeApartmentFee({
    id: 42,
    amount: 560000,
    paid: false,
    optional: false,
    type_name: 'Phí quản lý vận hành',
    type_id: 3,
    created_at: 1793494800,
    due_on: 1794358800,
  }, 1208)

  assert.equal(fee.name, 'Phí quản lý vận hành')
  assert.equal(fee.id, 42)
  assert.equal(fee.typeId, 3)
  assert.equal(fee.category, 'management')
  assert.equal(fee.amount, 560000)
  assert.equal(fee.apartment, 'BM-1208')
  assert.equal(fee.paid, false)
  assert.match(fee.dueDate, /^2026-11-/)
  assert.equal(fee.period, 'Tháng 11/2026')
})

test('tolerates legacy hyphenated field names during the API rollout', () => {
  const fee = normalizeApartmentFee({
    amount: 80000,
    paid: true,
    optional: true,
    'type-name': 'Phí gửi xe',
    'created-at': 1793494800,
    'due-on': 1794358800,
  }, 1208, 1)

  assert.equal(fee.category, 'parking')
  assert.equal(fee.optional, true)
  assert.equal(fee.paid, true)
  assert.match(fee.id, /^fee-1208-/)
})
