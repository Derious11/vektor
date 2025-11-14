"use client";

import { useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    if (typeof document === "undefined") {
      return false;
    }
    return document.documentElement.classList.contains("dark");
  });

  function toggleTheme() {
    const newTheme = !dark;

    setDark(newTheme);

    if (newTheme) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("vektor-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("vektor-theme", "light");
    }
  }

  return (
    <button
      onClick={toggleTheme}
      className="flex h-10 w-10 items-center justify-center rounded-md border bg-secondary hover:bg-secondary/80 transition"
    >
      {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}
