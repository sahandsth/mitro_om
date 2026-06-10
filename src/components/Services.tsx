"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";

export const SERVICES = [

    {
    title: "Visual Identity",
    description:
        "From logo systems to typography, color palettes, and brand assets, we create cohesive visual identities that communicate your brand's personality consistently across every touchpoint.",
    images: [
        "/images/services/VI/1.png",
        "/images/services/VI/2.png",
        "/images/services/VI/3.png",
        "/images/services/VI/4.png",
    ],
},
    {
        title: "Character Design",
        description:
            "We design memorable characters that bring personality and storytelling to your brand, creating unique visual ambassadors that connect with audiences and leave a lasting impression.",
        images: [
            "/images/services/CD/1.png",
            "/images/services/CD/2.png",
            "/images/services/CD/3.png",
            "/images/services/CD/4.png",
        ],
    },
    {
        title: "Content Creation",
        description:
            "Compelling content tailored to your brand voice — from copywriting to art direction — crafted to engage, inspire, and convert your audience.",
        images: [
            "/images/services/CC/1.png",
            "/images/services/CC/2.png",
            "/images/services/CC/3.png",
            "/images/services/CC/4.png",
        ],
    },
    {
        title: "Website",
        description:
            "We design and develop websites that are visually engaging, user-focused, and optimized to transform visitors into loyal clients while showcasing your brand at its best.",
        images: [
            "/images/services/WS/1.png",
            "/images/services/WS/2.png",
            "/images/services/WS/3.png",
            "/images/services/WS/4.png",
        ],
    },

    {
        title: "Poster Design",
        description:
            "We create impactful poster designs that combine striking visuals with clear messaging, ensuring your campaigns capture attention and communicate effectively.",
        images: [
            "/images/services/PD/1.png",
            "/images/services/PD/2.png",
            "/images/services/PD/3.png",
            "/images/services/PD/4.png",
        ],
    },
    {
        title: "UI Design",
        description:
            "We design intuitive and visually refined user interfaces that enhance usability, improve user experiences, and seamlessly align with your brand identity.",
        images: [
            "/images/services/UI/1.png",
            "/images/services/UI/2.png",
            "/images/services/UI/3.png",
            "/images/services/UI/4.png",
        ],
    },
    {
        title: "Brand Book",
        description:
            "We develop comprehensive brand books that define your visual and verbal guidelines, ensuring consistency and clarity across all brand communications.",
        images: [
            "/images/services/BB/1.png",
            "/images/services/BB/2.png",
            "/images/services/BB/3.png",
            "/images/services/BB/4.png",
        ],
    },
];

const clamp01 = (t: number) => Math.max(0, Math.min(1, t));
const smoothstep = (t: number) => {
    const x = clamp01(t);
    return x * x * (3 - 2 * x);
};

const OVERVIEW_VH = 0.55;
const SERVICE_VH = 1;
const TAIL_VH = 0.6;
const OPEN_AT = 0.58;
const HOLD_START = 0.18;
const HOLD_END = 0.82;
const SNAP_DEBOUNCE_MS = 140;

function openAmount(within: number) {
    if (within < HOLD_START) return smoothstep(within / HOLD_START);
    if (within > HOLD_END) return smoothstep((1 - within) / (1 - HOLD_END));
    return 1;
}

function serviceScrollTop(wrapper: HTMLElement, index: number) {
    const vh = window.innerHeight;
    const overviewEnd = OVERVIEW_VH * vh;
    const perService = SERVICE_VH * vh;
    const totalVh =
        OVERVIEW_VH + SERVICES.length * SERVICE_VH + TAIL_VH;
    const ideal =
        wrapper.offsetTop +
        overviewEnd +
        index * perService +
        perService * OPEN_AT;
    const maxTop = wrapper.offsetTop + (totalVh - 1) * vh;
    return Math.min(ideal, maxTop);
}

