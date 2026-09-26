import pino from 'pino'
import { writeToLogFile } from './fileWriter.ts'

export const logger = pino({
  browser: { asObject: true },
})

export interface AppLogger {
  info(msgOrObj: unknown, msg?: string): void
  warn(msgOrObj: unknown, msg?: string): void
  error(msgOrObj: unknown, msg?: string): void
  debug(msgOrObj: unknown, msg?: string): void
  child(bindings: { component: string }): AppLogger
}

function logWithFile(level: string, component: string, fn: (...args: any[]) => void, msgOrObj: unknown, msg?: string) {
  fn(msgOrObj, msg)
  const message = typeof msgOrObj === 'string' ? msgOrObj : msg ?? ''
  const extra = typeof msgOrObj === 'object' && msgOrObj !== null ? (msgOrObj as Record<string, unknown>) : undefined
  writeToLogFile(level, component, message, extra)
}

export function createComponentLogger(component: string): AppLogger {
  const child = logger.child({ component })

  return {
    info: (m, s) => logWithFile('INFO', component, child.info.bind(child), m, s),
    warn: (m, s) => logWithFile('WARN', component, child.warn.bind(child), m, s),
    error: (m, s) => logWithFile('ERROR', component, child.error.bind(child), m, s),
    debug: (m, s) => logWithFile('DEBUG', component, child.debug.bind(child), m, s),
    child: (bindings) => createComponentLogger(`${component}:${bindings.component}`),
  }
}
