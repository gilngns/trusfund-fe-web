import { useEffect, useRef, useState } from "react";
import "./ScrollIntro.css";

const LETTERS = ["T", "r", "u", "s", "t", "F", "u", "n", "d"];
const BLUE_FROM = 5; // "Fund" starts here
const SCROLL_DISTANCE = 900; // px of accumulated wheel/touch delta to fully resolve
const MOMENTUM_GRACE_MS = 550; // absorbs trailing trackpad/touch momentum before releasing scroll

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

// Full-screen intro that only resolves as the user scrolls (or clicks to skip):
// each letter of "TrustFund" tumbles apart in 3D proportional to scroll progress,
// then hands real scroll control back to the page once fully separated — landed
// exactly at the top (hero), not wherever leftover scroll momentum happens to land.
export default function ScrollIntro({ onDone }) {
  const [progress, setProgress] = useState(0);
  const targetRef = useRef(0);
  const doneRef = useRef(false);
  const resolvedRef = useRef(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onDone();
      return;
    }

    // Jangan biarkan browser restore posisi scroll lama saat reload —
    // intro harus selalu mulai dengan halaman di posisi paling atas.
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);

    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";

    function cleanupAndDone() {
      if (doneRef.current) return;
      doneRef.current = true;
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("keydown", handleKey);
      document.documentElement.style.overflow = prevOverflow;
      window.scrollTo(0, 0);
      onDone();
    }

    // Reached full separation: keep swallowing wheel/touch input for a moment
    // so trackpad/touch momentum doesn't leak into the real page as extra scroll.
    function resolve() {
      if (resolvedRef.current) return;
      resolvedRef.current = true;
      setTimeout(cleanupAndDone, MOMENTUM_GRACE_MS);
    }

    function handleWheel(e) {
      e.preventDefault();
      if (resolvedRef.current) return;
      targetRef.current = clamp(targetRef.current + e.deltaY / SCROLL_DISTANCE, 0, 1);
    }

    let touchY = null;
    function handleTouchStart(e) {
      touchY = e.touches[0].clientY;
    }
    function handleTouchMove(e) {
      e.preventDefault();
      if (touchY == null || resolvedRef.current) return;
      const dy = touchY - e.touches[0].clientY;
      touchY = e.touches[0].clientY;
      targetRef.current = clamp(targetRef.current + dy / (SCROLL_DISTANCE * 0.6), 0, 1);
    }

    // Space/PageDown/arrow juga bisa men-scroll halaman — ikut ditelan selama intro,
    // dan dihitung sebagai progress supaya pengguna keyboard tetap bisa masuk.
    const SCROLL_KEYS = ["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "];
    function handleKey(e) {
      if (!SCROLL_KEYS.includes(e.key)) return;
      e.preventDefault();
      if (resolvedRef.current) return;
      targetRef.current = clamp(targetRef.current + 120 / SCROLL_DISTANCE, 0, 1);
    }

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("keydown", handleKey, { passive: false });

    let current = 0;
    let rafId;
    function tick() {
      current += (targetRef.current - current) * 0.15;
      setProgress(current);
      if (targetRef.current >= 1 && current >= 0.995) {
        setProgress(1);
        resolve();
        return;
      }
      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("keydown", handleKey);
      document.documentElement.style.overflow = prevOverflow;
    };
  }, [onDone]);

  function skip() {
    targetRef.current = 1;
  }

  const overlayOpacity = progress < 0.8 ? 1 : 1 - (progress - 0.8) / 0.2;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white cursor-pointer"
      style={{ opacity: overlayOpacity, pointerEvents: progress >= 1 ? "none" : "auto" }}
      onClick={skip}
    >
      <div className="scroll-intro-scene flex">
        {LETTERS.map((ch, i) => {
          const offset = i - 4;
          const tx = offset * 60 * progress;
          const ty = (i % 2 === 0 ? -1 : 1) * 56 * progress;
          const rotY = offset * 26 * progress;
          const rotZ = (i % 2 === 0 ? -1 : 1) * 10 * progress;
          const scale = 1 + progress * 0.4;
          const opacity = 1 - progress;
          const isBlue = i >= BLUE_FROM;
          return (
            <span
              key={i}
              className={`scroll-intro-letter font-display text-7xl sm:text-8xl md:text-9xl font-bold ${isBlue ? "text-blue-600" : "text-slate-900"}`}
              style={{
                transform: `translate(${tx}px, ${ty}px) rotateY(${rotY}deg) rotateZ(${rotZ}deg) scale(${scale})`,
                opacity,
              }}
            >
              {ch}
            </span>
          );
        })}
      </div>

      <div className="mt-12 w-56 h-1 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-blue-600 rounded-full" style={{ width: `${progress * 100}%` }} />
      </div>

      <div className="scroll-intro-hint mt-6 text-xs font-semibold uppercase tracking-widest text-slate-400">
        Scroll untuk masuk
      </div>
    </div>
  );
}