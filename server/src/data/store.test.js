import assert from 'node:assert/strict'
import test from 'node:test'

import { createStore } from './store.js'

test('createStore caps alerts and messages', () => {
  const store = createStore({ alertLimit: 2, messageLimit: 2 })

  store.addAlert({ level: 'info', message: 'uno', title: 'uno' })
  store.addAlert({ level: 'info', message: 'dos', title: 'dos' })
  store.addAlert({ level: 'info', message: 'tres', title: 'tres' })

  store.addMessage({ author: 'a', text: 'uno' })
  store.addMessage({ author: 'a', text: 'dos' })
  store.addMessage({ author: 'a', text: 'tres' })

  assert.equal(store.getAlerts().length, 2)
  assert.equal(store.getMessages().length, 2)
})

test('createStore deduplicates push subscriptions by endpoint', () => {
  const store = createStore()
  const subscription = { endpoint: 'https://example.com/1', keys: { auth: 'a', p256dh: 'b' } }

  store.upsertSubscription(subscription)
  store.upsertSubscription(subscription)

  assert.equal(store.getSubscriptions().length, 1)
})
