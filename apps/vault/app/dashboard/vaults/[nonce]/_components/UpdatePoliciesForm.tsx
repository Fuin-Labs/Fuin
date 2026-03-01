"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { PublicKey } from "@solana/web3.js";
import { GlassCard } from "../../../_components/ui/GlassCard";
import { Input } from "../../../_components/ui/Input";
import { TransactionButton } from "../../../_components/TransactionButton";
import { useFuinClient } from "../../../_hooks/useFuinClient";
import { COLORS } from "../../../_lib/constants";
import { useIsMobile } from "../../../_hooks/useMediaQuery";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

interface UpdatePoliciesFormProps {
  nonce: number;
  currentDailyCap: number;
  currentPerTxCap: number;
  currentAllowList: string[];
  currentDenyList: string[];
  onSuccess: () => void;
}

function isValidPubkey(addr: string): boolean {
  try {
    new PublicKey(addr);
    return true;
  } catch {
    return false;
  }
}

export function UpdatePoliciesForm({
  nonce,
  currentDailyCap,
  currentPerTxCap,
  currentAllowList,
  currentDenyList,
  onSuccess,
}: UpdatePoliciesFormProps) {
  const { client } = useFuinClient();
  const isMobile = useIsMobile();
  const [dailyCap, setDailyCap] = useState(String(currentDailyCap / LAMPORTS_PER_SOL));
  const [perTxCap, setPerTxCap] = useState(String(currentPerTxCap / LAMPORTS_PER_SOL));

  const [allowList, setAllowList] = useState<string[]>(currentAllowList);
  const [denyList, setDenyList] = useState<string[]>(currentDenyList);
  const [allowInput, setAllowInput] = useState("");
  const [denyInput, setDenyInput] = useState("");
  const [allowError, setAllowError] = useState("");
  const [denyError, setDenyError] = useState("");

  const addToList = (
    list: string[],
    setList: (l: string[]) => void,
    input: string,
    setInput: (s: string) => void,
    setError: (s: string) => void,
    max: number,
  ) => {
    const trimmed = input.trim();
    if (!trimmed) return;
    if (!isValidPubkey(trimmed)) {
      setError("Invalid public key");
      return;
    }
    if (list.includes(trimmed)) {
      setError("Already in list");
      return;
    }
    if (list.length >= max) {
      setError(`Max ${max} programs`);
      return;
    }
    setList([...list, trimmed]);
    setInput("");
    setError("");
  };

  const removeFromList = (list: string[], setList: (l: string[]) => void, addr: string) => {
    setList(list.filter((a) => a !== addr));
  };

  const listsChanged =
    JSON.stringify(allowList) !== JSON.stringify(currentAllowList) ||
    JSON.stringify(denyList) !== JSON.stringify(currentDenyList);

  const handleUpdate = async () => {
    if (!client) throw new Error("Client not ready");
    return client.updateVault(
      nonce,
      Number(dailyCap),
      Number(perTxCap),
      listsChanged ? allowList.map((a) => new PublicKey(a)) : undefined,
      listsChanged ? denyList.map((a) => new PublicKey(a)) : undefined,
    );
  };

  const addressStyle = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: "8px",
    padding: "8px 12px",
    fontSize: "0.8rem",
    fontFamily: "var(--font-geist-mono), monospace",
    color: COLORS.textSecondary,
  } as const;

  return (
    <GlassCard>
      <h3 style={{ color: COLORS.text, fontSize: "1rem", fontWeight: 700, margin: "0 0 16px" }}>
        Update Policies
      </h3>

      {/* Spending caps */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
        <Input
          label="Daily Cap (SOL)"
          value={dailyCap}
          onChange={setDailyCap}
          type="number"
        />
        <Input
          label="Per-Tx Cap (SOL)"
          value={perTxCap}
          onChange={setPerTxCap}
          type="number"
        />
      </div>

      {/* Allowed Programs */}
      <div style={{ marginBottom: "24px" }}>
        <label style={{ fontSize: "0.85rem", fontWeight: 600, color: COLORS.textSecondary, display: "block", marginBottom: "8px" }}>
          Allowed Programs ({allowList.length}/16)
        </label>
        {allowList.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginBottom: "8px" }}>
            {allowList.map((addr) => (
              <div key={addr} style={addressStyle}>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                  {addr}
                </span>
                <Trash2
                  size={14}
                  color={COLORS.red}
                  style={{ cursor: "pointer", flexShrink: 0, opacity: 0.7 }}
                  onClick={() => removeFromList(allowList, setAllowList, addr)}
                />
              </div>
            ))}
          </div>
        )}
        <div style={{ display: "flex", gap: "8px" }}>
          <div style={{ flex: 1 }}>
            <Input
              value={allowInput}
              onChange={(v) => { setAllowInput(v); setAllowError(""); }}
              placeholder="Program address..."
              hint={allowError || undefined}
            />
          </div>
          <button
            type="button"
            onClick={() => addToList(allowList, setAllowList, allowInput, setAllowInput, setAllowError, 16)}
            disabled={allowList.length >= 16}
            style={{
              alignSelf: "flex-start",
              marginTop: "2px",
              background: COLORS.emeraldSubtle,
              border: `1px solid ${COLORS.emeraldBorder}`,
              borderRadius: "10px",
              padding: "12px",
              cursor: allowList.length >= 16 ? "not-allowed" : "pointer",
              opacity: allowList.length >= 16 ? 0.4 : 1,
              display: "flex",
              alignItems: "center",
            }}
          >
            <Plus size={18} color={COLORS.emerald} />
          </button>
        </div>
      </div>

      {/* Denied Programs */}
      <div style={{ marginBottom: "24px" }}>
        <label style={{ fontSize: "0.85rem", fontWeight: 600, color: COLORS.textSecondary, display: "block", marginBottom: "8px" }}>
          Denied Programs ({denyList.length}/8)
        </label>
        {denyList.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginBottom: "8px" }}>
            {denyList.map((addr) => (
              <div key={addr} style={{ ...addressStyle, backgroundColor: COLORS.redSubtle }}>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                  {addr}
                </span>
                <Trash2
                  size={14}
                  color={COLORS.red}
                  style={{ cursor: "pointer", flexShrink: 0, opacity: 0.7 }}
                  onClick={() => removeFromList(denyList, setDenyList, addr)}
                />
              </div>
            ))}
          </div>
        )}
        <div style={{ display: "flex", gap: "8px" }}>
          <div style={{ flex: 1 }}>
            <Input
              value={denyInput}
              onChange={(v) => { setDenyInput(v); setDenyError(""); }}
              placeholder="Program address..."
              hint={denyError || undefined}
            />
          </div>
          <button
            type="button"
            onClick={() => addToList(denyList, setDenyList, denyInput, setDenyInput, setDenyError, 8)}
            disabled={denyList.length >= 8}
            style={{
              alignSelf: "flex-start",
              marginTop: "2px",
              background: COLORS.redSubtle,
              border: `1px solid ${COLORS.redBorder}`,
              borderRadius: "10px",
              padding: "12px",
              cursor: denyList.length >= 8 ? "not-allowed" : "pointer",
              opacity: denyList.length >= 8 ? 0.4 : 1,
              display: "flex",
              alignItems: "center",
            }}
          >
            <Plus size={18} color={COLORS.red} />
          </button>
        </div>
      </div>

      <TransactionButton
        label="Update Policies"
        loadingLabel="Updating..."
        onClick={handleUpdate}
        onSuccess={onSuccess}
        variant="secondary"
        fullWidth
      />
    </GlassCard>
  );
}
