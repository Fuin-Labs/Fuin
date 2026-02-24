"use client";

import { createContext, useEffect, useState, type ReactNode } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { FuinClient } from "@fuin/sdk";
import type { PublicKey, Connection } from "@solana/web3.js";

export interface FuinContextValue {
  client: FuinClient | null;
  connection: Connection | null;
  publicKey: PublicKey | null;
  connected: boolean;
}

export const FuinContext = createContext<FuinContextValue>({
  client: null,
  connection: null,
  publicKey: null,
  connected: false,
});

export function FuinProvider({ children }: { children: ReactNode }) {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [client, setClient] = useState<FuinClient | null>(null);

  useEffect(() => {
    if (wallet.connected && wallet.publicKey && wallet.signTransaction && wallet.signAllTransactions) {
      const providerWallet = {
        publicKey: wallet.publicKey,
        signTransaction: wallet.signTransaction,
        signAllTransactions: wallet.signAllTransactions,
      } as any;
      setClient(new FuinClient(connection, providerWallet));
    } else {
      setClient(null);
    }
  }, [wallet.connected, wallet.publicKey, connection]);

  return (
    <FuinContext.Provider
      value={{
        client,
        connection,
        publicKey: wallet.publicKey ?? null,
        connected: wallet.connected,
      }}
    >
      {children}
    </FuinContext.Provider>
  );
}
