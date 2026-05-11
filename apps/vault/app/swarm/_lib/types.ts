export type StepStatus = "pending" | "running" | "ok" | "failed";

export type StepId =
  | "fund"
  | "sign-root"
  | "derive-research"
  | "derive-execute"
  | "derive-audit"
  | "rogue-reject";

export interface StepBase {
  id: StepId;
  status: StepStatus;
  error?: string;
}

export interface FundEvent extends StepBase {
  id: "fund";
  sig?: string;
}

export interface SignRootEvent extends StepBase {
  id: "sign-root";
  pda?: string;
  sig?: string;
  scope?: string;
}

export interface DeriveChildEvent extends StepBase {
  id: "derive-research" | "derive-execute" | "derive-audit";
  pda?: string;
  sig?: string;
  scope?: string;
}

export interface RogueRejectEvent extends StepBase {
  id: "rogue-reject";
  reason?: string;
}

export type StepEvent =
  | FundEvent
  | SignRootEvent
  | DeriveChildEvent
  | RogueRejectEvent;

export interface SwarmRunResult {
  rootPda: string;
}
