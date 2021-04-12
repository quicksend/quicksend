export enum ApplicationScopes {
  COPY_FILES = "files:copy",
  DELETE_FILES = "files:delete",
  DOWNLOAD_FILES = "files:download",
  MOVE_FILES = "files:move",
  RENAME_FILES = "files:rename",
  SHARE_FILES = "files:share",
  UNSHARE_FILES = "files:unshare",
  UPLOAD_FILES = "files:upload",
  VIEW_FILES = "files:view",

  BROWSE_FOLDERS = "folders:browse",
  CREATE_FOLDERS = "folders:create",
  DELETE_FOLDERS = "folders:delete",
  MOVE_FOLDERS = "folders:move",
  RENAME_FOLDERS = "folders:rename",

  READ_PROFILE = "user:profile:read"
}
