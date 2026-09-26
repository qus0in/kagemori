export class StorageUnavailableError extends Error {
  public readonly service: string
  constructor(service: string, options?: ErrorOptions) {
    super(`${service} temporarily unavailable`, options)
    this.service = service
    this.name = 'StorageUnavailableError'
  }
}
export class SessionConflictError extends Error {
  constructor() {
    super('Session changed; reload before retrying')
    this.name = 'SessionConflictError'
  }
}
