/**
 * Custom error classes for better error handling
 */

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class NetworkError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = "NetworkError";
  }
}

export class FileUploadError extends Error {
  constructor(
    message: string,
    public fileSize?: number,
    public fileType?: string
  ) {
    super(message);
    this.name = "FileUploadError";
  }
}

export class CameraError extends Error {
  constructor(message: string, public errorName?: string) {
    super(message);
    this.name = "CameraError";
  }
}
