export class ParseError extends Error {
  readonly code = 'PARSE_ERROR';
  constructor(
    message: string,
    readonly field?: string,
  ) {
    super(message);
    this.name = 'ParseError';
  }
}

export class ValidationError extends Error {
  readonly code = 'VALIDATION_ERROR';
  constructor(
    message: string,
    readonly field?: string,
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends Error {
  readonly code = 'NETWORK_ERROR';
  constructor(
    message: string,
    readonly statusCode?: number,
  ) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class PermissionError extends Error {
  readonly code = 'PERMISSION_ERROR';
  constructor(message: string) {
    super(message);
    this.name = 'PermissionError';
  }
}
