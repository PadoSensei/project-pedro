export class ContentValidationError extends Error {
  constructor(public readonly filePath: string, message: string) {
    super(`Invalid content in "${filePath}": ${message}`);
    this.name = "ContentValidationError";
  }
}
