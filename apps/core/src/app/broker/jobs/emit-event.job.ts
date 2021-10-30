export const EMIT_EVENT = "EMIT_EVENT";

export interface EmitEventJob {
  pattern: string;
  payload: Record<string, unknown>;
}
