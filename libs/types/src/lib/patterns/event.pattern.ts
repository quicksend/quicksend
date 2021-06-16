export type EventPattern<
  ServiceName extends string,
  EntityName extends string,
  EventName extends string
> = `${ServiceName}.${EntityName}.${EventName}`;
