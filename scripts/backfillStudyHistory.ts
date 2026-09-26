import { execFileSync } from 'node:child_process'

// After deploying the archive-capable Worker, queue older known DO sessions.
// KV metadata discovers IDs only; answer data is always loaded from DO.
const origin = new URL(process.argv[2] ?? 'https://kagemori.qus0in.workers.dev')
if (origin.protocol !== 'https:' || origin.pathname !== '/' || origin.search || origin.hash) {
  throw new Error('Provide an HTTPS origin without a path, query, or fragment')
}
const raw = execFileSync('pnpm', ['exec', 'wrangler', 'kv', 'key', 'list',
  '--binding', 'KAGEMORI_KV', '--prefix', 'session:', '--remote'], { encoding: 'utf8' })
const keys = JSON.parse(raw) as { name: string }[]
let queued = 0
let missing = 0
let failed = 0
for (const key of keys) {
  const id = key.name.slice('session:'.length)
  try {
    const response = await fetch(new URL(`/api/study/session/${encodeURIComponent(id)}/next`, origin), {
      signal: AbortSignal.timeout(15000),
    })
    if (response.ok) queued++
    else if (response.status === 404) missing++
    else failed++
    await response.body?.cancel()
  } catch { failed++ }
}
console.log(JSON.stringify({ discovered: keys.length, queued, missing, failed }))
if (failed) process.exitCode = 1
