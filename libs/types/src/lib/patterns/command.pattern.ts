export type CommandPattern<
  ServiceName extends string,
  EntityName extends string,
  CommandName extends string
> = `${ServiceName}.${EntityName}.${CommandName}`;
