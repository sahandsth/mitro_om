"use client";

import { useEffect, useRef } from "react";

export function HeroFonts() {
    return (
        <style>{`
            @font-face {
                font-family: 'Francy';
                src: url('/fonts/Francy.otf') format('opentype');
                font-weight: normal;
                font-style: normal;
                font-display: swap;
            }
            @font-face {
                font-family: 'BrittanySignature';
                src: url('/fonts/BrittanySignature.ttf') format('truetype');
                font-weight: normal;
                font-style: normal;
                font-display: swap;
            }
        `}</style>
    );
}

type HeroContentProps = {
    wordIndex?: number;
    scrollWord?: string;
    showScrollHint?: boolean;
    hintHidden?: boolean;
    embedded?: boolean;
};

export default function HeroContent({
    wordIndex = 0,
    scrollWord,
    showScrollHint = false,
    hintHidden = false,
    embedded = false,
}: HeroContentProps) {
    const word = scrollWord ?? DEFAULT_WORDS[wordIndex] ?? DEFAULT_WORDS[0];

    const rootRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const root = rootRef.current;
        if (!root) return;
        if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches)
            return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        const target = { x: 0, y: 0 };
        const cur = { x: 0, y: 0 };
        let raf = 0;

        const onMove = (e: MouseEvent) => {
            target.x = (e.clientX / window.innerWidth - 0.5) * 2;
            target.y = (e.clientY / window.innerHeight - 0.5) * 2;
        };

        const loop = () => {
            cur.x += (target.x - cur.x) * 0.06;
            cur.y += (target.y - cur.y) * 0.06;
            root.style.setProperty("--px", cur.x.toFixed(3));
            root.style.setProperty("--py", cur.y.toFixed(3));
            raf = requestAnimationFrame(loop);
        };

        window.addEventListener("mousemove", onMove, { passive: true });
        raf = requestAnimationFrame(loop);
        return () => {
            window.removeEventListener("mousemove", onMove);
            cancelAnimationFrame(raf);
        };
    }, []);

    return (
        <>
            <div
                ref={rootRef}
                className={`hero-sticky${embedded ? " hero-embedded" : ""}`}
            >
                <div className="hero-bg" />

                <div className="hero-center">
                    <p className="hero-static">We Achieved Transforming</p>

                    <div className="hero-middle-row">
                        <span key={word} className="hero-script-word">
                            {word}
                        </span>
                        <span className="hero-static hero-to"> To</span>
                    </div>

                    <p className="hero-static">to perfectly executed projects</p>
                </div>

                {showScrollHint && (
                    <div className={`scroll-hint${hintHidden ? " hint-hidden" : ""}`}>
                        <span />
                    </div>
                )}
            </div>

            <style jsx>{`
                .hero-sticky {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }

                .hero-embedded .hero-center {
                    padding-top: 0;
                }

                .hero-embedded .hero-static {
                    font-size: clamp(14px, 2.8vw, 30px);
                }

                .hero-embedded .hero-script-word {
                    font-size: clamp(20px, 4vw, 44px);
                }

                .hero-embedded .hero-middle-row {
                    min-height: clamp(32px, 6vw, 62px);
                }

                .hero-bg {
                    position: absolute;
                    inset: -4%;
                    background:
                        radial-gradient(ellipse at 58% 50%, #ffffff 0%, transparent 52%),
                        linear-gradient(148deg, #c4c4c4 0%, #d6d6d6 28%, #e3e3e3 58%, #c9c9c9 100%);
                    z-index: 0;
                    transform: translate3d(
                        calc(var(--px, 0) * 16px),
                        calc(var(--py, 0) * 16px),
                        0
                    );
                    will-change: transform;
                }

                .hero-bg::after {
                    content: "";
                    position: absolute;
                    inset: 0;
                    background: radial-gradient(
                        ellipse at 50% 50%,
                        transparent 42%,
                        rgba(140, 140, 140, 0.16) 100%
                    );
                }

                .hero-center {
                    position: relative;
                    z-index: 10;
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    user-select: none;
                    gap: 1px;
                    padding-top: var(--nav-h, 110px);
                    transform: translate3d(
                        calc(var(--px, 0) * -9px),
                        calc(var(--py, 0) * -9px),
                        0
                    );
                    will-change: transform;
                }

                .hero-static {
                    font-family: "Francy", serif;
                    font-size: 30px;
                    font-weight: 400;
                    color: rgba(151, 151, 151, 0.82);
                    letter-spacing: 0.018em;
                    margin: 0;
                    line-height: 0.5;
                }

                .hero-middle-row {
                    display: flex;
                    align-items: baseline;
                    justify-content: center;
                    gap: 8px;
                    min-height: 62px;
                    margin: 1px 0;
                }

                .hero-script-word {
                    font-family: "BrittanySignature", sans-serif;
                    font-size: 44px;
                    font-weight: 400;
                    color: rgba(128, 128, 128, 0.76);
                    letter-spacing: 0.01em;
                    line-height: 1.2;
                    display: inline-block;
                    animation: word-fade 0.7s ease;
                }

                @keyframes word-fade {
                    from {
                        opacity: 0;
                        transform: translateY(6px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .scroll-hint {
                    position: absolute;
                    bottom: 32px;
                    left: 50%;
                    transform: translateX(-50%);
                    z-index: 10;
                    opacity: 1;
                    transition: opacity 0.4s ease;
                }

                .scroll-hint.hint-hidden {
                    opacity: 0;
                    pointer-events: none;
                }

                .scroll-hint span {
                    display: block;
                    width: 18px;
                    height: 18px;
                    border-right: 1.5px solid rgba(120, 120, 120, 0.55);
                    border-bottom: 1.5px solid rgba(120, 120, 120, 0.55);
                    transform: rotate(45deg);
                    animation: bounce 1.6s ease-in-out infinite;
                }

                @keyframes bounce {
                    0%,
                    100% {
                        transform: rotate(45deg) translateY(0);
                    }
                    50% {
                        transform: rotate(45deg) translateY(5px);
                    }
                }

                @media (max-width: 768px) {
                    .hero-script-word {
                        font-size: 36px;
                    }
                    .hero-static {
                        font-size: 20px;
                    }
                }
            `}</style>
        </>
    );
}

const DEFAULT_WORDS = ["Creativity"];
