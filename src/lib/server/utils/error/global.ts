export interface IApiErrorResponse {
  success: false;
  error: {
    code: string | number;
    message: string;
  };
}

export class GlobalApiError extends Error {
  public constructor(
    public code: string | number,
    message: string,
  ) {
    super(message);
    this.name = 'GlobalApiError';
  }

  public toResponse(): IApiErrorResponse {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
      }
    };
  }
}

export function createApiErrorResponse(
  code: string | number,
  message: string,
): IApiErrorResponse {
  return new GlobalApiError(code, message).toResponse();
}
