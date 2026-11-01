import { useEffect, useState } from "react";

// Простой роутер на hash (#/login) — работает на GitHub Pages без настроек.
const current = (): string => window.location.hash.replace(/^#/, "") || "/";

export function useRoute(): string {
  const [route, setRoute] = useState(current());
  useEffect(() => {
    const onChange = () => setRoute(current());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return route;
}

export const navigate = (path: string): void => {
  window.location.hash = path;
};
