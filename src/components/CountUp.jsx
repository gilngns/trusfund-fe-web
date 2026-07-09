import { useState, useEffect } from "react";
import { useReveal } from "./Reveal";

// Animates a number from 0 to `target` once it scrolls into view. `ready` lets
// a caller hold the count off until something else (e.g. a preloader) is done,
// so it doesn't finish silently off-screen before the user can see it.
export default function CountUp({ target, decimals = 0, prefix = "", suffix = "", duration = 1400, className = "", ready = true }) {
  const [ref, visible] = useReveal(0.4);
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!visible || !ready) return;
    let rafId;
    const start = performance.now();
    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(target * eased);
      if (t < 1) rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [visible, ready, target, duration]);

  const formatted = value.toLocaleString("id-ID", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span ref={ref} className={className}>
      {prefix}{formatted}{suffix}
    </span>
  );
}
