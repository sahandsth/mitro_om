"use client";

import { useEffect, useRef } from "react";

/**
 * A soft radial light that follows the cursor inside its parent element.
 * Drop it as the first child of a `position: relative/absolute` container
 * (e.g. a dark section) — it reads pointer movement on that parent only.
 */
export default function Spotlight({
    color = "rgba(255, 255, 255, 0.07)",
    size = 560,
}: {
    color?: string;
    size?: number;
}) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = ref.current;
        const parent = el?.parentElement;
        if (!el || !parent) return;
        if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches)
            return;

        const onMove = (e: MouseEvent) => {
            const r = parent.getBoundingClientRect();
            el.style.setProperty("--sx", `${e.clientX - r.left}px`);
            el.style.setProperty("--sy", `${e.clientY - r.top}px`);
            el.style.opacity = "1";
        };
        const onLeave = () => {
            el.style.opacity = "0";
        };

        parent.addEventListener("mousemove", onMove, { passive: true });
        parent.addEventListener("mouseleave", onLeave);
        return () => {
            parent.removeEventListener("mousemove", onMove);
            parent.removeEventListener("mouseleave", onLeave);
        };
    }, []);

    return (
        <div ref={ref} className="spotlight" aria-hidden="true">
            <style jsx>{`
                .spotlight {
                    position: absolute;
                    inset: 0;
                    z-index: 0;
                    pointer-events: none;
                    opacity: 0;
                    transition: opacity 0.5s ease;
                    background: radial-gradient(
                        ${size}px ${size}px at var(--sx, 50%) var(--sy, 50%),
                        ${color} 0%,
                        transparent 60%
                    );
                }
            `}</style>
        </div>
    );
}
