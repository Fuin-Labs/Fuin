"use client";

import { useContext } from "react";
import { FuinContext } from "../_providers/FuinProvider";

export function useFuinClient() {
  return useContext(FuinContext);
}
