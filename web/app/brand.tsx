"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { signIn, useSession } from "@/lib/store";
import { Wordmark } from "./logo";

/** The bar at the top of every screen. It also sends anyone who isn't signed in to the sign-in screen. */
export default function Brand() {
  const session = useSession();
  const path = usePathname();
  const router = useRouter();
  useEffect(() => {
    if (session === null && path !== "/signin") router.replace("/signin");
  }, [session, path, router]);
  if (path === "/signin") return null;
  return (
    <div className="brand">
      <Wordmark />
      <span>
        {session ? `${session.name}, testnet demo` : "Testnet demo"}
        {session && (
          <button type="button" onClick={() => signIn(null)}>
            Sign out
          </button>
        )}
      </span>
    </div>
  );
}
