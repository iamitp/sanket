import dns from 'node:dns/promises';
import fs from 'node:fs';
import http from 'node:http';
import https from 'node:https';
import path from 'node:path';
import tls from 'node:tls';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const dataDir = path.join(repoRoot, 'data');
const entitiesDir = path.join(dataDir, 'entities');
const outputFile = path.join(dataDir, 'daily-check.json');

const TIMEOUT_MS = 10000;
const USER_AGENT =
  'Sanket/0.1 daily passive check (DNS TXT, TLS expiry, HTTPS headers only; contact: amitpatnaik.com)';

const dryRun = process.argv.includes('--dry-run');

function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

function daysUntil(dateText, fromDate) {
  if (!dateText || !/^\d{4}-\d{2}-\d{2}$/.test(dateText)) return null;
  const [year, month, day] = dateText.split('-').map(Number);
  const due = Date.UTC(year, month - 1, day);
  const from = Date.UTC(fromDate.getUTCFullYear(), fromDate.getUTCMonth(), fromDate.getUTCDate());
  return Math.ceil((due - from) / 86400000);
}

function headerValue(headers, name) {
  const value = headers[name.toLowerCase()];
  if (Array.isArray(value)) return value.join(', ');
  return value ? String(value) : '';
}

function cspState(value) {
  if (!value) return false;
  const lower = value.toLowerCase();
  if (
    lower.includes("'unsafe-inline'") ||
    lower.includes("'unsafe-eval'") ||
    lower.includes('script-src *') ||
    lower.includes('default-src *')
  ) {
    return 'permissive';
  }
  return true;
}

function classifyHeaders(headers) {
  const hsts = headerValue(headers, 'strict-transport-security');
  const csp = headerValue(headers, 'content-security-policy');
  const xFrame = headerValue(headers, 'x-frame-options');
  const xContentType = headerValue(headers, 'x-content-type-options');
  const referrerPolicy = headerValue(headers, 'referrer-policy');
  const permissionsPolicy =
    headerValue(headers, 'permissions-policy') || headerValue(headers, 'feature-policy');

  const states = {
    hsts: Boolean(hsts),
    csp: cspState(csp),
    xFrame: Boolean(xFrame || csp.toLowerCase().includes('frame-ancestors')),
    xContentType: xContentType.toLowerCase().includes('nosniff'),
    referrerPolicy: Boolean(referrerPolicy),
    permissionsPolicy: Boolean(permissionsPolicy),
  };

  const labels = {
    hsts: 'HSTS',
    csp: 'CSP',
    xFrame: 'X-Frame-Options',
    xContentType: 'X-Content-Type-Options',
    referrerPolicy: 'Referrer-Policy',
    permissionsPolicy: 'Permissions-Policy',
  };

  const missing = Object.entries(states)
    .filter(([, value]) => value === false)
    .map(([key]) => labels[key]);
  const permissive = Object.entries(states)
    .filter(([, value]) => value === 'permissive')
    .map(([key]) => labels[key]);

  return { states, missing, permissive };
}

