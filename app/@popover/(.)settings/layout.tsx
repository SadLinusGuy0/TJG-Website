"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import OneUiPopover from "../../components/OneUiPopover";

const POPOVER_LABELS: Record<string, string> = {
  "/settings": "Settings",
  "/settings/about": "About this site",
  "/settings/feature-flags": "Feature Flags",
};

export default function SettingsPopoverLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <OneUiPopover label={POPOVER_LABELS[pathname] ?? "Settings"}>
      {children}
    </OneUiPopover>
  );
}
