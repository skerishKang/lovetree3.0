import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function HashScrollRestoration() {
  const location = useLocation();

  useEffect(() => {
    const hash = location.hash;
    if (!hash) return;

    const id = hash.replace(/^#/, "");
    const el = document.getElementById(id);
    if (el) {
      const headerOffset = 72;
      const top = el.getBoundingClientRect().top + window.scrollY - headerOffset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  }, [location.hash, location.pathname]);

  return null;
}
