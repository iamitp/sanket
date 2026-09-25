import fs from 'node:fs';
import path from 'node:path';

export type Tier = 'HIGH' | 'MEDIUM' | 'LOW' | 'PROVISIONAL';

export type SpfState = 'strict' | 'soft' | 'broken' | 'missing' | 'present';
export type DkimState = 'present' | 'missing' | 'unknown';
export type DmarcState = 'reject' | 'quarantine' | 'none' | 'absent';

export type HeaderState = boolean | 'permissive';

export type SubdomainCategory =
  | 'auth'
  | 'dev'
  | 'admin'
  | 'docmgmt'
  | 'api'
  | 'portal'
  | 'infra'
  | 'app'
  | 'web';

export type AttackPathEffort = 'hours' | 'days' | 'weeks';
export type AttackPathDetection = 'low' | 'medium' | 'high';

export type EntityReport = {
  slug: string;
  name: string;
  short: string;
  category: 'ministry' | 'regulator' | 'omc' | 'upstream' | 'gas' | 'refiner' | 'epc' | 'safety' | 'education' | 'jv';
  domain: string;
  tier: Tier;
  securityScore: number; // 0-100, lower is worse
  riskLabel: 'Critical' | 'Elevated' | 'Watch' | 'Normal';
  scanDate: string;
  oneLine: string;

  tls: {
    state: 'pass' | 'warn' | 'fail' | 'unknown';
    issuer: string;
    expiresOn?: string;
    daysToExpiry?: number;
    note?: string;
  };

  headers: {
    hsts: HeaderState;
    csp: HeaderState;
    xFrame: HeaderState;
    xContentType: HeaderState;
    referrerPolicy: HeaderState;
    permissionsPolicy: HeaderState;
  };

  emailAuth: {
    spf: SpfState;
    dkim: DkimState;
    dmarc: DmarcState;
    note?: string;
  };

  topology: {
    totalSubdomains: number;
    sensitiveCount: number;
    sensitive: { name: string; category: SubdomainCategory }[];
  };

  lookalikes: {
    domain: string;
    resolvesTo?: string;
    note?: string;
  }[];

  findings: string[];

  urgentActions: {
    what: string;
    due: string;
    days: number;
  }[];

  // Phase 2 — only present when active scan + Mythos sim has been run
  phase2?: {
    runDate: string;
    fingerprints: {
      host: string;
      stack: string;
      versions: string[];
      eolFlags: string[];
    }[];
    attackPaths: {
      id: string;
      name: string;
      entry: string;
      pivot: string;
      objective: string;
      effort: AttackPathEffort;
      detection: AttackPathDetection;
      priority: number;
    }[];
    mythosCompression: {
      paths: { pathId: string; preAi: string; mythos: string; factor: string }[];
    };
    cisoPatchList: {
      tier: 1 | 2 | 3;
      title: string;
      severity: 'critical' | 'high' | 'medium';
      host: string;
      cve?: string;
      fix: string;
      owner: string;
      validation: string;
    }[];
    headlineQuestion?: string;
  };
};

export type DailyEntityCheck = {
  slug: string;
  name: string;
  short: string;
  domain: string;
  checkedAt: string;
  checkedDate: string;
  availability: {
    ok: boolean;
    statusCode?: number;
    finalUrl?: string;
    error?: string;
  };
  tls: EntityReport['tls'] & {
    authorized?: boolean;
    authorizationError?: string | null;
  };
  headers: EntityReport['headers'];
  headerFindings: {
    missing: string[];
    permissive: string[];
  };
  emailAuth: EntityReport['emailAuth'] & {
    spfRecord?: string | null;
    dmarcRecord?: string | null;
  };
  findings: string[];
  attentionScore: number;
};

export type DailyCheckReport = {
  report: 'sanket-daily-passive-check';
  version: number;
  checkedAt: string;
  checkedDate: string;
  cadence: 'daily';
  scope: string;
  summary: {
    entityCount: number;
    okCount: number;
    availabilityErrorCount: number;
    tlsWarnCount: number;
    tlsFailCount: number;
    headerGapCount: number;
    emailRiskCount: number;
    topAttention: {
      slug: string;
      short: string;
      domain: string;
      score: number;
      headline: string;
    }[];
  };
  entities: DailyEntityCheck[];
};

