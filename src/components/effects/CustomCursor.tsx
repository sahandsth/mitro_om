"use client";

import { useEffect, useRef, useState } from "react";

type CursorState = "default" | "link" | "view" | "drag" | "hidden";

/**
 * Custom cursor: an instant inner dot plus a lagging ring follower.
 * Uses `mix-blend-mode: difference` on dark sections; switches to a solid
 * dark cursor on light areas marked with `data-cursor-light` (hero, etc.).
 *
 * State is data-attribute driven — any element can opt in via:
 *   data-cursor="link" | "view" | "drag"
 *   data-cursor-label="View"   (custom label text, implies the "view" look)
 *
 * Only mounts on devices with a fine pointer (mouse), so touch is untouched.
 */
export default function CustomCursor() {
    const [enabled, setEnabled] = useState(false);
    const [state, setState] = useState<CursorState>("default");
    const [label, setLabel] = useState("");
    const [onLightBg, setOnLightBg] = useState(false);

    const dotRef = useRef<HTMLDivElement>(null);
    const ringRef = useRef<HTMLDivElement>(null);

    // target (true mouse pos) vs rendered (eased) ring position
    const target = useRef({ x: 0, y: 0 });
    const ring = useRef({ x: 0, y: 0 });
    const rafRef = useRef(0);

    useEffect(() => {
        const finePointer = window.matchMedia(
            "(hover: hover) and (pointer: fine)"
        ).matches;
        const reduce = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;
        if (!finePointer || reduce) return;

        setEnabled(true);
        document.documentElement.classList.add("has-custom-cursor");

        const isOutsideViewport = (x: number, y: number) =>
            x < 0 ||
            y < 0 ||
            x > window.innerWidth ||
            y > window.innerHeight;

        const isLightBgAt = (x: number, y: number) => {
            const hit = document.elementFromPoint(x, y);
            if (hit?.closest("[data-cursor-light]")) return true;

            const home = document.getElementById("home");
            if (!home) return false;

            const stage = home.querySelector(".hero-stage, .hero-sticky-wrapper");
            const rect = (stage ?? home).getBoundingClientRect();
            return (
                x >= rect.left &&
                x <= rect.right &&
                y >= rect.top &&
                y <= rect.bottom
            );
        };

        const resolveState = (el: Element | null): { s: CursorState; l: string } => {
            const hit = el?.closest<HTMLElement>(
                "[data-cursor], a, button, input, textarea, select"
            );
            if (!hit) return { s: "default", l: "" };

            const explicitLabel = hit.getAttribute("data-cursor-label");
            if (explicitLabel) return { s: "view", l: explicitLabel };

            const explicit = hit.getAttribute("data-cursor") as CursorState | null;
            if (explicit) return { s: explicit, l: "" };

            return { s: "link", l: "" };
        };

        const syncFromPoint = (x: number, y: number, targetEl: Element | null) => {
            if (isOutsideViewport(x, y)) {
                setState("hidden");
                return;
            }

            setOnLightBg(isLightBgAt(x, y));

            const hit =
                document.elementFromPoint(x, y) ?? targetEl ?? document.body;
            const { s, l } = resolveState(hit);
            setState(s);
            setLabel(l);
        };

        const onMove = (e: MouseEvent) => {
            target.current.x = e.clientX;
            target.current.y = e.clientY;
            if (dotRef.current) {
                dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
            }
            syncFromPoint(e.clientX, e.clientY, e.target as Element);
        };

        const onOver = (e: MouseEvent) => {
            syncFromPoint(e.clientX, e.clientY, e.target as Element);
        };

        const onDown = () => setState((p) => (p === "default" ? "drag" : p));
        const onUp = (e: MouseEvent) => {
            syncFromPoint(e.clientX, e.clientY, e.target as Element);
        };

        window.addEventListener("mousemove", onMove, { passive: true });
        window.addEventListener("mouseover", onOver, { passive: true });
        window.addEventListener("mousedown", onDown);
        window.addEventListener("mouseup", onUp);

        const loop = () => {
            ring.current.x += (target.current.x - ring.current.x) * 0.18;
            ring.current.y += (target.current.y - ring.current.y) * 0.18;
            if (ringRef.current) {
                ringRef.current.style.transform = `translate3d(${ring.current.x}px, ${ring.current.y}px, 0)`;
            }
            rafRef.current = requestAnimationFrame(loop);
        };
        rafRef.current = requestAnimationFrame(loop);

        return () => {
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseover", onOver);
            window.removeEventListener("mousedown", onDown);
            window.removeEventListener("mouseup", onUp);
            cancelAnimationFrame(rafRef.current);
            document.documentElement.classList.remove("has-custom-cursor");
        };
    }, []);

    if (!enabled) return null;

    const dotLight = onLightBg ? " cur-dot--light" : "";
    const ringLight = onLightBg ? " cur-ring--light" : "";

    return (
        <div className="cur-root" aria-hidden="true">
            <div
                ref={dotRef}
                className={`cur-dot cur-${state}${dotLight}`}
            />
            <div ref={ringRef} className={`cur-ring cur-${state}${ringLight}`}>
                {state === "view" && label && (
                    <span className="cur-label">{label}</span>
                )}
            </div>

            <style jsx global>{`
                .has-custom-cursor,
                .has-custom-cursor * {
                    cursor: none !important;
                }
            `}</style>

            <style jsx>{`
                .cur-root {
                    position: fixed;
                    inset: 0;
                    z-index: 100000;
                    pointer-events: none;
                }

                .cur-dot,
                .cur-ring {
                    position: fixed;
                    top: 0;
                    left: 0;
                    border-radius: 50%;
                    pointer-events: none;
                    mix-blend-mode: difference;
                    will-change: transform;
                }

                .cur-dot {
                    width: 7px;
                    height: 7px;
                    margin: -3.5px 0 0 -3.5px;
                    background: #fff;
                    transition:
                        width 0.25s ease,
                        height 0.25s ease,
                        opacity 0.25s ease;
                }

                .cur-ring {
                    width: 38px;
                    height: 38px;
                    margin: -19px 0 0 -19px;
                    border: 1px solid rgba(255, 255, 255, 0.9);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition:
                        width 0.32s cubic-bezier(0.22, 1, 0.36, 1),
                        height 0.32s cubic-bezier(0.22, 1, 0.36, 1),
                        background 0.3s ease,
                        border-color 0.3s ease,
                        opacity 0.3s ease;
                }

                /* hidden (off-screen / left window) */
                .cur-dot.cur-hidden,
                .cur-ring.cur-hidden {
                    opacity: 0;
                }

                /* link / interactive hover */
                .cur-ring.cur-link {
                    width: 64px;
                    height: 64px;
                    margin: -32px 0 0 -32px;
                    background: rgba(255, 255, 255, 0.12);
                    border-color: rgba(255, 255, 255, 0.5);
                }
                .cur-dot.cur-link {
                    opacity: 0;
                }

                /* drag (mousedown) */
                .cur-ring.cur-drag {
                    width: 26px;
                    height: 26px;
                    margin: -13px 0 0 -13px;
                }

                /* view label (portfolio / images) */
                .cur-ring.cur-view {
                    width: 92px;
                    height: 92px;
                    margin: -46px 0 0 -46px;
                    background: #fff;
                    border-color: transparent;
                    mix-blend-mode: normal;
                }
                .cur-dot.cur-view {
                    opacity: 0;
                }

                .cur-label {
                    font-family: "Francy", serif;
                    font-size: 13px;
                    letter-spacing: 0.12em;
                    text-transform: uppercase;
                    color: #0a0a0a;
                    mix-blend-mode: normal;
                }

                /* light sections (hero) — solid dark cursor */
                .cur-dot--light,
                .cur-ring--light {
                    mix-blend-mode: normal;
                }

                .cur-dot--light {
                    background: #0a0a0a;
                }

                .cur-ring--light {
                    border-color: rgba(10, 10, 10, 0.85);
                }

                .cur-ring--light.cur-link {
                    background: rgba(0, 0, 0, 0.07);
                    border-color: rgba(10, 10, 10, 0.45);
                }
            `}</style>
        </div>
    );
}
