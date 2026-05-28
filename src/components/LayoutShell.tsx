"use client";

import { usePathname } from "next/navigation";
import { Nav } from "@/components/Nav";

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isTvScreen = pathname.includes("/ecran");

  if (isTvScreen) {
    return <>{children}</>;
  }

  return (
    <>
      <Nav />
      <main>{children}</main>
    </>
  );
}
