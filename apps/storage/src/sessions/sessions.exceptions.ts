export class SessionsException extends Error {}

export class DownloadSessionNotFoundException extends SessionsException {
  constructor() {
    super("Download session cannot be found.");
  }
}

export class UploadSessionNotFoundException extends SessionsException {
  constructor() {
    super("Upload session cannot be found.");
  }
}
