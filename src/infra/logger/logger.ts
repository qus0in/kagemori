import pino from 'pino'

const isNode =
  typeof (globalThis as { window?: unknown }).window === 'undefined' &&
  typeof globalThis !== 'undefined' &&
  Boolean((globalThis as unknown as { process?: { versions?: { node?: string } } }).process?.versions?.node)

function writeToLogFile(level: string, component: string, msg: string, extra?: Record<string, unknown>) {
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

export const logger = pino({
  browser: {
    asObject: true,
  },
})

export interface AppLogger {
  info(msgOrObj: unknown, msg?: string): void
  warn(msgOrObj: unknown, msg?: string): void
  error(msgOrObj: unknown, msg?: string): void
  debug(msgOrObj: unknown, msg?: string): void
  child(bindings: { component: string }): AppLogger
}

export function createComponentLogger(component: string): AppLogger {
  const child = logger.child({ component })

  return {
    info(msgOrObj: unknown, msg?: string) {
      child.info(msgOrObj as any, msg)
      const message = typeof msgOrObj === 'string' ? msgOrObj : msg ?? ''
      const extra = typeof msgOrObj === 'object' && msgOrObj !== null ? (msgOrObj as Record<string, unknown>) : undefined
      writeToLogFile('INFO', component, message, extra)
    },
    warn(msgOrObj: unknown, msg?: string) {
      child.warn(msgOrObj as any, msg)
      const message = typeof msgOrObj === 'string' ? msgOrObj : msg ?? ''
      const extra = typeof msgOrObj === 'object' && msgOrObj !== null ? (msgOrObj as Record<string, unknown>) : undefined
      writeToLogFile('WARN', component, message, extra)
    },
    error(msgOrObj: unknown, msg?: string) {
      child.error(msgOrObj as any, msg)
      const message = typeof msgOrObj === 'string' ? msgOrObj : msg ?? ''
      const extra = typeof msgOrObj === 'object' && msgOrObj !== null ? (msgOrObj as Record<string, unknown>) : undefined
      writeToLogFile('ERROR', component, message, extra)
    },
    debug(msgOrObj: unknown, msg?: string) {
      child.debug(msgOrObj as any, msg)
      const message = typeof msgOrObj === 'string' ? msgOrObj : msg ?? ''
      const extra = typeof msgOrObj === 'object' && msgOrObj !== null ? (msgOrObj as Record<string, unknown>) : undefined
      writeToLogFile('DEBUG', component, message, extra)
    },
    child(bindings: { component: string }) {
      return createComponentLogger(`${component}:${bindings.component}`)
    },
  }
}
