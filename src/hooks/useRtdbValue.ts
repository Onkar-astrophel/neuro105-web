"use client";

import { useEffect, useState } from "react";
import { onValue, ref } from "firebase/database";
import { db } from "@/lib/firebase";
import { useAuth } from "./useAuth";

// Subscribes to a Realtime Database path and returns its live value.
// Only subscribes once signed in, since RTDB rules require auth.
export function useRtdbValue<T>(path: string): { data: T | null; loading: boolean } {
  const { user } = useAuth();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setData(null);
      setLoading(true);
      return;
    }
    setLoading(true);
    const unsub = onValue(
      ref(db, path),
      (snap) => {
        setData(snap.val());
        setLoading(false);
      },
      () => setLoading(false)
    );
    return unsub;
  }, [path, user]);

  return { data, loading };
}
