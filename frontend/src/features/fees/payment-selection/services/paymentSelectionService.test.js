import assert from 'node:assert/strict'
import test from 'node:test'
import { getApartmentsByFloor } from './paymentSelectionService.js'

test('loads apartments using the backend floor endpoint and normalizes its payload', async (context) => {
  const originalFetch = globalThis.fetch
  context.after(() => { globalThis.fetch = originalFetch })

  globalThis.fetch = async (url, options) => {
    assert.equal(url, '/api/apartments/12')
    assert.equal(options.credentials, 'include')
    return new Response(JSON.stringify({ apartments: [
      { id: 1208, area: 68.5, type_name: 'Căn hộ 2 phòng ngủ' },
      // The backend SQL BETWEEN includes its upper boundary. It belongs to floor 13.
      { id: 1300, area: 72, type_name: 'Căn hộ 3 phòng ngủ' },
    ] }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  }

  assert.deepEqual(await getApartmentsByFloor(12), [
    { id: 1208, area: 68.5, typeName: 'Căn hộ 2 phòng ngủ' },
  ])
})

test('rejects floor values outside the documented range before calling the API', async () => {
  await assert.rejects(getApartmentsByFloor(0), /từ 1 đến 30/)
  await assert.rejects(getApartmentsByFloor(31), /từ 1 đến 30/)
  await assert.rejects(getApartmentsByFloor('1.5'), /từ 1 đến 30/)
})
