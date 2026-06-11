"use client";

import { useEffect, useRef } from "react";

/**
 * Thin top progress bar reflecting overall page scroll. Reads the native
 * scroll position (kept accurate by Lenis) on a rAF-throttled listener.
 */
export default function ScrollProgress() {
    const barRef = useRef<HTMLDivElement>(null);
    const rafRef = useRef(0);

    useEffect(() => {
        const update = () => {
            rafRef.current = 0;
            const doc = document.documentElement;
            const max = doc.scrollHeight - window.innerHeight;
            const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
            if (barRef.current) {
                barRef.current.style.transform = `scaleX(${p})`;
            }
        };

        const onScroll = () => {
            if (rafRef.current) return;
            rafRef.current = requestAnimationFrame(update);
        };

        update();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll, { passive: true });
        return () => {
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, []);

    return (
        <div className="sp-track" aria-hidden="true">
            <div ref={barRef} className="sp-bar" />

            <style jsx>{`
                .sp-track {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 2px;
                    z-index: 9998;
                    pointer-events: none;
                    background: transparent;
                }

                .sp-bar {
                    height: 100%;
                    width: 100%;
                    transform: scaleX(0);
                    transform-origin: left center;
                    background: linear-gradient(
                        90deg,
                        rgba(120, 120, 120, 0.6),
                        rgba(255, 255, 255, 0.95)
                    );
                    mix-blend-mode: difference;
                    will-change: transform;
                }
            `}</style>
        </div>
    );
}
