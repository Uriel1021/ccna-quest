"use client";
import { useEffect, useRef, useState } from "react";

/** Cuenta regresiva con penalizaciones; llama `onEnd` una sola vez. */
export function useCountdown(seconds: number, onEnd: () => void, running = true) {
  const [endAt, setEndAt] = useState(() => Date.now() + seconds * 1000);
  const [left, setLeft] = useState(seconds);
  const ended = useRef(false);
  const endRef = useRef(onEnd);
  useEffect(() => { endRef.current = onEnd; });

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      const s = Math.max(0, (endAt - Date.now()) / 1000);
      setLeft(s);
      if (s <= 0 && !ended.current) { ended.current = true; clearInterval(t); endRef.current(); }
    }, 100);
    return () => clearInterval(t);
  }, [endAt, running]);

  return { left, penalize: (sec: number) => setEndAt((e) => e - sec * 1000), stop: () => { ended.current = true; } };
}