export const ENTITY_SLUGS = [
  'mopng',
  'ppac',
  'pngrb',
  'dgh',
  'ongc',
  'oil-india',
  'bprl',
  'petronet-lng',
  'ioc',
  'bpcl',
  'hpcl',
  'gail',
  'eil',
  'nrl',
  'mrpl',
  'cpcl',
  'oisd',
  'pcra',
  'rgipt',
] as const;

export type EntitySlug = (typeof ENTITY_SLUGS)[number];

const dataRoot = path.join(process.cwd(), 'data');
const dataDir = path.join(dataRoot, 'entities');
const dailyCheckFile = path.join(dataRoot, 'daily-check.json');

export function loadEntity(slug: string): EntityReport | null {
  if (!ENTITY_SLUGS.includes(slug as EntitySlug)) return null;
  const file = path.join(dataDir, `${slug}.json`);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, 'utf-8')) as EntityReport;
}

export function loadAllEntities(): EntityReport[] {
  return ENTITY_SLUGS.map((s) => loadEntity(s)).filter((e): e is EntityReport => e !== null);
}

export function loadDailyCheck(): DailyCheckReport | null {
  if (!fs.existsSync(dailyCheckFile)) return null;
  return JSON.parse(fs.readFileSync(dailyCheckFile, 'utf-8')) as DailyCheckReport;
}

export function loadDailyEntityCheck(slug: string): DailyEntityCheck | null {
  const report = loadDailyCheck();
  return report?.entities.find((entity) => entity.slug === slug) ?? null;
}

export function applyDailyCheck(entity: EntityReport, check: DailyEntityCheck | null): EntityReport {
  // Baseline actions have historical target dates. They must never become
  // today's priorities merely because a fresh passive observation exists.
  if (!check) return {
    ...entity,
    oneLine: `No current passive check; historical assessment dated ${entity.scanDate}.`,
    urgentActions: [],
  };
  const currentTlsAction: EntityReport['urgentActions'] = [];
  if (
    check.tls.authorized !== false &&
    check.tls.expiresOn &&
    check.tls.daysToExpiry != null &&
    check.tls.daysToExpiry <= 30 &&
    check.tls.state !== 'unknown'
  ) {
    currentTlsAction.push({
      what: check.tls.daysToExpiry < 0
        ? 'Investigate the currently observed expired TLS certificate'
        : 'Renew the currently observed TLS certificate before expiry',
      due: check.tls.expiresOn,
      days: check.tls.daysToExpiry,
    });
  }
  const availability = check.availability.statusCode
    ? `HTTP ${check.availability.statusCode}`
    : check.availability.ok ? 'responding' : 'availability unconfirmed';
  const tls = check.tls.expiresOn
    ? `TLS expires ${check.tls.expiresOn}`
    : 'TLS expiry unconfirmed';
  const headerSummary = check.availability.ok
    ? `${check.headerFindings.missing.length} headers absent on observed response`
    : 'header state unconfirmed';
  return {
    ...entity,
    oneLine: `${check.checkedDate} passive check: ${availability}; ${tls}; ${headerSummary}.`,
    tls: check.tls,
    headers: check.headers,
    emailAuth: check.emailAuth,
    urgentActions: currentTlsAction,
  };
}

export function actionTimeLabel(days: number): string {
  if (days < 0) return `expired ${Math.abs(days)}d ago`;
  if (days === 0) return 'expires today';
  return `${days}d to expiry`;
}

export function tierColor(tier: Tier): string {
  switch (tier) {
    case 'HIGH':
      return 'text-red-400';
    case 'MEDIUM':
      return 'text-amber-400';
    case 'LOW':
      return 'text-lime-400';
    case 'PROVISIONAL':
      return 's-fade italic';
  }
}

export function riskLabelColor(label: EntityReport['riskLabel']): string {
  switch (label) {
    case 'Critical':
      return 'text-red-400';
    case 'Elevated':
      return 'text-amber-400';
    case 'Watch':
      return 'text-yellow-300';
    case 'Normal':
      return 'text-lime-400';
  }
}
