"use client";

import { useEffect } from "react";

export function useAutosizeTextArea(
  ref: React.RefObject<HTMLTextAreaElement>,
  value?: string,
) {
  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    el.style.height = "0px";
    el.style.height = `${el.scrollHeight}px`;
  }, [ref, value]);
}
