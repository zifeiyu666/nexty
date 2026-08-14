import assert from 'node:assert/strict';
import test from 'node:test';
import { isSuccessfulCreemCheckout } from '../lib/creem/checkout-status';

test('accepts Creem completed checkouts whose order is paid', () => {
  assert.equal(
    isSuccessfulCreemCheckout({
      status: 'completed',
      order: { status: 'paid' },
    }),
    true
  );
});

test('retains compatibility with completed orders', () => {
  assert.equal(
    isSuccessfulCreemCheckout({
      status: 'completed',
      order: { status: 'completed' },
    }),
    true
  );
});

test('rejects incomplete or unpaid checkouts', () => {
  assert.equal(
    isSuccessfulCreemCheckout({
      status: 'pending',
      order: { status: 'paid' },
    }),
    false
  );
  assert.equal(
    isSuccessfulCreemCheckout({
      status: 'completed',
      order: { status: 'pending' },
    }),
    false
  );
});
