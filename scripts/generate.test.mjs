import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { test } from 'node:test';

const root = process.cwd();
const generator = path.join(root, 'scripts', 'generate.mjs');
const source = path.join(root, 'inputs');

function snapshot(directory) {
  return fs.readdirSync(directory).sort().map((name) => `${name}\n${fs.readFileSync(path.join(directory, name), 'utf8')}`).join('\n');
}

test('same inputs produce byte-identical generator outputs', () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'taebin-generator-'));
  const first = path.join(tempRoot, 'first');
  const second = path.join(tempRoot, 'second');
  execFileSync(process.execPath, [generator, '--input', source, '--output', first], { cwd: root, stdio: 'pipe' });
  execFileSync(process.execPath, [generator, '--input', source, '--output', second], { cwd: root, stdio: 'pipe' });
  assert.equal(snapshot(first), snapshot(second));
  const siteData = JSON.parse(fs.readFileSync(path.join(first, 'site-data.json'), 'utf8'));
  assert.equal(siteData.metrics.length, 6);
  assert.equal(siteData.metrics.find((metric) => metric.id === 'attendance-absence')?.displayValue, '0일');
  assert.equal(siteData.metrics.find((metric) => metric.id === 'attendance-confirmed')?.displayValue, '26/27일');
  assert.equal(siteData.metrics.find((metric) => metric.id === 'attendance-absence')?.asOf, '2026-09-17');
  assert.equal(siteData.metrics.find((metric) => metric.id === 'attendance-confirmed')?.asOf, '2026-09-17');
  assert.equal(siteData.metrics.find((metric) => metric.id === 'submission-rate')?.displayValue, '11/11개');
  assert.equal(siteData.metrics.find((metric) => metric.id === 'submission-rate')?.detail, '제출 완료 11/11개 · 100%');
  assert.equal(siteData.metrics.find((metric) => metric.id === 'submission-rate')?.asOf, '2026-09-18');
  assert.deepEqual(siteData.metrics.map((metric) => metric.id), [
    'attendance-absence',
    'attendance-confirmed',
    'ritual-close-days',
    'ritual-open-days',
    'ritual-successes',
    'submission-rate',
  ]);
});