/** Snap target inside the services track (px), biased by scroll direction. */
function snapServicesScrolled(
    scrolled: number,
    vh: number,
    serviceCount: number,
    totalVh: number,
    direction: number
) {
    const overviewEnd = OVERVIEW_VH * vh;
    const perService = SERVICE_VH * vh;
    const maxIdx = serviceCount - 1;
    const maxScroll = Math.max(0, totalVh * vh - vh);

    if (scrolled <= 0) return 0;
    if (scrolled >= maxScroll) return maxScroll;

    if (scrolled < overviewEnd) {
        if (direction > 0) return overviewEnd;
        if (direction < 0) return 0;
        return scrolled < overviewEnd * 0.5 ? 0 : overviewEnd;
    }

    const holdCenter = (idx: number) =>
        overviewEnd + idx * perService + OPEN_AT * perService;

    const raw = (scrolled - overviewEnd) / perService;
    const idx = Math.min(Math.floor(raw), maxIdx);
    const seg = raw - idx;

    if (idx >= maxIdx) return holdCenter(maxIdx);

    if (seg >= HOLD_START && seg <= HOLD_END) return holdCenter(idx);

    if (seg < HOLD_START) {
        if (direction > 0) return holdCenter(idx);
        if (direction < 0) {
            return idx === 0 ? overviewEnd : holdCenter(idx - 1);
        }
        const enterMid = HOLD_START * 0.5;
        return seg < enterMid
            ? idx === 0
                ? overviewEnd
                : holdCenter(idx - 1)
            : holdCenter(idx);
    }

    if (direction > 0) return holdCenter(idx + 1);
    if (direction < 0) return holdCenter(idx);
    const exitMid = HOLD_END + (1 - HOLD_END) * 0.5;
    return seg < exitMid ? holdCenter(idx) : holdCenter(idx + 1);
}

