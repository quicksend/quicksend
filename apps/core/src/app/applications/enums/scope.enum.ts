export enum Scope {
  DELETE_FILE_PERMANENTLY = "files:content:delete",

  READ_FILE_CONTENT = "files:content:read",
  WRITE_FILE_CONTENT = "files:content:write",

  READ_FILE_METADATA = "files:metadata:read",
  WRITE_FILE_METADATA = "files:metadata:write",

  READ_FILE_SHARING = "files:sharing:read",
  WRITE_FILE_SHARING = "files:sharing:write",

  READ_PROFILE = "profile:read",
  WRITE_PROFILE = "profile:write"
}
