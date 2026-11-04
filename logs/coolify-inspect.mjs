// Ad-hoc read-only Coolify inspection (same API surface as the coolify MCP wrapper).
import fs from 'node:fs';

const BASE = 'https://apps.mycocolink.com';
const token = fs.readFileSync('C:/Users/bjo16/.config/coolify/token', 'utf8').trim();

async function api(method, path, opts = {}) {
  const url = new URL(`/api/v1${path}`, BASE);
  for (const [k, v] of Object.entries(opts.query || {})) {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
  }
  const res = await fetch(url, {
    method,
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', ...(opts.body ? { 'Content-Type': 'application/json' } : {}) },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const text = await res.text();
  let data; try { data = JSON.parse(text); } catch { data = text; }
  if (!res.ok) throw new Error(`HTTP ${res.status} ${path}: ${typeof data === 'string' ? data.slice(0, 200) : data.message}`);
  return data;
}

const FIELDS = ['uuid', 'name', 'status', 'fqdn', 'git_repository', 'git_branch', 'git_commit_sha', 'docker_compose_location', 'created_at', 'updated_at'];

if (process.argv[2] === 'apps') {
  const rows = await api('GET', '/applications');
  for (const r of rows) {
    const o = {};
    for (const f of FIELDS) if (r[f] !== undefined && r[f] !== null && r[f] !== '') o[f] = r[f];
    o.domains = r.docker_compose_domains;
    console.log(JSON.stringify(o));
  }
} else if (process.argv[2] === 'app') {
  const r = await api('GET', `/applications/${process.argv[3]}`);
  const out = {};
  for (const f of [...FIELDS, 'docker_compose_domains', 'envs', 'server_id', 'ports_exposed', 'raw_compose'])
    if (r[f] !== undefined) out[f] = r[f];
  // never dump sentinel_token or raw payloads
  console.log(JSON.stringify(out, null, 1).slice(0, 8000));
} else if (process.argv[2] === 'deploy') {
  const r = await api('POST', '/deploy', { query: { uuid: process.argv[3], force: 'true' } });
  console.log(JSON.stringify(r));
} else if (process.argv[2] === 'deployment') {
  const r = await api('GET', `/deployments/${process.argv[3]}`);
  console.log(JSON.stringify({ status: r.status, commit: r.commit, created_at: r.created_at, finished_at: r.finished_at, application_name: r.application_name }, null, 1));
} else if (process.argv[2] === 'envs') {
  const rows = await api('GET', `/applications/${process.argv[3]}/envs`);
  for (const e of rows) console.log(`${e.key} = ${e.value ? '(set)' : '(EMPTY)'} preview=${e.is_preview}`);
} else if (process.argv[2] === 'compose') {
  const r = await api('GET', `/applications/${process.argv[3]}`);
  console.log(JSON.stringify({
    git_branch: r.git_branch, git_commit_sha: r.git_commit_sha,
    docker_compose_location: r.docker_compose_location,
    docker_compose_domains: r.docker_compose_domains,
    raw_compose: r.docker_compose_location,
    domains: r.domains,
  }, null, 1));
  const raw = String(r.docker_compose_raw || '');
  // print only non-secret structural lines
  for (const line of raw.split('\n')) {
    if (/SECRET|KEY|TOKEN|PASSWORD/i.test(line)) { console.log('  <redacted:', line.trim().split('=')[0], '>'); continue; }
    console.log(line);
  }
} else if (process.argv[2] === 'serverdocker') {
  const servers = await api('GET', '/servers');
  const s = servers[0];
  const d = await api('GET', `/servers/${s.uuid}/docker`);
  const apps = (d.applications || []).map(a => ({ name: a.Name, state: a.State, status: a.Status, ports: a.Ports }));
  console.log(JSON.stringify({ server: s.name || s.ip, apps }, null, 1));
}
