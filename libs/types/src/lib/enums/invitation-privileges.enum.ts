export enum InvitationPrivileges {
  READ_FILE_CONTENT = 1 << 1,
  WRITE_FILE_CONTENT = 1 << 2,

  READ_FILE_METADATA = 1 << 3,
  WRITE_FILE_METADTA = 1 << 4,

  READ_FILE_SHARING = 1 << 5,
  WRITE_FILE_SHARING = 1 << 6
}
