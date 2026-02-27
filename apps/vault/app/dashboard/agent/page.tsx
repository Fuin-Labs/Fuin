"use client";

import { motion } from "framer-motion";
import { Bot, Key } from "lucide-react";
import { useFuinClient } from "../_hooks/useFuinClient";
import { useDelegatesByAuthority } from "../_hooks/useDelegates";
import { useIsMobile } from "../_hooks/useMediaQuery";
import { Spinner } from "../_components/ui/Spinner";
import { EmptyState } from "../_components/ui/EmptyState";
import { DelegateDetailView } from "./_components/DelegateDetailView";
import { COLORS } from "../_lib/constants";

export default function AgentPage() {
  const { connected } = useFuinClient();
  const { delegates, loading } = useDelegatesByAuthority();
  const isMobile = useIsMobile();

  if (!connected) {
    return (
      <EmptyState
        icon={<Bot size={48} color={COLORS.textDim} />}
        title="Connect Your Wallet"
        description="Connect the wallet that was issued a delegate key to view your permissions and limits."
      />
    );
  }

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", paddingTop: "80px" }}>
        <Spinner size={32} />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ width: "100%", maxWidth: "1200px", margin: "0 auto" }}
    >
      

      {delegates.length === 0 ? (
        <EmptyState
          icon={<Key size={40} color={COLORS.textDim} />}
          title="No Delegate Keys"
          description="No delegate keys have been issued to this wallet. Ask a guardian to issue one from their vault."
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {delegates.map((d) => (
            <DelegateDetailView key={d.publicKey.toBase58()} delegate={d} />
          ))}
        </div>
      )}
    </motion.div>
  );
}
