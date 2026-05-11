const V2_ERROR_HINTS: Array<{ match: RegExp; msg: string }> = [
  { match: /IntentRevoked/i, msg: "Intent has been revoked by the user." },
  { match: /IntentExpired/i, msg: "Intent has expired (past expires_at)." },
  { match: /IntentBudgetExceeded/i, msg: "Action would exceed the intent's remaining budget." },
  { match: /AgentMismatch/i, msg: "Signer is not this intent's authorized agent." },
  { match: /UserMismatch/i, msg: "Ancestor chain has a user mismatch — chain is corrupt or wrong intent passed." },
  { match: /PredicateDexViolation/i, msg: "Action targets a program not in the predicate's allowed-DEX list." },
  { match: /PredicateTimeViolation/i, msg: "Current time is outside the predicate's allowed time window." },
  { match: /PredicatePriceViolation/i, msg: "Token price is above the predicate's USD threshold." },
  { match: /PredicateReadOnlyViolation/i, msg: "Predicate is read-only — no spend actions allowed." },
  { match: /ActionUnsupported/i, msg: "Action ix is not a recognized SPL transfer or Jupiter v6 route." },
  { match: /ActionParseFailed/i, msg: "Action ix could not be parsed by the on-chain descriptor parser." },
  { match: /InvalidActionIndex/i, msg: "verify_authorizes target_ix_index points outside the transaction." },
  { match: /AncestorChainTooShort/i, msg: "Not enough ancestor PDAs passed in remaining_accounts." },
];

export interface RejectionInfo {
  rejected: boolean;
  reason: string;
  raw: string;
}

export function explainError(error: unknown): RejectionInfo {
  const raw = (error as { message?: string })?.message ?? String(error);
  for (const { match, msg } of V2_ERROR_HINTS) {
    if (match.test(raw)) {
      return { rejected: true, reason: msg, raw: raw.split("\n")[0] ?? raw };
    }
  }
  return { rejected: false, reason: raw.split("\n")[0] ?? raw, raw };
}
