import assert from 'node:assert/strict'
import test from 'node:test'
import { logout } from './authService.js'

test('logout calls the backend POST /api/logout endpoint with cookie credentials', async (context) => {
  const originalFetch = globalThis.fetch
  context.after(() => { globalThis.fetch = originalFetch })

  globalThis.fetch = async (url, options) => {
    assert.equal(url, '/api/logout')
    assert.equal(options.method, 'POST')
    assert.equal(options.credentials, 'include')
    return new Response(null, { status: 200 })
  }

  assert.equal(await logout(), null)
})
