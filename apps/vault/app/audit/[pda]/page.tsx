import React from "react";
import { AuditView } from "../components/AuditView";

type Params = { params: Promise<{ pda: string }> };

export default async function AuditPage({ params }: Params) {
  const { pda } = await params;
  return <AuditView initialPda={pda} />;
}

export const dynamic = "force-dynamic";
