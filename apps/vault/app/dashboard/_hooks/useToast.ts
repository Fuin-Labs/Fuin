"use client";

import { useContext } from "react";
import { ToastContext } from "../_providers/ToastProvider";

export function useToast() {
  return useContext(ToastContext);
}
