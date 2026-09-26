const isNode =
  typeof (globalThis as { window?: unknown }).window === 'undefined' &&
  typeof globalThis !== 'undefined' &&
  Boolean((globalThis as unknown as { process?: { versions?: { node?: string } } }).process?.versions?.node)

export function writeToLogFile(level: string, component: string, msg: string, extra?: Record<string, unknown>): void {
  if (!isNode) return

  const fsModule = 'node:fs'
  const pathModule = 'node:path'

  import(/* @vite-ignore */ fsModule).then((fs) => {
    import(/* @vite-ignore */ pathModule).then((path) => {
      try {
        const logsDir = path.resolve('logs')
        if (!fs.existsSync(logsDir)) {
          fs.mkdirSync(logsDir, { recursive: true })
        }
        const logFile = path.join(logsDir, 'app.log')
        const line = JSON.stringify({
          timestamp: new Date().toISOString(),
          level,
          component,
          message: msg,
          ...extra,
        })
        fs.appendFileSync(logFile, line + '\n', 'utf-8')
      } catch {
        // silent fail
      }
    })
  }).catch(() => {})
}
