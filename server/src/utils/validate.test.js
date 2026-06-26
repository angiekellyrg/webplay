import assert from 'node:assert/strict'
import test from 'node:test'

import { requireText } from './validate.js'

test('requireText trims and caps values', () => {
  assert.equal(requireText('  hola  ', 'Campo', 10), 'hola')
  assert.equal(requireText('abcdef', 'Campo', 3), 'abc')
})

test('requireText rejects empty values', () => {
  assert.throws(() => requireText('   ', 'Campo', 10), /Campo es obligatorio/)
})