function requestHeaders(url, redirects = 0) {
  return new Promise((resolve) => {
    const target = new URL(url);
    const client = target.protocol === 'http:' ? http : https;
    const request = client.request(
      target,
      {
        method: 'HEAD',
        timeout: TIMEOUT_MS,
        rejectUnauthorized: false,
        headers: {
          'User-Agent': USER_AGENT,
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      },
      (response) => {
        response.resume();
        const location = response.headers.location;
        if (
          location &&
          response.statusCode &&
          response.statusCode >= 300 &&
          response.statusCode < 400 &&
          redirects < 5
        ) {
          resolve(requestHeaders(new URL(location, target).toString(), redirects + 1));
          return;
        }
        resolve({
          ok: true,
          statusCode: response.statusCode || 0,
          finalUrl: target.toString(),
          headers: response.headers,
        });
      },
    );

    request.on('timeout', () => {
      request.destroy(new Error('request timed out'));
    });
    request.on('error', (error) => {
      resolve({
        ok: false,
        error: error.message,
        finalUrl: target.toString(),
        headers: {},
      });
    });
    request.end();
  });
}

function readTlsCertificate(domain, fromDate) {
  return new Promise((resolve) => {
    const socket = tls.connect({
      host: domain,
      port: 443,
      servername: domain,
      rejectUnauthorized: false,
      timeout: TIMEOUT_MS,
    });

    socket.once('secureConnect', () => {
      const cert = socket.getPeerCertificate();
      const validTo = cert && cert.valid_to ? new Date(cert.valid_to) : null;
      const expiresOn = validTo && !Number.isNaN(validTo.getTime()) ? isoDate(validTo) : undefined;
      const remaining = expiresOn ? daysUntil(expiresOn, fromDate) : undefined;
      const issuer =
        cert && cert.issuer
          ? cert.issuer.O || cert.issuer.CN || cert.issuer.OU || cert.issuer.C || 'Unknown issuer'
          : 'Unknown issuer';

      let state = 'pass';
      const notes = [];
      if (remaining == null) {
        state = 'unknown';
        notes.push('certificate expiry unavailable');
      } else if (remaining < 0) {
        state = 'fail';
        notes.push('certificate expired');
      } else if (remaining <= 45) {
        state = 'warn';
        notes.push(`certificate expires in ${remaining} days`);
      }
      if (!socket.authorized && socket.authorizationError) {
        state = state === 'fail' ? 'fail' : 'warn';
        notes.push(`TLS validation warning: ${socket.authorizationError}`);
      }

      socket.end();
      resolve({
        state,
        issuer,
        ...(expiresOn ? { expiresOn } : {}),
        ...(remaining != null ? { daysToExpiry: remaining } : {}),
        ...(notes.length ? { note: notes.join('; ') } : {}),
        authorized: socket.authorized,
        authorizationError: socket.authorizationError || null,
      });
    });

    socket.once('timeout', () => {
      socket.destroy(new Error('TLS connection timed out'));
    });
    socket.once('error', (error) => {
      resolve({
        state: 'unknown',
        issuer: 'Unavailable',
        note: error.message,
        authorized: false,
        authorizationError: error.message,
      });
    });
  });
}

async function resolveTxt(name) {
  try {
    const records = await dns.resolveTxt(name);
    return {
      records: records.map((parts) => parts.join('')).filter(Boolean),
      error: null,
    };
  } catch (error) {
    if (['ENODATA', 'ENOTFOUND', 'ENODOMAIN'].includes(error.code)) {
      return { records: [], error: null };
    }
    return { records: [], error: error.message };
  }
}

function classifySpf(records) {
  const record = records.find((entry) => /^v=spf1\b/i.test(entry));
  if (!record) return { state: 'missing', record: null, note: null };

  const lower = record.toLowerCase();
  const hasAllowedSender =
    /\b(include|ip4|ip6|a|mx|exists|redirect)=?/i.test(record) || /\s(a|mx)(\s|$)/i.test(record);

  if (/\s-all(\s|$)/.test(lower) || lower.endsWith('-all')) {
    if (!hasAllowedSender) {
      return { state: 'broken', record, note: 'SPF hard-fails all senders with no allowed sender mechanism.' };
    }
    return { state: 'strict', record, note: null };
  }
  if (/\s~all(\s|$)/.test(lower) || lower.endsWith('~all')) {
    return { state: 'soft', record, note: null };
  }
  return { state: 'present', record, note: 'SPF exists but does not end in a strict hard-fail policy.' };
}

function classifyDmarc(records) {
  const record = records.find((entry) => /^v=DMARC1\b/i.test(entry));
  if (!record) return { state: 'absent', record: null, note: null };

  const lower = record.toLowerCase();
  if (/(^|;)\s*p=reject\b/.test(lower)) return { state: 'reject', record, note: null };
  if (/(^|;)\s*p=quarantine\b/.test(lower)) return { state: 'quarantine', record, note: null };
  if (/(^|;)\s*p=none\b/.test(lower)) return { state: 'none', record, note: null };
  return { state: 'none', record, note: 'DMARC record is present but no enforceable p= policy was found.' };
}

async function checkEmailAuth(entity) {
  const [spfLookup, dmarcLookup] = await Promise.all([
    resolveTxt(entity.domain),
    resolveTxt(`_dmarc.${entity.domain}`),
  ]);
  const spf = classifySpf(spfLookup.records);
  const dmarc = classifyDmarc(dmarcLookup.records);
  const notes = [
    spf.note,
    dmarc.note,
    spfLookup.error ? `SPF DNS lookup warning: ${spfLookup.error}` : '',
    dmarcLookup.error ? `DMARC DNS lookup warning: ${dmarcLookup.error}` : '',
  ].filter(Boolean);

  return {
    spf: spf.state,
    dkim: entity.emailAuth?.dkim || 'unknown',
    dmarc: dmarc.state,
    ...(notes.length ? { note: notes.join(' ') } : {}),
    spfRecord: spf.record,
    dmarcRecord: dmarc.record,
  };
}

function buildFindings({ headers, headerMeta, tlsResult, emailAuth, availability }) {
  const findings = [];
  if (availability.ok) {
    findings.push(`HTTP ${availability.statusCode} at ${availability.finalUrl}`);
  } else {
    findings.push(`HTTP header check failed: ${availability.error}`);
  }

  if (tlsResult.expiresOn && tlsResult.daysToExpiry != null) {
    findings.push(`TLS expires ${tlsResult.expiresOn} (${tlsResult.daysToExpiry}d)`);
  } else {
    findings.push(`TLS check ${tlsResult.state}: ${tlsResult.note || 'certificate unavailable'}`);
  }

  if (headerMeta.missing.length) {
    findings.push(`Missing headers: ${headerMeta.missing.join(', ')}`);
  }
  if (headerMeta.permissive.length) {
    findings.push(`Permissive headers: ${headerMeta.permissive.join(', ')}`);
  }
  if (!headerMeta.missing.length && !headerMeta.permissive.length) {
    findings.push('All tracked hardening headers present.');
  }

  findings.push(`Email auth: SPF ${emailAuth.spf}, DMARC ${emailAuth.dmarc}`);
  if (emailAuth.note) findings.push(emailAuth.note);

  const headerCount = Object.values(headers).filter((value) => value === true).length;
  findings.push(`${headerCount}/6 tracked hardening headers present.`);
  return findings;
}

function attentionScore(result) {
  let score = 0;
  if (!result.availability.ok) score += 30;
  if (result.tls.state === 'fail') score += 40;
  if (result.tls.state === 'warn') score += 18;
  if (result.tls.state === 'unknown') score += 8;
  if (result.emailAuth.spf === 'missing' || result.emailAuth.spf === 'broken') score += 16;
  if (result.emailAuth.dmarc === 'absent' || result.emailAuth.dmarc === 'none') score += 16;
  score += result.headerFindings.missing.length * 4;
  score += result.headerFindings.permissive.length * 2;
  return score;
}

async function checkEntity(entity, checkedAt, checkedDate, fromDate) {
  const [availability, tlsResult, emailAuth] = await Promise.all([
    requestHeaders(`https://${entity.domain}/`),
    readTlsCertificate(entity.domain, fromDate),
    checkEmailAuth(entity),
  ]);
  const headerMeta = classifyHeaders(availability.headers || {});
  const findings = buildFindings({
    headers: headerMeta.states,
    headerMeta,
    tlsResult,
    emailAuth,
    availability,
  });

  const result = {
    slug: entity.slug,
    name: entity.name,
    short: entity.short,
    domain: entity.domain,
    checkedAt,
    checkedDate,
    availability: {
      ok: availability.ok,
      ...(availability.statusCode ? { statusCode: availability.statusCode } : {}),
      ...(availability.finalUrl ? { finalUrl: availability.finalUrl } : {}),
      ...(availability.error ? { error: availability.error } : {}),
    },
    tls: tlsResult,
    headers: headerMeta.states,
    headerFindings: {
      missing: headerMeta.missing,
      permissive: headerMeta.permissive,
    },
    emailAuth,
    findings,
  };

  return { ...result, attentionScore: attentionScore(result) };
}

function loadEntities() {
  return fs
    .readdirSync(entitiesDir)
    .filter((file) => file.endsWith('.json'))
    .sort()
    .map((file) => JSON.parse(fs.readFileSync(path.join(entitiesDir, file), 'utf8')));
}

function summarize(results) {
  const tlsWarnCount = results.filter((entity) => entity.tls.state === 'warn').length;
  const tlsFailCount = results.filter((entity) => entity.tls.state === 'fail').length;
  const availabilityErrorCount = results.filter((entity) => !entity.availability.ok).length;
  const headerGapCount = results.filter(
    (entity) => entity.headerFindings.missing.length || entity.headerFindings.permissive.length,
  ).length;
  const emailRiskCount = results.filter(
    (entity) =>
      entity.emailAuth.spf === 'missing' ||
      entity.emailAuth.spf === 'broken' ||
      entity.emailAuth.dmarc === 'absent' ||
      entity.emailAuth.dmarc === 'none',
  ).length;
  const topAttention = [...results]
    .sort((a, b) => b.attentionScore - a.attentionScore)
    .slice(0, 5)
    .map((entity) => ({
      slug: entity.slug,
      short: entity.short,
      domain: entity.domain,
      score: entity.attentionScore,
      headline: entity.findings.slice(0, 3).join(' | '),
    }));

  return {
    entityCount: results.length,
    okCount: results.length - availabilityErrorCount,
    availabilityErrorCount,
    tlsWarnCount,
    tlsFailCount,
    headerGapCount,
    emailRiskCount,
    topAttention,
  };
}

async function main() {
  const now = new Date();
  const checkedAt = now.toISOString();
  const checkedDate = isoDate(now);
  const entities = loadEntities();
  const results = [];

  for (const entity of entities) {
    console.log(`Checking ${entity.short || entity.slug} (${entity.domain})`);
    results.push(await checkEntity(entity, checkedAt, checkedDate, now));
  }

  const report = {
    report: 'sanket-daily-passive-check',
    version: 1,
    checkedAt,
    checkedDate,
    cadence: 'daily',
    scope:
      'Passive DNS TXT, TLS certificate, and HTTPS response-header checks only. No port scanning, vulnerability scanning, authentication probing, fuzzing, or takeover validation.',
    summary: summarize(results),
    entities: results,
  };

  const json = `${JSON.stringify(report, null, 2)}\n`;
  if (dryRun) {
    console.log(json);
    return;
  }

  fs.writeFileSync(outputFile, json);
  console.log(`Wrote ${path.relative(repoRoot, outputFile)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
