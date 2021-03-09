export enum ApplicationScopesEnum {
  READ_FILE_CONTENTS = "files:content:read", // download files
  WRITE_FILE_CONTENTS = "files:content:write", // upload files

  READ_FILE_METADATA = "files:metadata:read", // view file metadata
  WRITE_FILE_METADATA = "files:metadata:write", // copy, delete, move, or rename files

  READ_FOLDER_METADATA = "folders:metadata:read", // view folder metadata
  WRITE_FOLDER_METADATA = "folders:metadata:write", // delete, move or rename folders

  READ_USER_PROFILE = "user:profile:read", // read basic user info like email, profile picture
  WRITE_USER_PROFILE = "user:profile:write" // change profile picture
}
