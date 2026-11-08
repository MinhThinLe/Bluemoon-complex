import assert from 'node:assert/strict'
import test from 'node:test'
import { ApiError, apiRequest } from './apiClient.js'

test('serializes object bodies and includes credentials', async (context) => {
  const originalFetch = globalThis.fetch
  context.after(() => { globalThis.fetch = originalFetch })

  globalThis.fetch = async (url, options) => {
    assert.equal(url, '/api/new/fee')
    assert.equal(options.credentials, 'include')
    assert.equal(options.headers['Content-Type'], 'application/json')
    assert.equal(options.body, JSON.stringify({ amount: 1000 }))
    return new Response('Success', { status: 200, headers: { 'Content-Type': 'text/plain' } })
  }

  assert.equal(await apiRequest('/new/fee', { method: 'POST', body: { amount: 1000 } }), 'Success')
})

test('returns a typed error for failed API responses', async (context) => {
  const originalFetch = globalThis.fetch
  context.after(() => { globalThis.fetch = originalFetch })

  globalThis.fetch = async () => new Response(
    JSON.stringify({ error: { message: 'Invalid apartment' } }),
    { status: 400, headers: { 'Content-Type': 'application/json' } },
  )

  await assert.rejects(
    apiRequest('/fee/apartment/0'),
    (error) => error instanceof ApiError && error.status === 400 && error.message === 'Invalid apartment',
  )
})

test('wraps connection failures in an ApiError', async (context) => {
  const originalFetch = globalThis.fetch
  context.after(() => { globalThis.fetch = originalFetch })
  globalThis.fetch = async () => { throw new TypeError('fetch failed') }

  await assert.rejects(
    apiRequest('/fee-types'),
    (error) => error instanceof ApiError && error.status === 0,
  )
})
