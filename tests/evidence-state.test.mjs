import assert from 'node:assert/strict';
import test from 'node:test';
import { applyDailyCheck, loadDailyEntityCheck, loadEntity } from '../lib/entities.ts';

test('new TLS observation does not keep an expired baseline rotation instruction alive', () => {
  const baseline = loadEntity('mrpl');
  const daily = loadDailyEntityCheck('mrpl');
  assert.ok(baseline);
  assert.ok(daily);
  assert.equal(baseline.tls.expiresOn, '2026-05-05');
  assert.equal(daily.tls.expiresOn, '2026-10-25');

  const current = applyDailyCheck(baseline, daily);
  assert.equal(current.scanDate, baseline.scanDate);
  assert.equal(current.tls.expiresOn, '2026-10-25');
  assert.equal(current.urgentActions.length, 0);
  assert.doesNotMatch(current.oneLine, /2026-05-05|May 5/);
  assert.equal(baseline.urgentActions[0].due, '2026-05-05');
});

test('only an authorised current TLS observation creates a deadline', () => {
  const baseline = loadEntity('mrpl');
  const daily = loadDailyEntityCheck('mrpl');
  assert.ok(baseline);
  assert.ok(daily);

  const nearExpiry = {
    ...daily,
    tls: { ...daily.tls, daysToExpiry: 10 },
  };
  const current = applyDailyCheck(baseline, nearExpiry);
  assert.deepEqual(current.urgentActions.map(({ due, days }) => ({ due, days })), [
    { due: '2026-10-25', days: 10 },
  ]);
  assert.equal(applyDailyCheck(baseline, {
    ...nearExpiry,
    tls: { ...nearExpiry.tls, authorized: false },
  }).urgentActions.length, 0);
  assert.equal(applyDailyCheck(baseline, null).urgentActions.length, 0);
});
