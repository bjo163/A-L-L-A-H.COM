// Ad-hoc read-only Cloudflare DNS inspection (same API surface as the cloudflare MCP wrapper).
import fs from 'node:fs';

const BASE = 'https://api.cloudflare.com/client/v4';
const token = fs.readFileSync('C:/Users/bjo16/.config/cloudflare/token', 'utf8').trim();

async function api(method, path, body) {
  const res = await fetch(new URL(BASE + path), {
    method,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(async () => ({ raw: await res.text() }));
  if (!res.ok || data.success === false) {
    const errs = Array.isArray(data.errors) ? JSON.stringify(data.errors) : String(data.raw || '').slice(0, 200);
    throw new Error(`HTTP ${res.status} ${method} ${path}: ${errs}`);
  }
  return data.result;
}

const cmd = process.argv[2];
if (cmd === 'verify') {
  console.log(JSON.stringify(await api('GET', '/user/tokens/verify')));
} else if (cmd === 'zones') {
  for (const z of await api('GET', '/zones?per_page=50')) {
    console.log(`${z.name}\t${z.id}\t${z.status}\taccount=${z.account?.id}`);
  }
} else if (cmd === 'records') {
  const zoneId = process.argv[3];
  for (const r of await api('GET', `/zones/${zoneId}/dns_records?per_page=100`)) {
    console.log(`${r.type}\t${r.name}\t-> ${r.content}\tproxied=${r.proxied}`);
  }
} else if (cmd === 'add') {
  const [, , zoneId, type, name, content, ttl] = process.argv;
  const r = await api('POST', `/zones/${zoneId}/dns_records`, { type, name, content, ttl: Number(ttl || 1) });
  console.log(JSON.stringify({ id: r.id, name: r.name, content: r.content, proxied: r.proxied }));
}
