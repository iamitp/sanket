#!/usr/bin/env node
// Sanket passive-recon scanner.
//
// Two modes:
//   default      Refresh date-derived fields only (scanDate, daysToExpiry,
//                urgentActions[].days, urgent strip lines). No network. Safe
//                to run anywhere — never overwrites curated probe data.
//   --probe      Also run the live passive-recon probes against each entity
//                apex (openssl, curl, dig). Intended for CI runners with
//                direct egress; aborts the probe phase if a TLS-intercepting
//                proxy is detected so curated data is not clobbered.
//
// Methodology matches README.md: certificate transparency / cert expiry,
// public DNS (SPF, DMARC), HTTP header inspection. No active scanning.

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ENTITIES_DIR = join(ROOT, "data", "entities");
const REGISTER_PATH = join(ROOT, "data", "register.json");
const POSTURE_PATH = join(ROOT, "data", "posture.json");

const PROBE = process.argv.includes("--probe");

const todayISO = new Date().toISOString().slice(0, 10);
const startOfToday = Date.parse(todayISO + "T00:00:00Z");

function daysBetween(isoDate) {
  const t = Date.parse(isoDate.slice(0, 10) + "T00:00:00Z");
  if (Number.isNaN(t)) return null;
  return Math.round((t - startOfToday) / 86400000);
}

function tryRun(cmd, args, opts = {}) {
  try {
    return execFileSync(cmd, args, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
      timeout: opts.timeout ?? 8000,
      maxBuffer: 4 * 1024 * 1024,
      ...opts,
    });
  } catch {
    return null;
  }
}

function probeTLS(domain) {
  const handshake = tryRun("sh", [
    "-c",
    `echo | openssl s_client -connect ${domain}:443 -servername ${domain} 2>/dev/null | openssl x509 -noout -enddate -issuer 2>/dev/null`,
  ]);
  if (!handshake) return null;
  const endLine = handshake.match(/notAfter=(.+)/);
  const issuerLine = handshake.match(/issuer=(.+)/);
  if (!endLine) return null;
  const expires = new Date(endLine[1].trim());
  if (Number.isNaN(expires.getTime())) return null;
  const expiresOn = expires.toISOString().slice(0, 10);
  let issuer = null;
  if (issuerLine) {
    const cn = issuerLine[1].match(/CN\s*=\s*([^,/]+)/i);
    const o = issuerLine[1].match(/O\s*=\s*([^,/]+)/i);
    issuer = (cn?.[1] || o?.[1] || issuerLine[1]).trim();
  }
  return { expiresOn, issuer };
}

function probeHeaders(domain) {
  const out = tryRun("curl", [
    "-sIL",
    "--max-time",
    "8",
    "-A",
    "sanket-scan/1.0 (+https://sanket.amitpatnaik.com)",
    `https://${domain}`,
  ]);
  if (!out) return null;
  const has = (h) => new RegExp(`^${h}\\s*:`, "im").test(out);
  return {
    hsts: has("strict-transport-security"),
    csp: has("content-security-policy"),
    xFrame: has("x-frame-options"),
    xContentType: has("x-content-type-options"),
    referrerPolicy: has("referrer-policy"),
    permissionsPolicy: has("permissions-policy") || has("feature-policy"),
  };
}

function digTXT(name) {
  const out = tryRun("dig", ["+short", "+time=4", "+tries=1", "TXT", name]);
  if (!out) return null;
  return out
    .split("\n")
    .map((l) => l.trim().replace(/^"|"$/g, "").replace(/"\s+"/g, ""))
    .filter(Boolean);
}

function probeSPF(domain) {
  const records = digTXT(domain);
  if (!records) return null;
  const spf = records.find((r) => /^v=spf1\b/i.test(r));
  if (!spf) return "missing";
  const hasMech = /\b(include:|a\b|mx\b|ip4:|ip6:|exists:)/i.test(spf);
  if (/-all\s*$/i.test(spf) && !hasMech) return "broken";
  if (/-all\s*$/i.test(spf)) return "strict";
  if (/~all\s*$/i.test(spf)) return "soft";
  if (/\+all\s*$/i.test(spf)) return "permissive";
  if (/\?all\s*$/i.test(spf)) return "neutral";
  return "present";
}

function probeDMARC(domain) {
  const records = digTXT(`_dmarc.${domain}`);
  if (!records) return null;
  const dmarc = records.find((r) => /^v=dmarc1\b/i.test(r));
  if (!dmarc) return "missing";
  const p = dmarc.match(/\bp\s*=\s*(none|quarantine|reject)/i);
  return p ? p[1].toLowerCase() : "present";
}

function tlsState(daysToExpiry) {
  if (daysToExpiry == null) return "unknown";
  if (daysToExpiry < 0) return "fail";
  if (daysToExpiry <= 21) return "warn";
  return "pass";
}

// Sanity check: if a TLS-intercepting proxy is on the egress path, every
// probe will return the same issuer. Detect that and refuse to overwrite.
function detectInterception(probes) {
  const issuers = probes
    .map((p) => p.tls?.issuer)
    .filter(Boolean)
    .map((s) => s.trim().toLowerCase());
  if (issuers.length < 5) return null;
  const counts = new Map();
  for (const i of issuers) counts.set(i, (counts.get(i) || 0) + 1);
  const [topIssuer, n] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  if (n / issuers.length > 0.7) return topIssuer;
  return null;
}

