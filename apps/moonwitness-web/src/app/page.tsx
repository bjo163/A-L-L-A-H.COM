import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur px-8 py-5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-bold text-emerald-400">
            MW
          </div>
          <span className="font-semibold text-lg tracking-wide">A-L-L-A-H.COM</span>
          <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            MoonWitness Unified
          </span>
        </div>
        <nav className="flex space-x-6 text-sm text-slate-400">
          <Link href="#router" className="hover:text-slate-200 transition">LLM Router</Link>
          <Link href="#storage" className="hover:text-slate-200 transition">Echolog Storage</Link>
          <Link href="#sdui" className="hover:text-slate-200 transition">Odoo SDUI</Link>
          <Link href="#architecture" className="hover:text-slate-200 transition">Architecture</Link>
        </nav>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto p-8 space-y-12">
        <section className="text-center py-12 space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 bg-clip-text text-transparent">
            A-L-L-A-H Command Center & AI Gateway
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-base md:text-lg">
            High-performance developer platform powered by Rust, Odoo-style model OS, 
            Echolog content-addressed storage, and intelligent low-latency LLM Router.
          </p>
        </section>

        <section id="router" className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="text-emerald-400 font-semibold text-lg flex items-center justify-between">
              <span>Smart LLM Router</span>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">Active</span>
            </div>
            <p className="text-slate-400 text-sm">
              OpenAI-compatible endpoint at <code className="text-emerald-300 text-xs bg-slate-800 px-1 py-0.5 rounded">/v1/chat/completions</code> with multi-tier fallback, cost optimization, and exact prompt caching.
            </p>
            <div className="text-xs text-slate-500">Latency: &lt; 2ms proxy overhead</div>
          </div>

          <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="text-sky-400 font-semibold text-lg flex items-center justify-between">
              <span>Echolog Storage</span>
              <span className="text-xs px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/20">Content-Addressed</span>
            </div>
            <p className="text-slate-400 text-sm">
              SHA-256 digest addressable object store. Write-once deduplication, retention holds, and dual REST/S3 SigV4 surfaces.
            </p>
            <div className="text-xs text-slate-500">Zero-byte duplicate uploads</div>
          </div>

          <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="text-amber-400 font-semibold text-lg flex items-center justify-between">
              <span>Odoo Server-Driven UI</span>
              <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">Modular Addons</span>
            </div>
            <p className="text-slate-400 text-sm">
              Model engine featuring <code className="text-amber-300 text-xs">res.company</code>, <code className="text-amber-300 text-xs">res.partner</code>, and dynamic Tree/Form/Kanban metadata.
            </p>
            <div className="text-xs text-slate-500">Endpoint: /v1/sdui/:model/:view</div>
          </div>
        </section>

        <section id="sdui" className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
          <h2 className="text-xl font-bold text-slate-200">Live Server-Driven UI Preview (res.partner)</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300 border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Role / Scope</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                <tr>
                  <td className="py-3 px-4 font-medium text-slate-100">Rocksoul Master Developer</td>
                  <td className="py-3 px-4 text-slate-400">Root Admin</td>
                  <td className="py-3 px-4"><span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">Active</span></td>
                  <td className="py-3 px-4 text-slate-400">2026-11-03</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-slate-100">MoonWitness AI Agent Mesh</td>
                  <td className="py-3 px-4 text-slate-400">Autonomous Worker</td>
                  <td className="py-3 px-4"><span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">Active</span></td>
                  <td className="py-3 px-4 text-slate-400">2026-11-03</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-800 px-8 py-4 text-center text-xs text-slate-500">
        A-L-L-A-H.COM · MoonWitness Platform Ecosystem · Low-Overhead Autonomous AI Gateway
      </footer>
    </div>
  );
}
