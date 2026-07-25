import { useEffect, useState } from "react";

/**
 * Returns true only after the component has mounted on the client.
 * Essential for preventing React SSR hydration mismatches on client-only UI.
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
