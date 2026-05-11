import React from "react";
import { WalletProviders } from "../_providers/WalletProviders";

export default function SwarmLayout({ children }: { children: React.ReactNode }) {
  return <WalletProviders>{children}</WalletProviders>;
}
