"use client";

import { useEffect, useState } from "react";

// Public pages stay static, so they don't ask the server who is signed in.
// This only looks for Supabase's session cookie to choose what to show; every
// action and every /portal page still checks the session properly on the server.
export function useSignedIn() {
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    setSignedIn(/(?:^|;\s*)sb-[^=]+-auth-token(?:\.\d+)?=/.test(document.cookie));
  }, []);
  return signedIn;
}
