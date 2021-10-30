export const COPY_ITEM = "COPY_ITEM";

export interface CopyItemJob {
  destination: string;
  name?: string;
  source: string;
}