export default function ServicesSection() {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [mode, setMode] = useState<"overview" | "detail">("overview");
    const [activeIndex, setActiveIndex] = useState(0);
    const [openFrac, setOpenFrac] = useState(0);
    const [introReady, setIntroReady] = useState(false);
    const introPlayed = useRef(false);
    const snapLockRef = useRef(false);
    const snapTimerRef = useRef(0);
    const lastScrolledRef = useRef<number | null>(null);
    const scrollDirRef = useRef(0);

    const totalVh =
        OVERVIEW_VH + SERVICES.length * SERVICE_VH + TAIL_VH;

    const scrollToService = useCallback((index: number, smooth = true) => {
        const wrapper = wrapperRef.current;
        if (!wrapper) return;

        window.scrollTo({
            top: serviceScrollTop(wrapper, index),
            behavior: smooth ? "smooth" : "auto",
        });
    }, []);

    const playIntro = useCallback(() => {
        if (introPlayed.current) return;
        introPlayed.current = true;
        requestAnimationFrame(() => setIntroReady(true));
    }, []);

    const syncFromScroll = useCallback(() => {
        const wrapper = wrapperRef.current;
        if (!wrapper) return;

        const rect = wrapper.getBoundingClientRect();
        const scrolled = -rect.top;
        const vh = window.innerHeight;
        const overviewEnd = OVERVIEW_VH * vh;
        const perService = SERVICE_VH * vh;

        if (lastScrolledRef.current !== null) {
            const delta = scrolled - lastScrolledRef.current;
            if (Math.abs(delta) > 0.5) {
                scrollDirRef.current = delta > 0 ? 1 : -1;
            }
        }
        lastScrolledRef.current = scrolled;

        if (scrolled < 0) {
            setMode("overview");
            setOpenFrac(0);
            return;
        }

        playIntro();

        if (scrolled < overviewEnd) {
            setMode("overview");
            setOpenFrac(0);
            return;
        }

        setMode("detail");
        const detailProgress = scrolled - overviewEnd;
        const floatIdx = detailProgress / perService;
        const idx = Math.min(
            Math.floor(floatIdx),
            SERVICES.length - 1
        );
        const within = Math.min(floatIdx - idx, 1);

        setActiveIndex(idx);
        setOpenFrac(openAmount(within));
    }, [playIntro]);

    const snapToNearest = useCallback(() => {
        if (snapLockRef.current) return;

        const wrapper = wrapperRef.current;
        if (!wrapper) return;

        const rect = wrapper.getBoundingClientRect();
        const vh = window.innerHeight;

        if (rect.bottom < vh * 0.12 || rect.top > vh * 0.88) return;

        const scrolled = -rect.top;
        const targetScrolled = snapServicesScrolled(
            scrolled,
            vh,
            SERVICES.length,
            totalVh,
            scrollDirRef.current
        );

        if (Math.abs(targetScrolled - scrolled) < 6) return;

        const targetY = window.scrollY + rect.top + targetScrolled;
        snapLockRef.current = true;
        window.scrollTo({ top: Math.max(0, targetY), behavior: "smooth" });
        window.setTimeout(() => {
            snapLockRef.current = false;
        }, 700);
    }, [totalVh]);

    useLayoutEffect(() => {
        const wrapper = wrapperRef.current;
        if (!wrapper) return;
        if (-wrapper.getBoundingClientRect().top >= 0) playIntro();
    }, [playIntro]);

    useEffect(() => {
        const queueSnap = () => {
            window.clearTimeout(snapTimerRef.current);
            snapTimerRef.current = window.setTimeout(() => {
                snapToNearest();
            }, SNAP_DEBOUNCE_MS);
        };

        window.addEventListener("scroll", syncFromScroll, { passive: true });
        window.addEventListener("resize", syncFromScroll, { passive: true });
        window.addEventListener("scrollend", snapToNearest, { passive: true });
        window.addEventListener("scroll", queueSnap, { passive: true });
        syncFromScroll();

        return () => {
            window.removeEventListener("scroll", syncFromScroll);
            window.removeEventListener("resize", syncFromScroll);
            window.removeEventListener("scrollend", snapToNearest);
            window.removeEventListener("scroll", queueSnap);
            window.clearTimeout(snapTimerRef.current);
        };
    }, [syncFromScroll, snapToNearest]);

    const isOverview = mode === "overview";
    const active = SERVICES[activeIndex];

    return (
        <div
            ref={wrapperRef}
            style={{ height: `${totalVh * 100}vh`, position: "relative" }}
        >
            <div
                id="services"
                aria-hidden="true"
                style={{
                    position: "absolute",
                    top: 0,
                    width: 0,
                    height: 0,
                    pointerEvents: "none",
                }}
            />
            <div className="svc-sticky">
                <div className="svc-bg" />
                <div className="svc-bg-glow" />
                <div className="svc-bg-noise" aria-hidden="true" />

                <div
                    className={`svc-shell ${isOverview ? "svc-shell--overview" : "svc-shell--detail"}`}
                >
                    <header
                        className={`svc-header ${introReady ? "svc-header--intro" : ""}`}
                    >
                        <span className="svc-eyebrow">Services</span>
                        <span className="svc-count">
                            {String(SERVICES.length).padStart(2, "0")}
                        </span>
                    </header>

                    <div className="svc-body">
                        <nav
                            className={`svc-menu ${introReady ? "svc-menu--intro" : ""}`}
                            aria-label="Services"
                        >
                            <div
                                className="svc-rail"
                                aria-hidden="true"
                                style={{
                                    opacity: isOverview ? 0 : 0.7,
                                }}
                            >
                                <div
                                    className="svc-rail-fill"
                                    style={{
                                        transform: `scaleY(${(activeIndex + 1) / SERVICES.length})`,
                                    }}
                                />
                            </div>

                            {SERVICES.map((svc, i) => {
                                const isActive =
                                    !isOverview && activeIndex === i;
                                const focus = isOverview
                                    ? 0.38
                                    : isActive
                                      ? 1
                                      : 0.28;

                                return (
                                    <button
                                        key={svc.title}
                                        type="button"
                                        className={`svc-menu-btn ${isActive ? "svc-menu-btn--active" : ""}`}
                                        onClick={() => scrollToService(i)}
                                        style={{
                                            color: `rgba(255,255,255,${focus})`,
                                        }}
                                    >
                                        <span className="svc-menu-index">
                                            {String(i + 1).padStart(2, "0")}
                                        </span>
                                        <span className="svc-menu-label">
                                            {svc.title}
                                        </span>
                                        <span
                                            className="svc-menu-line"
                                            aria-hidden="true"
                                        />
                                    </button>
                                );
                            })}
                        </nav>

                        <div
                            className="svc-detail"
                            style={{
                                opacity: isOverview ? 0 : openFrac,
                                pointerEvents:
                                    !isOverview && openFrac > 0.5
                                        ? "auto"
                                        : "none",
                            }}
                        >
                            <div key={activeIndex} className="svc-panel">
                                <div className="svc-copy">
                                    <h3 className="svc-title">
                                        {active.title}
                                    </h3>
                                    <p className="svc-desc">
                                        {active.description}
                                    </p>
                                </div>
                                <div className="svc-grid">
                                    {active.images.map((src, j) => (
                                        <div
                                            key={j}
                                            className="svc-grid-cell"
                                            style={{
                                                animationDelay: `${j * 0.06}s`,
                                            }}
                                        >
                                            <Image
                                                src={src}
                                                alt=""
                                                fill
                                                sizes="(max-width: 900px) 45vw, 22vw"
                                                style={{ objectFit: "cover" }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .svc-sticky {
                    position: sticky;
                    top: 0;
                    width: 100%;
                    height: 100vh;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                }

                .svc-bg {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(
                        165deg,
                        #0a0a0a 0%,
                        #080808 45%,
                        #060606 100%
                    );
                    z-index: 0;
                }

                .svc-bg-glow {
                    position: absolute;
                    inset: 0;
                    background:
                        radial-gradient(
                            ellipse 70% 55% at 78% 42%,
                            rgba(255, 255, 255, 0.045) 0%,
                            transparent 68%
                        ),
                        radial-gradient(
                            ellipse 50% 40% at 12% 78%,
                            rgba(255, 255, 255, 0.025) 0%,
                            transparent 70%
                        );
                    z-index: 1;
                    pointer-events: none;
                }

                .svc-bg-noise {
                    position: absolute;
                    inset: 0;
                    opacity: 0.35;
                    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
                    z-index: 2;
                    pointer-events: none;
                }

                .svc-shell {
                    position: relative;
                    z-index: 10;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    padding: calc(var(--nav-h, 110px) + 8px) clamp(40px, 5vw, 72px)
                        clamp(24px, 4vh, 48px);
                    box-sizing: border-box;
                }

                .svc-header {
                    display: flex;
                    align-items: baseline;
                    justify-content: space-between;
                    margin-bottom: clamp(20px, 3.5vh, 40px);
                    opacity: 0;
                    transform: translateY(10px);
                    transition:
                        opacity 0.6s ease,
                        transform 0.65s cubic-bezier(0.22, 1, 0.36, 1);
                }

                .svc-header--intro {
                    opacity: 1;
                    transform: translateY(0);
                }

                .svc-eyebrow {
                    font-family: "Cormorant Garamond", Georgia, serif;
                    font-size: clamp(11px, 0.9vw, 13px);
                    font-weight: 400;
                    letter-spacing: 0.28em;
                    text-transform: uppercase;
                    color: rgba(255, 255, 255, 0.32);
                }

                .svc-count {
                    font-family: "Francy", serif;
                    font-size: clamp(13px, 1vw, 15px);
                    color: rgba(255, 255, 255, 0.2);
                    letter-spacing: 0.08em;
                }

                .svc-body {
                    flex: 1;
                    display: grid;
                    align-items: center;
                    min-height: 0;
                    transition: grid-template-columns 0.5s
                        cubic-bezier(0.22, 1, 0.36, 1);
                }

                .svc-shell--overview .svc-body {
                    grid-template-columns: 1fr;
                }

                .svc-shell--detail .svc-body {
                    grid-template-columns: minmax(220px, 0.92fr) minmax(0, 1.4fr);
                    gap: clamp(32px, 5vw, 72px);
                }

                .svc-menu {
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    gap: clamp(4px, 0.9vh, 10px);
                    width: 100%;
                    padding-left: 28px;
                }

                .svc-shell--detail .svc-menu {
                    gap: clamp(3px, 0.65vh, 8px);
                }

                .svc-rail {
                    position: absolute;
                    left: 0;
                    top: 4px;
                    bottom: 4px;
                    width: 1px;
                    background: rgba(255, 255, 255, 0.08);
                    transition: opacity 0.35s ease;
                }

                .svc-rail-fill {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(
                        180deg,
                        rgba(255, 255, 255, 0.55),
                        rgba(255, 255, 255, 0.15)
                    );
                    transform-origin: top;
                    transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
                }

                .svc-menu-btn {
                    position: relative;
                    display: flex;
                    align-items: baseline;
                    gap: clamp(10px, 1.2vw, 18px);
                    width: 100%;
                    background: none;
                    border: none;
                    padding: clamp(5px, 0.7vh, 9px) 0;
                    cursor: pointer;
                    text-align: left;
                    transform: translate3d(0, 8px, 0);
                    transition:
                        color 0.3s ease,
                        transform 0.65s cubic-bezier(0.22, 1, 0.36, 1);
                }

                .svc-menu--intro .svc-menu-btn {
                    transform: translate3d(0, 0, 0);
                }

                .svc-menu--intro .svc-menu-btn:nth-child(2) {
                    transition-delay: 0.04s;
                }
                .svc-menu--intro .svc-menu-btn:nth-child(3) {
                    transition-delay: 0.08s;
                }
                .svc-menu--intro .svc-menu-btn:nth-child(4) {
                    transition-delay: 0.12s;
                }
                .svc-menu--intro .svc-menu-btn:nth-child(5) {
                    transition-delay: 0.16s;
                }
                .svc-menu--intro .svc-menu-btn:nth-child(6) {
                    transition-delay: 0.2s;
                }
                .svc-menu--intro .svc-menu-btn:nth-child(7) {
                    transition-delay: 0.24s;
                }
                .svc-menu--intro .svc-menu-btn:nth-child(8) {
                    transition-delay: 0.28s;
                }

                .svc-menu-index {
                    font-family: "Cormorant Garamond", Georgia, serif;
                    font-size: clamp(10px, 0.75vw, 12px);
                    font-weight: 300;
                    letter-spacing: 0.12em;
                    color: rgba(255, 255, 255, 0.22);
                    min-width: 1.6em;
                    transition: color 0.3s ease;
                }

                .svc-menu-btn--active .svc-menu-index {
                    color: rgba(255, 255, 255, 0.55);
                }

                .svc-menu-label {
                    font-family: "Francy", serif;
                    font-weight: 400;
                    letter-spacing: -0.02em;
                    line-height: 1.1;
                    transition: font-size 0.45s
                        cubic-bezier(0.22, 1, 0.36, 1);
                }

                .svc-shell--overview .svc-menu-label {
                    font-size: clamp(26px, 3.4vw, 48px);
                }

                .svc-shell--detail .svc-menu-label {
                    font-size: clamp(17px, 1.65vw, 28px);
                }

                .svc-menu-line {
                    position: absolute;
                    left: -28px;
                    top: 50%;
                    width: 14px;
                    height: 1px;
                    background: #fff;
                    transform: scaleX(0);
                    transform-origin: left;
                    transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
                }

                .svc-menu-btn--active .svc-menu-line {
                    transform: scaleX(1);
                }

                .svc-menu-btn:hover {
                    color: rgba(255, 255, 255, 0.6) !important;
                }

                .svc-menu-btn--active:hover {
                    color: rgba(255, 255, 255, 1) !important;
                }

                .svc-detail {
                    position: relative;
                    min-height: clamp(260px, 38vh, 420px);
                    transition: opacity 0.3s ease;
                }

                .svc-panel {
                    display: grid;
                    grid-template-columns: minmax(0, 0.88fr) minmax(0, 1.15fr);
                    gap: clamp(24px, 3.5vw, 52px);
                    align-items: start;
                    animation: svcPanelIn 0.42s
                        cubic-bezier(0.22, 1, 0.36, 1) both;
                }

                @keyframes svcPanelIn {
                    from {
                        opacity: 0;
                        transform: translateY(14px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .svc-copy {
                    padding-top: 2px;
                }

                .svc-title {
                    font-family: "Francy", serif;
                    font-size: clamp(20px, 2vw, 32px);
                    font-weight: 400;
                    color: rgba(255, 255, 255, 0.92);
                    margin: 0 0 clamp(14px, 2vh, 22px);
                    letter-spacing: -0.02em;
                    line-height: 1.15;
                }

                .svc-desc {
                    font-family: "Cormorant Garamond", Georgia, serif;
                    font-size: clamp(14px, 1.12vw, 17px);
                    font-weight: 300;
                    color: rgba(255, 255, 255, 0.48);
                    line-height: 1.78;
                    margin: 0;
                    padding-left: 14px;
                    border-left: 1px solid rgba(255, 255, 255, 0.12);
                    text-align: left;
                }

                .svc-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: clamp(6px, 0.7vw, 10px);
                    border-radius: 6px;
                    overflow: hidden;
                    box-shadow:
                        0 24px 48px rgba(0, 0, 0, 0.45),
                        0 0 0 1px rgba(255, 255, 255, 0.04);
                }

                .svc-grid-cell {
                    position: relative;
                    aspect-ratio: 4 / 3;
                    background: #141414;
                    overflow: hidden;
                    animation: svcCellIn 0.5s cubic-bezier(0.22, 1, 0.36, 1)
                        both;
                }

                @keyframes svcCellIn {
                    from {
                        opacity: 0;
                        transform: scale(1.04);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }

                .svc-grid-cell :global(img) {
                    transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
                }

                .svc-grid-cell:hover :global(img) {
                    transform: scale(1.04);
                }

                @media (max-width: 900px) {
                    .svc-shell {
                        padding-left: clamp(24px, 5vw, 48px);
                        padding-right: clamp(24px, 5vw, 48px);
                    }

                    .svc-shell--detail .svc-body {
                        grid-template-columns: 1fr;
                        gap: 20px;
                        align-content: start;
                        overflow-y: auto;
                    }

                    .svc-shell--detail .svc-menu {
                        flex-direction: row;
                        flex-wrap: wrap;
                        gap: 8px 16px;
                        padding-left: 0;
                    }

                    .svc-rail,
                    .svc-menu-line {
                        display: none;
                    }

                    .svc-shell--detail .svc-menu-btn {
                        width: auto;
                    }

                    .svc-menu-index {
                        display: none;
                    }

                    .svc-panel {
                        grid-template-columns: 1fr;
                    }

                    .svc-grid {
                        max-width: 440px;
                    }
                }
            `}</style>
        </div>
    );
}
