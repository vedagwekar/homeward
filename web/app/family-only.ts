"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { type Session, useSession } from "@/lib/store";

const HOME: Record<Session["role"], string> = { sponsor: "/", parent: "/parents", builder: "/builder", engineer: "/engineer" };

/**
 * The family's money pages are for the family. Anyone else who lands on one (a link, the browser's back
 * button) is sent to their own screen. Returns true while that is happening, so the page shows nothing.
 */
export function useFamilyOnly() {
  const session = useSession();
  const router = useRouter();
  const away = Boolean(session) && session!.role !== "sponsor";
  useEffect(() => {
    if (away) router.replace(HOME[session!.role]);
  }, [away, session, router]);
  return away;
}