function readJSON(p) {
  return JSON.parse(readFileSync(p, "utf8"));
}
function writeJSON(p, obj) {
  writeFileSync(p, JSON.stringify(obj, null, 2) + "\n");
}

const entityFiles = readdirSync(ENTITIES_DIR)
  .filter((f) => f.endsWith(".json"))
  .map((f) => join(ENTITIES_DIR, f));

const entities = entityFiles.map((p) => ({ path: p, data: readJSON(p) }));

console.log(`[sanket] ${PROBE ? "probe" : "refresh"} mode @ ${todayISO}`);

let probeResults = [];
if (PROBE) {
  console.log(`[sanket] probing ${entities.length} entities`);
  for (const e of entities) {
    const r = {
      slug: e.data.slug,
      tls: probeTLS(e.data.domain),
      headers: probeHeaders(e.data.domain),
      spf: probeSPF(e.data.domain),
      dmarc: probeDMARC(e.data.domain),
    };
    probeResults.push(r);
    process.stdout.write(`  ${e.data.slug.padEnd(14)} ${e.data.domain} ... `);
    console.log(
      `tls=${r.tls ? "ok" : "skip"} hdr=${r.headers ? "ok" : "skip"} ` +
        `spf=${r.spf ?? "skip"} dmarc=${r.dmarc ?? "skip"}`,
    );
  }
  const intercepted = detectInterception(probeResults);
  if (intercepted) {
    console.error(
      `[sanket] aborting probe: TLS interception detected ` +
        `(${probeResults.filter((p) => p.tls).length} probes share issuer "${intercepted}"). ` +
        `Curated data left intact.`,
    );
    probeResults = []; // discard
  }
}

const probeBySlug = new Map(probeResults.map((r) => [r.slug, r]));

for (const e of entities) {
  const r = probeBySlug.get(e.data.slug);
  if (r?.tls) {
    e.data.tls = e.data.tls || {};
    e.data.tls.expiresOn = r.tls.expiresOn;
    if (r.tls.issuer) e.data.tls.issuer = r.tls.issuer;
  }
  if (r?.headers) e.data.headers = r.headers;
  if (r?.spf) {
    e.data.emailAuth = e.data.emailAuth || {};
    e.data.emailAuth.spf = r.spf;
  }
  if (r?.dmarc) {
    e.data.emailAuth = e.data.emailAuth || {};
    e.data.emailAuth.dmarc = r.dmarc;
  }

  if (e.data.tls?.expiresOn) {
    e.data.tls.daysToExpiry = daysBetween(e.data.tls.expiresOn);
    e.data.tls.state = tlsState(e.data.tls.daysToExpiry);
  }

  if (Array.isArray(e.data.urgentActions)) {
    for (const a of e.data.urgentActions) {
      if (typeof a.due === "string" && /^\d{4}-\d{2}-\d{2}$/.test(a.due)) {
        const d = daysBetween(a.due);
        if (d != null) a.days = d;
      }
    }
  }

  e.data.scanDate = todayISO;
  if (PROBE && r) {
    e.data.lastProbe = {
      at: new Date().toISOString(),
      tls: r.tls ? "ok" : "skip",
      headers: r.headers ? "ok" : "skip",
      spf: r.spf ? "ok" : "skip",
      dmarc: r.dmarc ? "ok" : "skip",
    };
  }
  writeJSON(e.path, e.data);
}

// --- register.json ---
const register = readJSON(REGISTER_PATH);
register.meta.scanDate = todayISO;
register.meta.entityCount = entities.length;

const certUrgentRe = /cert(ificate)?\s+expires/i;
const preserved = (register.urgent || []).filter(
  (s) => typeof s === "string" && !certUrgentRe.test(s),
);
const certUrgent = entities
  .map((e) => e.data)
  .filter((e) => e.tls?.daysToExpiry != null && e.tls.daysToExpiry <= 21)
  .sort((a, b) => a.tls.daysToExpiry - b.tls.daysToExpiry)
  .map((e) => {
    const d = e.tls.daysToExpiry;
    const when =
      d < 0
        ? `<strong>EXPIRED ${Math.abs(d)} day${Math.abs(d) === 1 ? "" : "s"} ago</strong>`
        : `${d} day${d === 1 ? "" : "s"} from scan`;
    const note = e.tls.note ? ` ${e.tls.note}.` : "";
    return `<strong>${e.short || e.name} cert expires ${e.tls.expiresOn}</strong> — ${when}. <code>${e.domain}</code>.${note}`;
  });
register.urgent = [...certUrgent, ...preserved];
writeJSON(REGISTER_PATH, register);

// --- posture.json ---
const posture = readJSON(POSTURE_PATH);
posture.asOf = todayISO;
writeJSON(POSTURE_PATH, posture);

console.log(
  `[sanket] wrote register.json, posture.json, ${entities.length} entity files`,
);
