"use client";

import { useState } from "react";
import { Shield, ShieldOff } from "lucide-react";
import { GlassCard } from "../../../_components/ui/GlassCard";
import { Button } from "../../../_components/ui/Button";
import { Modal } from "../../../_components/ui/Modal";
import { useFuinClient } from "../../../_hooks/useFuinClient";
import { useToast } from "../../../_hooks/useToast";
import { COLORS } from "../../../_lib/constants";

interface FreezeToggleProps {
  nonce: number;
  isFrozen: boolean;
  onSuccess: () => void;
}

export function FreezeToggle({ nonce, isFrozen, onSuccess }: FreezeToggleProps) {
  const { client } = useFuinClient();
  const { addToast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!client) return;
    setLoading(true);
    try {
      if (isFrozen) {
        await client.unfreezeVault(nonce);
        addToast("Vault unfrozen", "success");
      } else {
        await client.freezeVault(nonce);
        addToast("Vault frozen — all operations halted", "success");
      }
      onSuccess();
    } catch (e: any) {
      addToast(e.message?.slice(0, 100) || "Failed", "error");
    }
    setLoading(false);
    setShowModal(false);
  };

  return (
    <>
      <GlassCard style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }} padding="20px 28px">
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {isFrozen ? <ShieldOff size={20} color={COLORS.blue} /> : <Shield size={20} color={COLORS.red} />}
          <div>
            <span style={{ color: COLORS.text, fontWeight: 600, fontSize: "0.95rem", display: "block" }}>
              {isFrozen ? "Vault is Frozen" : "Emergency Freeze"}
            </span>
            <span style={{ color: COLORS.textDim, fontSize: "0.8rem" }}>
              {isFrozen ? "Unfreeze to resume operations" : "Halt all delegate operations immediately"}
            </span>
          </div>
        </div>
        <Button
          variant={isFrozen ? "primary" : "danger"}
          size="sm"
          onClick={() => setShowModal(true)}
        >
          {isFrozen ? "Unfreeze" : "Freeze"}
        </Button>
      </GlassCard>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleConfirm}
        title={isFrozen ? "Unfreeze Vault?" : "Freeze Vault?"}
        confirmLabel={isFrozen ? "Unfreeze" : "Freeze"}
        confirmVariant={isFrozen ? "primary" : "danger"}
        loading={loading}
      >
        {isFrozen
          ? "This will resume all delegate operations. Delegates will be able to execute transactions again."
          : "This will immediately halt all delegate transactions. You can unfreeze at any time."}
      </Modal>
    </>
  );
}
