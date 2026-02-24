"use client";

import { useState } from "react";
import { Button } from "./ui/Button";
import { Spinner } from "./ui/Spinner";
import { useToast } from "../_hooks/useToast";

interface TransactionButtonProps {
  label: string;
  loadingLabel?: string;
  onClick: () => Promise<string | void>;
  onSuccess?: () => void;
  variant?: "primary" | "secondary" | "danger";
  fullWidth?: boolean;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
}

export function TransactionButton({
  label,
  loadingLabel,
  onClick,
  onSuccess,
  variant = "primary",
  fullWidth,
  size = "md",
  disabled,
}: TransactionButtonProps) {
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleClick = async () => {
    setLoading(true);
    try {
      const sig = await onClick();
      addToast(sig ? `Transaction confirmed: ${sig.slice(0, 8)}...` : "Transaction confirmed", "success");
      onSuccess?.();
    } catch (e: any) {
      const msg = e?.message || "Transaction failed";
      // Parse Anchor error if possible
      const anchorMatch = msg.match(/Error Code: (\w+)/);
      addToast(anchorMatch ? anchorMatch[1] : msg.slice(0, 120), "error");
    }
    setLoading(false);
  };

  return (
    <Button
      variant={variant}
      onClick={handleClick}
      disabled={disabled || loading}
      fullWidth={fullWidth}
      size={size}
    >
      {loading ? (
        <span style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
          <Spinner size={16} />
          {loadingLabel || "Processing..."}
        </span>
      ) : (
        label
      )}
    </Button>
  );
}
