"use client";

import { useEffect, useRef, useState } from "react";
import { startLenis, stopLenis } from "@/lib/lenisStore";

type Phase = "loading" | "exit" | "done";

const COUNT_MS = 1700;
const EXIT_MS = 1100;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Branded intro overlay: a 0 → 100 counter under the wordmark, then a
 * curtain wipe up that reveals the hero. Locks scrolling (and pauses Lenis)
 * while active so the first impression is controlled.
 */
export default function Preloader() {
    const [count, setCount] = useState(0);
    const [phase, setPhase] = useState<Phase>("loading");
    const rafRef = useRef(0);

    useEffect(() => {
        const reduce = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        // lock the page while the intro plays
        const root = document.documentElement;
        root.style.overflow = "hidden";
        window.scrollTo(0, 0);
        const lockLenis = () => stopLenis();
        lockLenis();
        const lenisGuard = window.setInterval(lockLenis, 80);

        const unlock = () => {
            window.clearInterval(lenisGuard);
            root.style.overflow = "";
            startLenis();
        };

        if (reduce) {
            setCount(100);
            setPhase("done");
            unlock();
            return () => unlock();
        }

        const start = performance.now();
        const tick = (now: number) => {
            const t = Math.min(1, (now - start) / COUNT_MS);
            setCount(Math.round(easeOut(t) * 100));
            if (t < 1) {
                rafRef.current = requestAnimationFrame(tick);
            } else {
                setPhase("exit");
                window.setTimeout(() => {
                    setPhase("done");
                    unlock();
                }, EXIT_MS);
            }
        };
        rafRef.current = requestAnimationFrame(tick);

        return () => {
            cancelAnimationFrame(rafRef.current);
            unlock();
        };
    }, []);

    if (phase === "done") return null;

    return (
        <div className={`pl ${phase === "exit" ? "pl--exit" : ""}`} aria-hidden="true">
            <div className="pl-inner">
                <div className="pl-brand">
                    <span className="pl-mark">M</span>
                    <span className="pl-name">MITRO&nbsp;TEAM</span>
                </div>
                <div className="pl-line">
                    <span
                        className="pl-line-fill"
                        style={{ transform: `scaleX(${count / 100})` }}
                    />
                </div>
            </div>
            <span className="pl-count">{String(count).padStart(3, "0")}</span>

            <style jsx>{`
                .pl {
                    position: fixed;
                    inset: 0;
                    z-index: 99990;
                    background: #0a0a0a;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                    clip-path: inset(0 0 0 0);
                    transition: clip-path ${EXIT_MS}ms cubic-bezier(0.76, 0, 0.24, 1);
                }

                .pl--exit {
                    clip-path: inset(0 0 100% 0);
                }

                .pl-inner {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 26px;
                    transition:
                        opacity 0.5s ease,
                        transform 0.7s cubic-bezier(0.76, 0, 0.24, 1);
                }

                .pl--exit .pl-inner {
                    opacity: 0;
                    transform: translateY(-22px);
                }

                .pl-brand {
                    display: flex;
                    align-items: center;
                    gap: 18px;
                }

                .pl-mark {
                    font-family: "Francy", serif;
                    font-size: clamp(44px, 6vw, 78px);
                    line-height: 1;
                    color: #fff;
                    animation: pl-pulse 1.6s ease-in-out infinite;
                }

                .pl-name {
                    font-family: "Francy", serif;
                    font-size: clamp(14px, 1.4vw, 20px);
                    letter-spacing: 0.42em;
                    color: rgba(255, 255, 255, 0.6);
                    white-space: nowrap;
                }

                .pl-line {
                    width: clamp(180px, 22vw, 280px);
                    height: 1px;
                    background: rgba(255, 255, 255, 0.16);
                    overflow: hidden;
                }

                .pl-line-fill {
                    display: block;
                    height: 100%;
                    width: 100%;
                    background: #fff;
                    transform-origin: left center;
                }

                .pl-count {
                    position: absolute;
                    right: clamp(24px, 5vw, 64px);
                    bottom: clamp(20px, 4vh, 44px);
                    font-family: "Francy", serif;
                    font-size: clamp(40px, 8vw, 92px);
                    line-height: 0.8;
                    color: rgba(255, 255, 255, 0.92);
                    letter-spacing: -0.02em;
                    transition:
                        opacity 0.5s ease,
                        transform 0.7s cubic-bezier(0.76, 0, 0.24, 1);
                }

                .pl--exit .pl-count {
                    opacity: 0;
                    transform: translateY(-22px);
                }

                @keyframes pl-pulse {
                    0%,
                    100% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.45;
                    }
                }
            `}</style>
        </div>
    );
}
