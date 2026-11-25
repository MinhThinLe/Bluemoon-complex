import assert from 'node:assert/strict'
import test from 'node:test'
import { createFee, createFeeType } from './feeManagementService.js'

test('creates a fee type with a trimmed name', async (context) => {
  const originalFetch = globalThis.fetch
  context.after(() => { globalThis.fetch = originalFetch })

  globalThis.fetch = async (url, options) => {
    assert.equal(url, '/api/new/fee-type')
    assert.equal(options.method, 'POST')
    assert.equal(options.credentials, 'include')
    assert.equal(options.body, JSON.stringify({ name: 'Phí vệ sinh năm 2027' }))
    return new Response('Add fee type ok', { status: 200, headers: { 'Content-Type': 'text/plain' } })
  }

  assert.equal(await createFeeType('  Phí vệ sinh năm 2027  '), 'Add fee type ok')
})

test('omits the apartment field for all apartments and sends IDs for a selection', async (context) => {
  const payloads = []
  context.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, '/api/new/fee')
    payloads.push(JSON.parse(options.body))
    return new Response('Success')
  })

  const fee = { amount: '50000', feeTypeId: '1', optional: false, dueOn: '2026-11-30' }
  await createFee({ ...fee, apartmentIds: 'all' })
  await createFee({ ...fee, apartmentIds: ['101', '102'] })

  assert.equal(Object.hasOwn(payloads[0], 'for'), false)
  assert.deepEqual(payloads[1].for, [101, 102])
})
