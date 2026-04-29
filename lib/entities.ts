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
  postureScore: number; // 0-100, lower is worse
  postureLabel: 'Critical' | 'Elevated' | 'Watch' | 'Normal';
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

function daysUntil(due: string, from: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(due) || !/^\d{4}-\d{2}-\d{2}$/.test(from)) return null;
  const [dueYear, dueMonth, dueDay] = due.split('-').map(Number);
  const [fromYear, fromMonth, fromDay] = from.split('-').map(Number);
  const dueTime = Date.UTC(dueYear, dueMonth - 1, dueDay);
  const fromTime = Date.UTC(fromYear, fromMonth - 1, fromDay);
  return Math.ceil((dueTime - fromTime) / 86400000);
}

export function applyDailyCheck(entity: EntityReport, check: DailyEntityCheck | null): EntityReport {
  if (!check) return entity;
  return {
    ...entity,
    scanDate: check.checkedDate,
    tls: check.tls,
    headers: check.headers,
    emailAuth: check.emailAuth,
    urgentActions: entity.urgentActions.map((action) => {
      const days = daysUntil(action.due, check.checkedDate);
      return days == null ? action : { ...action, days };
    }),
  };
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

export function postureLabelColor(label: EntityReport['postureLabel']): string {
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
