import { NextRequest, NextResponse } from "next/server";
import {
  createProgramRequest,
  getPendingRequestsByVault,
} from "@fuin-labs/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { vaultPda, delegatePda, programAddress, guardian, reason } = body;

    if (!vaultPda || !delegatePda || !programAddress || !guardian || !reason) {
      return NextResponse.json(
        { error: "Missing required fields: vaultPda, delegatePda, programAddress, guardian, reason" },
        { status: 400 }
      );
    }

    const request = await createProgramRequest({
      vaultPda,
      delegatePda,
      guardian,
      programAddress,
      reason,
    });

    return NextResponse.json({ id: request.id, status: request.status });
  } catch (err) {
    console.error("POST /api/program-requests error:", err);
    return NextResponse.json(
      { error: "Failed to create program request" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const vaultPda = req.nextUrl.searchParams.get("vaultPda");

    if (!vaultPda) {
      return NextResponse.json(
        { error: "Missing required query param: vaultPda" },
        { status: 400 }
      );
    }

    const requests = await getPendingRequestsByVault(vaultPda);
    return NextResponse.json(requests);
  } catch (err) {
    console.error("GET /api/program-requests error:", err);
    return NextResponse.json(
      { error: "Failed to fetch program requests" },
      { status: 500 }
    );
  }
}
