"use client";

import { useEffect, useRef, useState } from "react";

const SCROLL_WORDS = [
    "Creativity",
    "Innovation",
    "Vision",
    "Passion",
    "Brilliance",
    "Artistry",
    "Mastery",
    "Excellence",
    "Elegance",
    "Imagination",
    "Ambition",
    "Precision",
    "Craftsmanship",
    "Strategy",
    "Ingenuity",
    "Originality",
    "Boldness",
    "Purpose",
];

const TOTAL_WORDS = SCROLL_WORDS.length;

// ─── ✏️ کنترل سرعت ───────────────────────────────────────────
// هر چقدر کمتر = کلمات تندتر عوض میشن
// 0.2  → خیلی تند  (هر ۲۰٪ vh یه کلمه)
// 0.5  → متوسط     (هر ۵۰٪ vh یه کلمه)  ← پیش‌فرض
// 1.0  → آروم      (هر ۱۰۰٪ vh یه کلمه)
const SCROLL_PER_WORD_VH = 0.08;
// ─────────────────────────────────────────────────────────────

export default function HeroSection() {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [wordIndex, setWordIndex] = useState(0);
    const [done, setDone] = useState(false);

    // Total height of the wrapper in vh units
    const wrapperVh = TOTAL_WORDS * SCROLL_PER_WORD_VH + 1; // +1 so last word has breathing room

    useEffect(() => {
        const handleScroll = () => {
            const wrapper = wrapperRef.current;
            if (!wrapper) return;

            const wrapperTop = wrapper.getBoundingClientRect().top;
            const scrolledIntoWrapper = -wrapperTop;
            const totalScrollDistance = wrapper.offsetHeight - window.innerHeight;

            if (scrolledIntoWrapper < 0) {
                setWordIndex(0);
                setDone(false);
                return;
            }

            if (scrolledIntoWrapper >= totalScrollDistance) {
                setWordIndex(TOTAL_WORDS - 1);
                setDone(true);
                return;
            }

            setDone(false);

            const progress = scrolledIntoWrapper / totalScrollDistance;
            const idx = Math.min(
                Math.floor(progress * TOTAL_WORDS),
                TOTAL_WORDS - 1
            );

            setWordIndex((prev) => {
                if (prev !== idx) {
                    return idx;
                }
                return prev;
            });
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <>
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

            <div
                id="home"
                ref={wrapperRef}
                style={{ height: `${wrapperVh * 100}vh`, position: "relative" }}
            >
                <div className="hero-sticky">
                    <div className="hero-bg" />

                    <div className="hero-center">
                        <p className="hero-static">We Achieved Transforming</p>

                        <div className="hero-middle-row">
                            <span className="hero-script-word">
                                {SCROLL_WORDS[wordIndex]}
                            </span>
                            <span className="hero-static hero-to"> To</span>
                        </div>

                        <p className="hero-static">to perfectly executed projects</p>
                    </div>

                    <div className={`scroll-hint ${done ? "hint-hidden" : ""}`}>
                        <span />
                    </div>
                </div>
            </div>

            <style jsx>{`
                .hero-sticky {
                    position: sticky;
                    top: 0;
                    width: 100%;
                    height: 100vh;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }

                .hero-bg {
                    position: absolute;
                    inset: 0;
                    background:
                            radial-gradient(ellipse at 58% 50%, #ffffff 0%, transparent 52%),
                            linear-gradient(148deg, #c4c4c4 0%, #d6d6d6 28%, #e3e3e3 58%, #c9c9c9 100%);
                    z-index: 0;
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
                    0%, 100% { transform: rotate(45deg) translateY(0); }
                    50%       { transform: rotate(45deg) translateY(5px); }
                }

                @media (max-width: 768px) {
                    .hero-script-word { font-size: 36px; }
                    .hero-static { font-size: 20px; }
                }
            `}</style>
        </>
    );
}
