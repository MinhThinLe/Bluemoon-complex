import assert from 'node:assert/strict'
import test from 'node:test'
import { createFeeType } from './feeManagementService.js'

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
