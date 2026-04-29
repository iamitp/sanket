# Sanket

Public passive-reconnaissance scorecard on the Indian Ministry of Petroleum & Natural Gas digital estate. Civic-tech transparency, daily passive refresh.

Sibling project to [Sanjaya](https://sanjaya.amitpatnaik.com) (fuel-pricing transparency on the same portfolio). Sanjaya narrates; Sanket warns.

## Setup

```bash
npm install
npm run dev
# open http://localhost:3000
```

## Build static export

```bash
npm run build
# output → ./out
```

## Deploy to Vercel

```bash
npx vercel --prod
```

Then add the domain `sanket.amitpatnaik.com` in the Vercel project settings (DNS via Cloudflare or Vercel-managed).

## Data

The baseline register is held in `data/entities/*.json`. Daily passive refreshes write `data/daily-check.json` and the app overlays those fresh TLS, header, and email-auth states without overwriting the heavier baseline/Phase 2 assessment.

Run a fresh passive check:

```bash
npm run checks:fresh
```

The scheduled refresh is `.github/workflows/sanket-daily.yml`, running daily at 09:00 IST. If the data changes, GitHub Actions commits the refreshed `data/` output back to `main`, which triggers the Vercel production deployment.

The legacy register snapshot is at `data/register.json`. The shape is:

- `meta` — tagline, scan date, entity count, methodology footnote
- `urgent` — items requiring action within 21 days (HTML strings, rendered with `dangerouslySetInnerHTML`)
- `crossCutting` — portfolio-level findings
- `entities` — array of `{ name, domain, tier, findings }`. Tier is `HIGH | MEDIUM | LOW | PROVISIONAL`.

## Scope and authorisation

Phase 1 (passive) is unconditional — all checks are reproducible by any visitor with `curl`, `dig`, and `openssl`. The daily job only runs DNS TXT lookups, a TLS certificate handshake, and a single HTTPS response-header request per entity. Phase 2 (active vulnerability scanning) is gated on Ministry-letter authorisation and per-entity intimation to CMD and CISO; not enabled by default.

Subdomain-takeover candidates are identified passively but withheld from public publication for 90 days under industry-standard responsible-disclosure practice (notification to CERT-In and the affected CISO, then publication).

## Methodology

Passive reconnaissance only. Sources:

- Certificate transparency logs via crt.sh
- Public DNS queries via `dig`
- HTTP header inspection via `curl -sI`
- Public search-engine queries (Google site-restricted dorks)
- Public breach databases (Have I Been Pwned, IntelX surface)
- Public infrastructure indexes (Shodan, Censys)
- Public web archives (Wayback Machine)

No traffic generated against scanned entity infrastructure beyond what an ordinary visitor's browser produces. No port scanning. No vulnerability scanners. No authentication probing. No fuzzing.

## License and attribution

Methodology is open. Data is public. Republish with attribution.
