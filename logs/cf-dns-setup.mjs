// Ad-hoc Cloudflare DNS setup for A-L-L-A-H.COM domain map per issue #40.
// Uses the Cloudflare stdio MCP token (scoped to moonwitness.biz.id zone only).

import fs from 'node:fs';

const CF_TOKEN = fs.readFileSync('C:/Users/bjo16/.config/cloudflare/token', 'utf8').trim();

// Base URL for Cloudflare API v4
const CF_API = 'https://api.cloudflare.com/client/v4';

// Helper: perform a Cloudflare API call; returns result or throws
async function cfFetch(urlString, options = {}) {
  const url = new URL(urlString, CF_API);
  const res = await fetch(url, {
    method: options.method || 'GET',
    headers: {
      Authorization: `Bearer ${CF_TOKEN}`,
      'Content-Type': 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }
  if (!data.success) {
    const msg = data.message || data.raw || `HTTP ${res.status}`;
    throw new Error(`CF ${options.method || 'GET'} ${url.pathname}: ${msg}`);
  }
  return data.result;
}

// Zone ID for moonwitness.biz.id (verified from earlier inspection)
const ZONE_ID = '0a35a11a5cbf0841d0ec4f55e360c475';

// Canonical domain map from issue #40 (verified against source)
// These are the short hostnames that should A-record → the Coolify server IP.
const SHORT_HOSTNAMES = [
  'hq.a-l-l-a-h.com',
  'id.a-l-l-a-h.com',
  'jizz.a-l-l-a-h.com',
  'sky.a-l-l-a-h.com',
  'my.e-isp.id',
  'ops.e-isp.id',
  'dock.a-l-l-a-h.com',
];

// The apex domains (a-l-l-a-h.com, e-isp.id) are OUTSIDE this token's zone scope.
// They require a separate Cloudflare account or registrar-level DNS changes.
const SERVER_IP = '163.61.134.104'; // Coolify server IP (verified earlier)
const RECORD_TTL = 300;
const PROXIED = true; // Cloudflare proxy

async function main() {
  console.log('=== Cloudflare DNS setup ===');
  console.log(`Zone: ${ZONE_ID}`);
  console.log(`Target IP: ${SERVER_IP}\n`);

  // 1) List existing A records in this zone (GET with full URL)
  console.log('--- Step 1: List existing A records ---');
  const existingRecords = await cfFetch(`/zones/${ZONE_ID}/dns_records?type=A`);
  const existingNames = new Set(existingRecords.map(r => r.name));
  console.log(`Found ${existingRecords.length} existing A records`);
  for (const r of existingRecords) {
    console.log(`  ${r.type} ${r.name} → ${r.content} proxied=${r.proxied}`);
  }

  // 2) Add/update A records for short hostnames
  console.log('\n--- Step 2: Add/update A records for short hostnames ---');
  for (const hostname of SHORT_HOSTNAMES) {
    const already = existingRecords.find(r => r.name === hostname && r.type === 'A');
    if (already) {
      if (already.content !== SERVER_IP) {
        await cfFetch(`/zones/${ZONE_ID}/dns_records/${already.id}`, {
          method: 'PATCH',
          body: { type: 'A', name: hostname, content: SERVER_IP, ttl: RECORD_TTL, proxied: PROXIED },
        });
        console.log(`  ↻ Updated ${hostname} → ${SERVER_IP} (proxied)`);
      } else {
        console.log(`  ✓ ${hostname} already → ${SERVER_IP}`);
      }
    } else {
      await cfFetch(`/zones/${ZONE_ID}/dns_records`, {
        method: 'POST',
        body: { type: 'A', name: hostname, content: SERVER_IP, ttl: RECORD_TTL, proxied: PROXIED },
      });
      console.log(`  + Created ${hostname} → ${SERVER_IP} (proxied)`);
    }
  }

  // 3) Summary
  console.log('\n--- Step 3: Summary ---');
  console.log('Records created/updated:');
  for (const hostname of SHORT_HOSTNAMES) {
    const r = existingRecords.find(x => x.name === hostname && x.type === 'A');
    console.log(`  - ${hostname} → ${r ? r.content : SERVER_IP} (proxied=${r ? r.proxied : PROXIED})`);
  }
  console.log('\n⚠️  Apex domains a-l-l-a-h.com and e-isp.id are OUTSIDE this token zone scope.');
  console.log('   They require a separate Cloudflare account or registrar-level DNS changes.');
  console.log('\nAfter these DNS changes, Coolify can route Traefik to these hosts via docker_compose_domains.');
}

main().catch(e => { console.error(e.message); process.exit(1); });